import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../lib/auth';
import { Loader } from 'lucide-react';
import type { UserProfile } from '../lib/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('donor' | 'orphanage')[];
  redirectTo?: string;
  explicitUnauthorized?: boolean;
}

export function AuthGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/signin',
  explicitUnauthorized = false
}: AuthGuardProps) {
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    loading: boolean;
    session: Session | null;
    profile: UserProfile | null;
  }>({ loading: true, session: null, profile: null });

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        console.log('AuthGuard session:', session);
        
        if (!session?.user?.id) {
          if (isMounted) setAuthState({ loading: false, session: null, profile: null });
          return;
        }

        try {
          const profile = await authService.getProfile(session.user.id);
          console.log('AuthGuard profile:', profile);
          
          if (isMounted) setAuthState({ 
            loading: false, 
            session, 
            profile: profile || { 
              id: session.user.id, 
              email: session.user.email || '', 
              role: 'donor' 
            }
          });
        } catch (profileError) {
          console.error('Profile load error:', profileError);
          if (isMounted) setAuthState({ 
            loading: false, 
            session, 
            profile: { 
              id: session.user.id, 
              email: session.user.email || '', 
              role: 'donor' 
            }
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) setAuthState({ loading: false, session: null, profile: null });
      }
    };

    const setupAuthListener = async () => {
      const session = await authService.getSession();
      if (session?.user?.id) {
        const { data: { subscription: sub } } = authService.onAuthChange((event) => {
          console.log('Auth state changed:', event);
          if (event === 'SIGNED_OUT') {
            setAuthState({ loading: false, session: null, profile: null });
          } else {
            checkAuth();
          }
        });
        subscription = sub;
      }
    };

    checkAuth();
    setupAuthListener();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!authState.session) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Handle role-based authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = authState.profile?.role || 'donor'; // Default to donor if no role
    
    if (!allowedRoles.includes(userRole)) {
      if (explicitUnauthorized) {
        return <Navigate to="/unauthorized" replace />;
      }
      // Redirect to appropriate dashboard based on role
      return <Navigate to={userRole === 'donor' ? '/dashboard' : '/orphanage-dashboard'} replace />;
    }
  }

  return <>{children}</>;
}