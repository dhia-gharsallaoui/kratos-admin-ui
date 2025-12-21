import type { IntrospectedOAuth2Token } from "@/services/hydra";

// UI-specific types for OAuth2 tokens
export interface OAuth2TokenTableRow {
	id: string;
	tokenType: "access" | "refresh" | "id";
	subject?: string;
	clientId?: string;
	scope?: string;
	audience?: string[];
	issuedAt?: string;
	expiresAt?: string;
	isActive: boolean;
	isExpired: boolean;
	timeToExpiry?: string;
}

export interface OAuth2TokenDetails extends IntrospectedOAuth2Token {
	tokenPreview?: string;
	formattedScopes?: string[];
	formattedAudience?: string[];
	issuedAtFormatted?: string;
	expiresAtFormatted?: string;
	tokenTypeFormatted?: string;
	statusInfo?: {
		isActive: boolean;
		isExpired: boolean;
		timeToExpiry?: string;
		expiryPercentage?: number;
	};
}

export interface OAuth2TokenFilters {
	search?: string;
	token_type?: "access_token" | "refresh_token" | "id_token";
	active?: boolean;
	expired?: boolean;
	client_id?: string;
	subject?: string;
	scope?: string;
	issued_after?: string;
	issued_before?: string;
	expires_after?: string;
	expires_before?: string;
}

export interface OAuth2TokenStats {
	totalTokens: number;
	activeTokens: number;
	expiredTokens: number;
	revokedTokens: number;
	tokenTypeDistribution: Record<string, number>;
	clientDistribution: Record<string, number>;
	scopeDistribution: Record<string, number>;
	averageTokenLifetime?: number;
	tokensExpiringIn24h?: number;
	tokensExpiringIn7d?: number;
}

// Forms for token operations
export interface IntrospectTokenFormData {
	token: string;
	scope?: string;
}

export interface RevokeTokenFormData {
	token: string;
	client_id?: string;
	client_secret?: string;
}

export interface TokenExchangeFormData {
	grant_type: string;
	client_id?: string;
	client_secret?: string;
	scope?: string;
	audience?: string;
	subject_token?: string;
	subject_token_type?: string;
	actor_token?: string;
	actor_token_type?: string;
	requested_token_type?: string;
}

export interface FlushTokensFormData {
	notAfter?: string;
	confirmText?: string;
}

// Form validation types
export interface TokenFormErrors {
	token?: string;
	client_id?: string;
	client_secret?: string;
	scope?: string;
	audience?: string;
	grant_type?: string;
	notAfter?: string;
	confirmText?: string;
}

// Available grant types for token exchange
export const TOKEN_EXCHANGE_GRANT_TYPES = [
	"authorization_code",
	"client_credentials",
	"refresh_token",
	"password",
	"urn:ietf:params:oauth:grant-type:token-exchange",
	"urn:ietf:params:oauth:grant-type:jwt-bearer",
	"urn:ietf:params:oauth:grant-type:saml2-bearer",
] as const;

// Available token types
export const TOKEN_TYPES = [
	"urn:ietf:params:oauth:token-type:access_token",
	"urn:ietf:params:oauth:token-type:refresh_token",
	"urn:ietf:params:oauth:token-type:id_token",
	"urn:ietf:params:oauth:token-type:jwt",
] as const;

// Token status types
export type TokenStatus = "active" | "expired" | "revoked" | "inactive";

// Time periods for expiry analysis
export const EXPIRY_PERIODS = [
	{ label: "1 hour", value: 3600 },
	{ label: "24 hours", value: 86400 },
	{ label: "7 days", value: 604800 },
	{ label: "30 days", value: 2592000 },
] as const;
