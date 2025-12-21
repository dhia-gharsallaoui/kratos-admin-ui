"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import CreateIdentityForm from "@/features/identities/components/CreateIdentityForm";

export default function CreateIdentityPage() {
	return (
		<ProtectedRoute requiredRole={UserRole.ADMIN}>
			<AdminLayout>
				<CreateIdentityForm />
			</AdminLayout>
		</ProtectedRoute>
	);
}
