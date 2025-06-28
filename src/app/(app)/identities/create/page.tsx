'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import CreateIdentityForm from '@/features/identities/components/CreateIdentityForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';

export default function CreateIdentityPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <CreateIdentityForm />
      </AdminLayout>
    </ProtectedRoute>
  );
}