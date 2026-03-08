import { apiClient } from "@/lib/api-client";

// Consent
export async function getOAuth2ConsentRequest(challenge: string) {
	return apiClient<{ data: any }>("/api/hydra/auth/consent", { params: { challenge } });
}

export async function acceptOAuth2ConsentRequest(challenge: string, body: any) {
	return apiClient<{ data: any }>("/api/hydra/auth/consent", { method: "POST", body: { challenge, body } });
}

export async function rejectOAuth2ConsentRequest(challenge: string, body: any) {
	return apiClient<{ data: any }>("/api/hydra/auth/consent", { method: "DELETE", body: { challenge, body } });
}

// Login
export async function getOAuth2LoginRequest(challenge: string) {
	return apiClient<{ data: any }>("/api/hydra/auth/login", { params: { challenge } });
}

export async function acceptOAuth2LoginRequest(challenge: string, body: any) {
	return apiClient<{ data: any }>("/api/hydra/auth/login", { method: "POST", body: { challenge, body } });
}

export async function rejectOAuth2LoginRequest(challenge: string, body: any) {
	return apiClient<{ data: any }>("/api/hydra/auth/login", { method: "DELETE", body: { challenge, body } });
}

// Logout
export async function getOAuth2LogoutRequest(challenge: string) {
	return apiClient<{ data: any }>("/api/hydra/auth/logout", { params: { challenge } });
}

export async function acceptOAuth2LogoutRequest(challenge: string) {
	return apiClient<{ data: any }>("/api/hydra/auth/logout", { method: "POST", body: { challenge } });
}

export async function rejectOAuth2LogoutRequest(challenge: string) {
	return apiClient<{ data: any }>("/api/hydra/auth/logout", { method: "DELETE", body: { challenge } });
}

// Consent Sessions
export async function listOAuth2ConsentSessions(params: { subject?: string; page_size?: number; page_token?: string; login_session_id?: string }) {
	return apiClient<{ data: any[] }>("/api/hydra/auth/consent-sessions", { params });
}

export async function revokeOAuth2ConsentSessions(subject: string, client?: string, all?: boolean) {
	return apiClient<{ data: any }>("/api/hydra/auth/consent-sessions", {
		method: "DELETE",
		body: { subject, client, all },
	});
}
