"use client";

import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useIsAuthenticated, useIsAuthLoading } from "@/features/auth/hooks/useAuth";

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const isAuthenticated = useIsAuthenticated();
	const isLoading = useIsAuthLoading();
	const router = useRouter();
	const pathname = usePathname();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		// Wait for auth state to be loaded
		if (!isLoading) {
			// If not authenticated and not on login page, redirect to login
			if (!isAuthenticated && pathname !== "/login") {
				router.push("/login");
			}

			// If authenticated and on login page, redirect to dashboard
			if (isAuthenticated && pathname === "/login") {
				router.push("/dashboard");
			}

			// Set initializing to false after initial auth check and redirects
			setIsInitializing(false);
		}
	}, [isAuthenticated, pathname, router, isLoading]);

	// Show loading spinner during initialization
	if (isLoading || isInitializing) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return <>{children}</>;
}
