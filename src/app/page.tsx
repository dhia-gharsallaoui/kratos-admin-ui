"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsAuthenticated } from "@/features/auth/hooks/useAuth";

export default function Home() {
	const router = useRouter();
	const isAuthenticated = useIsAuthenticated();

	useEffect(() => {
		// Redirect to dashboard if authenticated, otherwise to login
		if (isAuthenticated) {
			router.push("/dashboard");
		} else {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	return null; // No UI needed as we're redirecting
}
