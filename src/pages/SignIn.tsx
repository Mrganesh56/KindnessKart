import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Building2, User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function SignIn() {
  const navigate = useNavigate();
  const { signIn, error: authError, clearError } = useAuthStore();
  const [role, setRole] = useState<'donor' | 'orphanage' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setError('');
    clearError();
    setLoading(true);

    try {
      await signIn(email, password, role);
      // Navigate based on role
      navigate(role === 'donor' ? '/donor/dashboard' : '/orphanage/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
          Login to KindnessKart
        </h2>
        <p className="mt-2 text-center text-sm text-secondary/80">
          Or{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!role ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary text-center mb-6">
                Choose your role
              </h3>
              <button
                onClick={() => setRole('donor')}
                className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                <User className="h-6 w-6 mr-2" />
                Login as Donor
              </button>
              <button
                onClick={() => setRole('orphanage')}
                className="w-full flex items-center justify-center px-4 py-4 border border-secondary/20 rounded-md shadow-sm text-lg font-medium text-secondary bg-white hover:bg-background transition-colors"
              >
                <Building2 className="h-6 w-6 mr-2" />
                Login as Orphanage
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-accent/50 focus:outline-none focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-accent rounded-md shadow-sm placeholder-accent/50 focus:outline-none focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {(error || authError) && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{error || authError}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRole(null);
                    setError('');
                    clearError();
                  }}
                  className="font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  ← Change role
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}