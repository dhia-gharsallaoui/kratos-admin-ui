'use client';

import { Suspense, lazy } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const IdentitiesTable = lazy(() => import('@/features/identities/components/IdentitiesTable'));

export default function IdentitiesPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <Suspense fallback={<LoadingSkeleton variant="page" />}>
          <IdentitiesTable />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
