import { useState, useEffect } from 'react';
import { IUser } from '@/types/models';
import { mongoDBService } from '@/services/mongodb';

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await mongoDBService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading current user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    setUser,
    loadCurrentUser,
  };
} 