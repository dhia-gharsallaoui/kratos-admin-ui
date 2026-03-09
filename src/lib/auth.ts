import { randomUUID } from "node:crypto";

export enum UserRole {
	ADMIN = "admin",
	VIEWER = "viewer",
}

export interface SessionData {
	username: string;
	role: UserRole;
	displayName: string;
	createdAt: number;
}

const SESSION_COOKIE_NAME = "kratos-admin-session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store
const sessions = new Map<string, SessionData>();

function isAuthDisabled(): boolean {
	return process.env.AUTH_DISABLED === "true";
}

function getConfiguredCredentials(): { username: string; password: string } | null {
	const username = process.env.ADMIN_USERNAME;
	const password = process.env.ADMIN_PASSWORD;
	if (!username || !password) return null;
	return { username, password };
}

function getConfiguredViewerCredentials(): { username: string; password: string } | null {
	const username = process.env.VIEWER_USERNAME;
	const password = process.env.VIEWER_PASSWORD;
	if (!username || !password) return null;
	return { username, password };
}

export function validateCredentials(username: string, password: string): SessionData | null {
	if (isAuthDisabled()) {
		return { username: username || "admin", role: UserRole.ADMIN, displayName: "Admin", createdAt: Date.now() };
	}

	const creds = getConfiguredCredentials();
	if (!creds) {
		console.warn("ADMIN_USERNAME and ADMIN_PASSWORD env vars not set. Authentication will fail.");
		return null;
	}

	if (username === creds.username && password === creds.password) {
		return { username, role: UserRole.ADMIN, displayName: "Administrator", createdAt: Date.now() };
	}

	const viewerCreds = getConfiguredViewerCredentials();
	if (viewerCreds && username === viewerCreds.username && password === viewerCreds.password) {
		return { username, role: UserRole.VIEWER, displayName: "Viewer", createdAt: Date.now() };
	}

	return null;
}

export function createSession(data: SessionData): string {
	// Clean expired sessions periodically
	cleanExpiredSessions();

	const token = randomUUID();
	sessions.set(token, data);
	return token;
}

export function getSession(token: string): SessionData | null {
	const session = sessions.get(token);
	if (!session) return null;

	// Check expiry
	if (Date.now() - session.createdAt > SESSION_EXPIRY_MS) {
		sessions.delete(token);
		return null;
	}

	return session;
}

export function deleteSession(token: string): void {
	sessions.delete(token);
}

function cleanExpiredSessions(): void {
	const now = Date.now();
	for (const [token, session] of sessions) {
		if (now - session.createdAt > SESSION_EXPIRY_MS) {
			sessions.delete(token);
		}
	}
}

/** Extract session token from request cookies */
export function getSessionFromRequest(request: Request): SessionData | null {
	if (isAuthDisabled()) {
		return { username: "admin", role: UserRole.ADMIN, displayName: "Admin", createdAt: Date.now() };
	}

	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;

	const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
	if (!match) return null;

	return getSession(match[1]);
}

/** Cookie options for the session cookie */
export function getSessionCookieHeader(token: string): string {
	return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(SESSION_EXPIRY_MS / 1000)}`;
}

export function getClearSessionCookieHeader(): string {
	return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export { SESSION_COOKIE_NAME };
