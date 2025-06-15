import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { mongoDBService } from '@/services/mongodb';
import { IUser } from '@/types/models';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: IUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, [navigate]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUser();
      } else {
        // Only redirect if we're not already on login/register pages
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Only redirect on auth error if not on login/register pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await mongoDBService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error; // Re-throw to be handled by caller
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await mongoDBService.login(email, password);
      setUser(response.user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await mongoDBService.register({ name, email, password });
      setUser(response.user);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData: IUser) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const userData = await fetchUser();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext }; 