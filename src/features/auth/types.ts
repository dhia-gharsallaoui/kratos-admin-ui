// Define user roles
export enum UserRole {
	ADMIN = "admin",
	VIEWER = "viewer",
}

export interface UserCredentials {
	username: string;
	password: string;
	role: UserRole;
	displayName: string;
	email: string;
}

export interface AuthUser {
	username: string;
	role: UserRole;
	displayName: string;
	email: string;
}

export interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
}

export interface LoginCredentials {
	username: string;
	password: string;
}
