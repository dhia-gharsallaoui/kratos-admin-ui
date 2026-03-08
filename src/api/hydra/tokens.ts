import { apiClient } from "@/lib/api-client";

export interface IntrospectTokenRequest {
	token: string;
	scope?: string;
}

export interface RevokeTokenRequest {
	token: string;
	client_id?: string;
	client_secret?: string;
}

export interface TokenExchangeRequest {
	grant_type: string;
	client_id?: string;
	code?: string;
	redirect_uri?: string;
	refresh_token?: string;
	[key: string]: any;
}

export async function introspectOAuth2Token(data: IntrospectTokenRequest) {
	return apiClient<{ data: any }>("/api/hydra/tokens/introspect", { method: "POST", body: data });
}

export async function revokeOAuth2Token(data: RevokeTokenRequest) {
	return apiClient<{ data: any }>("/api/hydra/tokens/revoke", { method: "POST", body: data });
}

export async function exchangeOAuth2Token(data: TokenExchangeRequest) {
	return apiClient<{ data: any }>("/api/hydra/tokens/exchange", { method: "POST", body: data });
}

export async function deleteOAuth2AccessTokens(clientId: string) {
	return apiClient(`/api/hydra/tokens/${clientId}`, { method: "DELETE" });
}

export async function flushInactiveOAuth2Tokens(_notAfter?: string) {
	throw new Error("Flush inactive tokens endpoint not available in official client");
}
