// // src/components/AuthGuard.tsx
// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { authService } from '../lib/auth';
// import { Loader } from 'lucide-react';

// interface AuthGuardProps {
//   children: React.ReactNode;
//   allowedRoles?: ('donor' | 'orphanage')[];
// }

// export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
//   const location = useLocation();
//   const [state, setState] = useState<{
//     loading: boolean;
//     session: Session | null;
//     profile: UserProfile | null;
//   }>({ loading: true, session: null, profile: null });

//   useEffect(() => {
//     let mounted = true;

//     const checkAuth = async () => {
//       try {
//         const session = await authService.getSession();
//         if (!session) {
//           if (mounted) setState({ loading: false, session: null, profile: null });
//           return;
//         }

//         const profile = await authService.getProfile(session.user.id);
//         if (mounted) setState({ loading: false, session, profile });
//       } catch (error) {
//         if (mounted) setState({ loading: false, session: null, profile: null });
//       }
//     };

//     const { data: { subscription } } = authService.onAuthChange((event) => {
//       if (event === 'SIGNED_OUT') {
//         setState({ loading: false, session: null, profile: null });
//       } else {
//         checkAuth();
//       }
//     });

//     checkAuth();
//     return () => {
//       mounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   if (state.loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader className="h-8 w-8 text-primary animate-spin" />
//       </div>
//     );
//   }

//   if (!state.session) {
//     return <Navigate to="/signin" state={{ from: location }} replace />;
//   }

//   if (allowedRoles && state.profile && !allowedRoles.includes(state.profile.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// }

// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { authService } from '../lib/auth';
// import { Loader } from 'lucide-react';
// import type { UserProfile } from '../lib/auth';

// interface AuthGuardProps {
//   children: React.ReactNode;
//   allowedRoles?: ('donor' | 'orphanage')[];
//   redirectTo?: string;
// }

// export function AuthGuard({ 
//   children, 
//   allowedRoles, 
//   redirectTo = '/signin' 
// }: AuthGuardProps) {
//   const location = useLocation();
//   const [authState, setAuthState] = useState<{
//     loading: boolean;
//     session: Session | null;
//     profile: UserProfile | null;
//   }>({ loading: true, session: null, profile: null });

//   useEffect(() => {
//     let isMounted = true;

//     const checkAuth = async () => {
//       try {
//         const session = await authService.getSession();
//         if (!session) {
//           if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//           return;
//         }

//         const profile = await authService.getProfile(session.user.id);
//         if (isMounted) setAuthState({ loading: false, session, profile });
//       } catch (error) {
//         if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//       }
//     };

//     const { data: { subscription } } = authService.onAuthChange((event) => {
//       if (event === 'SIGNED_OUT') {
//         setAuthState({ loading: false, session: null, profile: null });
//       } else {
//         checkAuth();
//       }
//     });

//     checkAuth();
//     return () => {
//       isMounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   if (authState.loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader className="animate-spin h-8 w-8 text-primary" />
//       </div>
//     );
//   }

//   if (!authState.session) {
//     return <Navigate to={redirectTo} state={{ from: location }} replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(authState.profile?.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// }

// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { authService } from '../lib/auth';
// import { Loader } from 'lucide-react';
// import type { UserProfile } from '../lib/auth';

// interface AuthGuardProps {
//   children: React.ReactNode;
//   allowedRoles?: ('donor' | 'orphanage')[];
//   redirectTo?: string;
//   // Add explicitUnauthorized prop for custom unauthorized handling
//   explicitUnauthorized?: boolean;
// }

// export function AuthGuard({ 
//   children, 
//   allowedRoles, 
//   redirectTo = '/signin',
//   explicitUnauthorized = false
// }: AuthGuardProps) {
//   const location = useLocation();
//   const [authState, setAuthState] = useState<{
//     loading: boolean;
//     session: Session | null;
//     profile: UserProfile | null;
//   }>({ loading: true, session: null, profile: null });

//   useEffect(() => {
//     let isMounted = true;

//     const checkAuth = async () => {
//       try {
//         const session = await authService.getSession();
//         if (!session) {
//           if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//           return;
//         }

//         const profile = await authService.getProfile(session.user.id);
//         if (isMounted) setAuthState({ loading: false, session, profile });
//       } catch (error) {
//         if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//       }
//     };

//     const { data: { subscription } } = authService.onAuthChange((event) => {
//       if (event === 'SIGNED_OUT') {
//         setAuthState({ loading: false, session: null, profile: null });
//       } else {
//         checkAuth();
//       }
//     });

//     checkAuth();
//     return () => {
//       isMounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   if (authState.loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader className="animate-spin h-8 w-8 text-primary" />
//       </div>
//     );
//   }

//   if (!authState.session) {
//     return <Navigate to={redirectTo} state={{ from: location }} replace />;
//   }

//   // Enhanced role checking with explicit unauthorized handling
//   if (allowedRoles) {
//     if (!authState.profile?.role) {
//       return <Navigate to="/unauthorized" replace />;
//     }
    
//     if (!allowedRoles.includes(authState.profile.role)) {
//       if (explicitUnauthorized) {
//         return <Navigate to="/unauthorized" replace />;
//       }
//       // For non-explicit cases, redirect to the appropriate dashboard
//       return authState.profile.role === 'donor' 
//         ? <Navigate to="/dashboard" replace />
//         : <Navigate to="/orphanage-dashboard" replace />;
//     }
//   }

//   return <>{children}</>;
// }

// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { authService } from '../lib/auth';
// import { Loader } from 'lucide-react';
// import type { UserProfile } from '../lib/auth';
// import type { Session } from '@supabase/supabase-js'; // or your auth service

// interface AuthGuardProps {
//   children: React.ReactNode;
//   allowedRoles?: ('donor' | 'orphanage')[];
//   redirectTo?: string;
//   explicitUnauthorized?: boolean;
// }

// export function AuthGuard({ 
//   children, 
//   allowedRoles, 
//   redirectTo = '/signin',
//   explicitUnauthorized = false
// }: AuthGuardProps) {
//   const location = useLocation();
//   const [authState, setAuthState] = useState<{
//     loading: boolean;
//     session: Session | null;
//     profile: UserProfile | null;
//   }>({ loading: true, session: null, profile: null });

//   useEffect(() => {
//     let isMounted = true;
// // In your checkAuth function:
// // Modify the profile fetching logic:
// const checkAuth = async () => {
//   try {
//     const session = await authService.getSession();
//     if (!session?.user?.id) {
//       if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//       return;
//     }

//     try {
//       const profile = await authService.getProfile(session.user.id);
//       if (!profile) throw new Error('Profile not found');
      
//       if (isMounted) setAuthState({ loading: false, session, profile });
//     } catch (profileError) {
//       console.error('Profile load error:', profileError);
//       // Create minimal profile if doesn't exist
//       const minimalProfile = {
//         id: session.user.id,
//         email: session.user.email,
//         role: 'donor' // Default role
//       };
//       if (isMounted) setAuthState({ loading: false, session, profile: minimalProfile });
//     }
//   } catch (error) {
//     console.error('Auth check error:', error);
//     if (isMounted) setAuthState({ loading: false, session: null, profile: null });
//   }
// };

//     const { data: { subscription } } = authService.onAuthChange((event) => {
//       console.log('Auth state changed:', event); // Debug log
//       if (event === 'SIGNED_OUT') {
//         setAuthState({ loading: false, session: null, profile: null });
//       } else {
//         checkAuth();
//       }
//     });

//     checkAuth();
//     return () => {
//       isMounted = false;
//       subscription?.unsubscribe();
//     };
//   }, []);

//   console.log('AuthGuard render state:', authState); // Debug log

//   if (authState.loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader className="animate-spin h-8 w-8 text-primary" />
//       </div>
//     );
//   }

//   if (!authState.session) {
//     return <Navigate to={redirectTo} state={{ from: location }} replace />;
//   }

//   // Enhanced role checking
//   if (allowedRoles && allowedRoles.length > 0) {
//     const userRole = authState.profile?.role;
    
//     if (!userRole) {
//       console.warn('User has no role assigned'); // Debug log
//       return <Navigate to="/unauthorized" replace />;
//     }
    
//     if (!allowedRoles.includes(userRole)) {
//       console.warn(`User role ${userRole} not in allowed roles`, allowedRoles); // Debug log
//       if (explicitUnauthorized) {
//         return <Navigate to="/unauthorized" replace />;
//       }
//       const defaultRoute = userRole === 'donor' 
//         ? '/dashboard' 
//         : '/orphanage-dashboard';
//       return <Navigate to={defaultRoute} replace />;
//     }
//   }

//   return <>{children}</>;
// }

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