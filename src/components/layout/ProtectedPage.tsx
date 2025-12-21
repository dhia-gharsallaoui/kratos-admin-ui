"use client";

import type React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import type { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

export interface ProtectedPageProps {
	requiredRole?: UserRole;
	children: React.ReactNode;
	layout?: boolean;
}

export function ProtectedPage({ requiredRole, children, layout = true }: ProtectedPageProps) {
	const content = layout ? <AdminLayout>{children}</AdminLayout> : children;

	if (requiredRole) {
		return <ProtectedRoute requiredRole={requiredRole}>{content}</ProtectedRoute>;
	}

	return <>{content}</>;
}

ProtectedPage.displayName = "ProtectedPage";
