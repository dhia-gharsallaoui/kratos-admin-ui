'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import IdentitiesTable from '@/features/identities/components/IdentitiesTable';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/config/users';

export default function IdentitiesPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <IdentitiesTable />
      </AdminLayout>
    </ProtectedRoute>
  );
}
