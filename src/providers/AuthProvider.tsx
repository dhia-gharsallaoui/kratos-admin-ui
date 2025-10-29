'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useIsAuthLoading } from '@/features/auth/hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsAuthLoading();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth state to be loaded
    if (!isLoading) {
      // If not authenticated and not on login page, redirect to login
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }

      // If authenticated and on login page, redirect to dashboard
      if (isAuthenticated && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, router, isLoading]);

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
