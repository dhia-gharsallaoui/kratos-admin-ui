import type { OAuth2Client } from "@/services/hydra";

// UI-specific types for OAuth2 clients
export interface OAuth2ClientFormData {
	client_name: string;
	client_uri?: string;
	logo_uri?: string;
	contacts?: string[];
	grant_types: string[];
	response_types: string[];
	redirect_uris: string[];
	scope?: string;
	audience?: string[];
	owner?: string;
	policy_uri?: string;
	tos_uri?: string;
	subject_type?: "public" | "pairwise";
	token_endpoint_auth_method?: string;
	userinfo_signed_response_alg?: string;
	metadata?: Record<string, any>;
}

export interface OAuth2ClientTableRow extends OAuth2Client {
	id: string;
	displayName: string;
	createdDate?: string;
	updatedDate?: string;
	scopeList?: string[];
	redirectUrisList?: string[];
	grantTypesList?: string[];
}

export interface OAuth2ClientFilters {
	search?: string;
	owner?: string;
	grant_type?: string;
	created_after?: string;
	created_before?: string;
}

export interface OAuth2ClientStats {
	totalClients: number;
	activeClients: number;
	publicClients: number;
	confidentialClients: number;
	grantTypeDistribution: Record<string, number>;
	scopeDistribution: Record<string, number>;
}

// Form validation types
export interface OAuth2ClientFormErrors {
	client_name?: string;
	client_uri?: string;
	logo_uri?: string;
	contacts?: string;
	grant_types?: string;
	response_types?: string;
	redirect_uris?: string;
	scope?: string;
	audience?: string;
	owner?: string;
	policy_uri?: string;
	tos_uri?: string;
	metadata?: string;
}

// Available grant types and response types
export const OAUTH2_GRANT_TYPES = [
	"authorization_code",
	"client_credentials",
	"refresh_token",
	"implicit",
	"password",
	"urn:ietf:params:oauth:grant-type:jwt-bearer",
] as const;

export const OAUTH2_RESPONSE_TYPES = ["code", "token", "id_token", "code token", "code id_token", "token id_token", "code token id_token"] as const;

export const OAUTH2_SUBJECT_TYPES = ["public", "pairwise"] as const;

export const OAUTH2_TOKEN_ENDPOINT_AUTH_METHODS = [
	"client_secret_basic",
	"client_secret_post",
	"client_secret_jwt",
	"private_key_jwt",
	"none",
] as const;
