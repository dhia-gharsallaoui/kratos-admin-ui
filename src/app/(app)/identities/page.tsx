'use client';

import { Suspense, lazy } from 'react';
import { Box } from '@/components/ui';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Group } from '@mui/icons-material';

const IdentitiesTable = lazy(() => import('@/features/identities/components/IdentitiesTable'));

export default function IdentitiesPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <PageHeader
            title="Identities"
            subtitle="Manage user identities in your Kratos instance"
            icon={<Group sx={{ fontSize: 32, color: 'white' }} />}
          />
          <Suspense fallback={<LoadingSkeleton variant="page" />}>
            <IdentitiesTable />
          </Suspense>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
