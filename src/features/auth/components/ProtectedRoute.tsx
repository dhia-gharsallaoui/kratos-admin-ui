'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useHasPermission } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const hasPermission = useHasPermission();

  useEffect(() => {
    // Only check role-based permissions since authentication is handled by AuthProvider
    if (isAuthenticated && requiredRole && !hasPermission(requiredRole)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasPermission, requiredRole, router]);

  // If role is required and user doesn't have permission, don't render children
  if (requiredRole && !hasPermission(requiredRole)) {
    return null;
  }

  // Render children
  return <>{children}</>;
}
