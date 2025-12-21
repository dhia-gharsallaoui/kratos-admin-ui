import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AuthUser, UserRole } from "../types";
import { findUserByCredentials, toAuthUser } from "../utils";

// Define auth store interface
interface AuthStoreState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	hasPermission: (requiredRole: UserRole) => boolean;
	setLoading: (isLoading: boolean) => void;
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
				// Find user from our config
				const userRecord = findUserByCredentials(username, password);

				if (userRecord) {
					const user = toAuthUser(userRecord);
					set({ user, isAuthenticated: true });
					return true;
				}

				return false;
			},

			logout: () => {
				set({ user: null, isAuthenticated: false });
			},

			hasPermission: (requiredRole: UserRole) => {
				const { user } = get();

				if (!user) return false;

				// Admin can access everything
				if (user.role === UserRole.ADMIN) return true;

				// Check if user has the required role
				return user.role === requiredRole;
			},
		}),
		{
			name: "kratos-admin-auth",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				// When storage is rehydrated, set loading to false
				if (state) {
					// Check if login should be disabled (for testing/screenshots)
					const disableLogin = process.env.NEXT_PUBLIC_DISABLE_LOGIN === "true";

					if (disableLogin && !state.isAuthenticated) {
						// Auto-login as admin user
						const adminUser = findUserByCredentials("admin", "admin123");
						if (adminUser) {
							const user = toAuthUser(adminUser);
							state.user = user;
							state.isAuthenticated = true;
						}
					}

					state.setLoading(false);
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
// Re-export types for easier access
export { UserRole } from "../types";
