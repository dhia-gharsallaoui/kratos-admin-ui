"use client";

import { Group } from "@mui/icons-material";
import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/layout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Box } from "@/components/ui";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

const IdentitiesTable = lazy(() => import("@/features/identities/components/IdentitiesTable"));

export default function IdentitiesPage() {
	return (
		<ProtectedRoute requiredRole={UserRole.ADMIN}>
			<AdminLayout>
				<Box sx={{ p: 3 }}>
					<PageHeader
						title="Identities"
						subtitle="Manage user identities in your Kratos instance"
						icon={<Group sx={{ fontSize: 32, color: "white" }} />}
					/>
					<Suspense fallback={<LoadingSkeleton variant="page" />}>
						<IdentitiesTable />
					</Suspense>
				</Box>
			</AdminLayout>
		</ProtectedRoute>
	);
}
