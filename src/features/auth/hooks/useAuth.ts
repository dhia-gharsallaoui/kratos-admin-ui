"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types";
import { UserRole } from "../types";

// Define auth store interface
interface AuthStoreState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	hasPermission: (requiredRole: UserRole) => boolean;
	setLoading: (isLoading: boolean) => void;
	validateSession: () => Promise<void>;
}

// Create auth store with persistence
export const useAuthStore = create<AuthStoreState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,

			setLoading: (isLoading: boolean) => set({ isLoading }),

			login: async (username: string, password: string) => {
				try {
					const response = await fetch("/api/auth/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ username, password }),
					});

					if (!response.ok) {
						return false;
					}

					const data = await response.json();
					const user: AuthUser = {
						username: data.user.username,
						role: data.user.role as UserRole,
						displayName: data.user.displayName,
						email: data.user.email || "",
					};
					set({ user, isAuthenticated: true });
					return true;
				} catch {
					return false;
				}
			},

			logout: async () => {
				try {
					await fetch("/api/auth/logout", { method: "POST" });
				} catch {
					// Ignore network errors during logout
				}
				set({ user: null, isAuthenticated: false });
			},

			hasPermission: (requiredRole: UserRole) => {
				const { user } = get();
				if (!user) return false;
				if (user.role === UserRole.ADMIN) return true;
				return user.role === requiredRole;
			},

			validateSession: async () => {
				try {
					const response = await fetch("/api/auth/me");
					if (response.ok) {
						const data = await response.json();
						set({
							user: {
								username: data.user.username,
								role: data.user.role as UserRole,
								displayName: data.user.displayName,
								email: data.user.email || "",
							},
							isAuthenticated: true,
							isLoading: false,
						});
					} else {
						set({ user: null, isAuthenticated: false, isLoading: false });
					}
				} catch {
					// If server is unreachable, keep existing localStorage state
					set({ isLoading: false });
				}
			},
		}),
		{
			name: "kratos-admin-auth",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					// Validate server-side session after rehydration
					state.validateSession();
				}
			},
		},
	),
);

// Hooks for easier access to auth store
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useLogin = () => useAuthStore((state) => state.login);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useHasPermission = () => useAuthStore((state) => state.hasPermission);

export type { AuthUser, UserCredentials } from "../types";
export { UserRole } from "../types";
