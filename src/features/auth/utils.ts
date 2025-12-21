import { type AuthUser, type UserCredentials, UserRole } from "./types";

// Mock user database
export const USERS: UserCredentials[] = [
	{
		username: "admin",
		password: "admin123",
		role: UserRole.ADMIN,
		displayName: "Administrator",
		email: "admin@example.com",
	},
	{
		username: "viewer",
		password: "viewer123",
		role: UserRole.VIEWER,
		displayName: "Viewer User",
		email: "viewer@example.com",
	},
];

/**
 * Find a user by username and password
 * @param username The username to search for
 * @param password The password to verify
 * @returns The user credentials if found, undefined otherwise
 */
export const findUserByCredentials = (username: string, password: string): UserCredentials | undefined => {
	return USERS.find((user) => user.username === username && user.password === password);
};

/**
 * Convert user credentials to auth user (without password)
 * @param credentials User credentials
 * @returns Auth user object
 */
export const toAuthUser = (credentials: UserCredentials): AuthUser => {
	const { password, ...authUser } = credentials;
	return authUser;
};

/**
 * Check if user has admin role
 * @param user Auth user
 * @returns True if user is admin
 */
export const isAdmin = (user: AuthUser | null): boolean => {
	return user?.role === "admin";
};

/**
 * Check if user has viewer role or higher
 * @param user Auth user
 * @returns True if user can view content
 */
export const canView = (user: AuthUser | null): boolean => {
	return user?.role === "admin" || user?.role === "viewer";
};
