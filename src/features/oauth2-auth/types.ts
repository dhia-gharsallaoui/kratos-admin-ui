import type { OAuth2ConsentRequest, OAuth2LoginRequest } from "@/services/hydra";

// UI-specific types for OAuth2 auth flows
export interface OAuth2AuthFlowTableRow {
	id: string;
	type: "consent" | "login" | "logout";
	challenge: string;
	subject?: string;
	clientId?: string;
	clientName?: string;
	requestedScopes?: string[];
	requestUrl?: string;
	skip?: boolean;
	status: "pending" | "accepted" | "rejected" | "expired";
	createdAt?: string;
	handledAt?: string;
}

export interface OAuth2ConsentRequestDetails extends OAuth2ConsentRequest {
	displayScopes?: ScopeInfo[];
	clientInfo?: {
		name?: string;
		logoUri?: string;
		policyUri?: string;
		tosUri?: string;
		contacts?: string[];
	};
	sessionInfo?: {
		loginSessionId?: string;
		authMethods?: string[];
		authTime?: string;
	};
}

export interface OAuth2LoginRequestDetails extends OAuth2LoginRequest {
	clientInfo?: {
		name?: string;
		logoUri?: string;
		policyUri?: string;
		tosUri?: string;
	};
	oidcInfo?: {
		acrValues?: string[];
		display?: string;
		idTokenHintClaims?: Record<string, any>;
		loginHint?: string;
		uiLocales?: string[];
	};
}

export interface ScopeInfo {
	name: string;
	displayName: string;
	description: string;
	required: boolean;
}

export interface OAuth2AuthFlowFilters {
	search?: string;
	type?: "consent" | "login" | "logout";
	status?: "pending" | "accepted" | "rejected" | "expired";
	subject?: string;
	client_id?: string;
	created_after?: string;
	created_before?: string;
}

export interface OAuth2AuthFlowStats {
	totalRequests: number;
	pendingRequests: number;
	acceptedRequests: number;
	rejectedRequests: number;
	typeDistribution: Record<"consent" | "login" | "logout", number>;
	clientDistribution: Record<string, number>;
	averageProcessingTime?: number;
}

// Form types for accepting/rejecting requests
export interface AcceptConsentFormData {
	grantScope: string[];
	grantAccessTokenAudience: string[];
	remember: boolean;
	rememberFor: number;
	accessTokenClaims?: Record<string, any>;
	idTokenClaims?: Record<string, any>;
}

export interface AcceptLoginFormData {
	subject: string;
	remember: boolean;
	rememberFor: number;
	acr?: string;
	amr?: string[];
	context?: Record<string, any>;
	extendSessionLifespan?: boolean;
	forceSubjectIdentifier?: string;
	identityProviderSessionId?: string;
}

export interface RejectRequestFormData {
	error: string;
	errorDescription?: string;
	errorHint?: string;
	errorDebug?: string;
	statusCode?: number;
}

// Available OAuth2 error codes
export const OAUTH2_ERROR_CODES = [
	"access_denied",
	"invalid_request",
	"unauthorized_client",
	"unsupported_response_type",
	"invalid_scope",
	"server_error",
	"temporarily_unavailable",
	"interaction_required",
	"login_required",
	"account_selection_required",
	"consent_required",
	"invalid_request_uri",
	"invalid_request_object",
	"request_not_supported",
	"request_uri_not_supported",
	"registration_not_supported",
] as const;

// Available ACR (Authentication Context Class Reference) values
export const ACR_VALUES = [
	"0", // No authentication
	"1", // Password-based authentication
	"2", // Two-factor authentication
	"3", // Multi-factor authentication
	"4", // Certificate-based authentication
] as const;

// Available AMR (Authentication Methods Reference) values
export const AMR_VALUES = [
	"pwd", // Password
	"rsa", // RSA key
	"otp", // One-time password
	"kba", // Knowledge-based authentication
	"sms", // SMS
	"tel", // Telephone
	"user", // User presence
	"pin", // Personal identification number
	"fpt", // Fingerprint biometric
	"geo", // Geolocation
	"face", // Facial recognition
	"iris", // Iris scan
	"retina", // Retina scan
	"voice", // Voice recognition
] as const;
