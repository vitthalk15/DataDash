import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/ui/form";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 p-6 sm:p-8 bg-card rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-destructive text-center">{error}</div>
          )}
          <div className="space-y-4">
            <FormInputWrapper label="Email address" required>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-responsive"
                placeholder="Enter your email"
              />
            </FormInputWrapper>
            <FormInputWrapper label="Password" required>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-responsive"
                placeholder="Enter your password"
              />
            </FormInputWrapper>
          </div>

          <div>
            <Button type="submit" className="btn-primary w-full">
              Sign in
            </Button>
          </div>
          
          {/* Development: Quick login button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("password123");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Quick Login (Dev)
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/90 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
