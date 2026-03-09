import { type AuthUser, UserRole } from "./types";

/**
 * Check if user has admin role
 */
export const isAdmin = (user: AuthUser | null): boolean => {
	return user?.role === UserRole.ADMIN;
};

/**
 * Check if user has viewer role or higher
 */
export const canView = (user: AuthUser | null): boolean => {
	return user?.role === UserRole.ADMIN || user?.role === UserRole.VIEWER;
};
