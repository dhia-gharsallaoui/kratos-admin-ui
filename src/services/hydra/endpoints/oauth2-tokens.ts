import { withApiErrorHandling } from "@/utils/api-wrapper";
import { getAdminOAuth2Api, getPublicOAuth2Api } from "../client";

// OAuth2 Token operations

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

// Introspect OAuth2 token
export async function introspectOAuth2Token(tokenData: IntrospectTokenRequest) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().introspectOAuth2Token({
			token: tokenData.token,
			scope: tokenData.scope,
		});
		return { data: response.data };
	}, "Hydra");
}

// Revoke OAuth2 token
export async function revokeOAuth2Token(tokenData: RevokeTokenRequest) {
	return withApiErrorHandling(async () => {
		const response = await getPublicOAuth2Api().revokeOAuth2Token({
			token: tokenData.token,
			clientId: tokenData.client_id,
			clientSecret: tokenData.client_secret,
		});
		return { data: response.data };
	}, "Hydra");
}

// Exchange tokens (OAuth2 token endpoint)
export async function exchangeOAuth2Token(tokenData: TokenExchangeRequest) {
	return withApiErrorHandling(async () => {
		const response = await getPublicOAuth2Api().oauth2TokenExchange({
			grantType: tokenData.grant_type,
			clientId: tokenData.client_id,
			code: tokenData.code,
			redirectUri: tokenData.redirect_uri,
			refreshToken: tokenData.refresh_token,
		});
		return { data: response.data };
	}, "Hydra");
}

// Delete OAuth2 access tokens for a client
export async function deleteOAuth2AccessTokens(clientId: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().deleteOAuth2Token({ clientId });
		return { data: response.data };
	}, "Hydra");
}

// Flush inactive OAuth2 tokens (Note: This method may not be available in the official client)
export async function flushInactiveOAuth2Tokens(_notAfter?: string) {
	// This endpoint might not be available in the official Hydra client
	// Check the official documentation for availability
	throw new Error("Flush inactive tokens endpoint not available in official client");
}

// Get OAuth2 token metadata (if supported)
export async function getOAuth2TokenMetadata(tokenId: string) {
	return withApiErrorHandling(async () => {
		// Note: This might not be available in the official client
		// Check the actual API for availability
		const response = await getAdminOAuth2Api().introspectOAuth2Token({
			token: tokenId,
		});
		return { data: response.data };
	}, "Hydra");
}
