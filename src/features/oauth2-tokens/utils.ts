import type { IntrospectedOAuth2Token } from "@/services/hydra";
import type {
	FlushTokensFormData,
	IntrospectTokenFormData,
	OAuth2TokenDetails,
	OAuth2TokenTableRow,
	RevokeTokenFormData,
	TokenExchangeFormData,
	TokenFormErrors,
	TokenStatus,
} from "./types";

// Transform token introspection result for table display
export function transformTokenForTable(token: IntrospectedOAuth2Token, tokenPreview?: string): OAuth2TokenTableRow {
	const now = Math.floor(Date.now() / 1000);
	const isExpired = token.exp ? token.exp < now : false;

	return {
		id: tokenPreview || token.sub || "unknown",
		tokenType: determineTokenType(token),
		subject: token.sub,
		clientId: token.client_id,
		scope: token.scope,
		audience: token.aud,
		issuedAt: token.iat ? new Date(token.iat * 1000).toISOString() : undefined,
		expiresAt: token.exp ? new Date(token.exp * 1000).toISOString() : undefined,
		isActive: !!token.active,
		isExpired,
		timeToExpiry: token.exp ? formatTimeToExpiry(token.exp - now) : undefined,
	};
}

// Enhance token introspection result with display information
export function enhanceTokenDetails(token: IntrospectedOAuth2Token, tokenPreview?: string): OAuth2TokenDetails {
	const now = Math.floor(Date.now() / 1000);
	const isExpired = token.exp ? token.exp < now : false;
	const timeToExpiry = token.exp ? token.exp - now : undefined;

	return {
		...token,
		tokenPreview,
		formattedScopes: token.scope ? token.scope.split(" ").filter((s) => s.trim()) : [],
		formattedAudience: Array.isArray(token.aud) ? token.aud : token.aud ? [token.aud] : [],
		issuedAtFormatted: token.iat ? formatTimestamp(token.iat) : undefined,
		expiresAtFormatted: token.exp ? formatTimestamp(token.exp) : undefined,
		tokenTypeFormatted: getTokenTypeDisplayName(token.token_type),
		statusInfo: {
			isActive: !!token.active,
			isExpired,
			timeToExpiry: timeToExpiry ? formatTimeToExpiry(timeToExpiry) : undefined,
			expiryPercentage: calculateExpiryPercentage(token.iat, token.exp),
		},
	};
}

// Determine token type from introspection result
function determineTokenType(token: IntrospectedOAuth2Token): "access" | "refresh" | "id" {
	if (token.token_type === "refresh_token" || token.token_use === "refresh") {
		return "refresh";
	}
	if (token.token_type === "id_token" || token.token_use === "id") {
		return "id";
	}
	return "access"; // Default to access token
}

// Format timestamp to readable string
function formatTimestamp(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleString();
}

// Format time to expiry in human-readable format
function formatTimeToExpiry(seconds: number): string {
	if (seconds <= 0) return "Expired";

	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) {
		return `${days}d ${hours}h`;
	} else if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m`;
	} else {
		return `${seconds}s`;
	}
}

// Calculate expiry percentage (how much of the token's lifetime has passed)
function calculateExpiryPercentage(iat?: number, exp?: number): number | undefined {
	if (!iat || !exp) return undefined;

	const now = Math.floor(Date.now() / 1000);
	const totalLifetime = exp - iat;
	const timeElapsed = now - iat;

	if (totalLifetime <= 0) return 100;

	const percentage = Math.min(100, Math.max(0, (timeElapsed / totalLifetime) * 100));
	return Math.round(percentage);
}

// Get token type display name
export function getTokenTypeDisplayName(tokenType?: string): string {
	const displayNames: Record<string, string> = {
		access_token: "Access Token",
		refresh_token: "Refresh Token",
		id_token: "ID Token",
		bearer: "Bearer Token",
		jwt: "JWT Token",
	};
	return displayNames[tokenType || ""] || tokenType || "Unknown";
}

// Get token status with color
export function getTokenStatusInfo(token: IntrospectedOAuth2Token): {
	status: TokenStatus;
	displayName: string;
	color: "success" | "warning" | "error" | "info";
} {
	const now = Math.floor(Date.now() / 1000);
	const isExpired = token.exp ? token.exp < now : false;

	if (!token.active) {
		return { status: "revoked", displayName: "Revoked", color: "error" };
	}

	if (isExpired) {
		return { status: "expired", displayName: "Expired", color: "error" };
	}

	if (token.active) {
		return { status: "active", displayName: "Active", color: "success" };
	}

	return { status: "inactive", displayName: "Inactive", color: "warning" };
}

// Validate introspect token form
export function validateIntrospectTokenForm(formData: IntrospectTokenFormData): TokenFormErrors {
	const errors: TokenFormErrors = {};

	if (!formData.token.trim()) {
		errors.token = "Token is required";
	} else if (formData.token.length < 10) {
		errors.token = "Token appears to be too short";
	}

	return errors;
}

// Validate revoke token form
export function validateRevokeTokenForm(formData: RevokeTokenFormData): TokenFormErrors {
	const errors: TokenFormErrors = {};

	if (!formData.token.trim()) {
		errors.token = "Token is required";
	}

	// Client credentials are optional but if provided, both should be present
	if (formData.client_id && !formData.client_secret) {
		errors.client_secret = "Client secret is required when client ID is provided";
	}

	if (formData.client_secret && !formData.client_id) {
		errors.client_id = "Client ID is required when client secret is provided";
	}

	return errors;
}

// Validate token exchange form
export function validateTokenExchangeForm(formData: TokenExchangeFormData): TokenFormErrors {
	const errors: TokenFormErrors = {};

	if (!formData.grant_type.trim()) {
		errors.grant_type = "Grant type is required";
	}

	// Validate URLs if provided
	if (formData.audience && !isValidUrl(formData.audience)) {
		errors.audience = "Audience must be a valid URL";
	}

	return errors;
}

// Validate flush tokens form
export function validateFlushTokensForm(formData: FlushTokensFormData): TokenFormErrors {
	const errors: TokenFormErrors = {};

	if (formData.notAfter) {
		const date = new Date(formData.notAfter);
		if (Number.isNaN(date.getTime())) {
			errors.notAfter = "Invalid date format";
		} else if (date > new Date()) {
			errors.notAfter = "Date cannot be in the future";
		}
	}

	if (formData.confirmText !== "FLUSH") {
		errors.confirmText = 'Please type "FLUSH" to confirm';
	}

	return errors;
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

// Get default values for introspect token form
export function getDefaultIntrospectTokenFormData(): IntrospectTokenFormData {
	return {
		token: "",
		scope: "",
	};
}

// Get default values for revoke token form
export function getDefaultRevokeTokenFormData(): RevokeTokenFormData {
	return {
		token: "",
		client_id: "",
		client_secret: "",
	};
}

// Get default values for token exchange form
export function getDefaultTokenExchangeFormData(): TokenExchangeFormData {
	return {
		grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
		client_id: "",
		client_secret: "",
		scope: "",
		audience: "",
		subject_token: "",
		subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
		actor_token: "",
		actor_token_type: "",
		requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
	};
}

// Get default values for flush tokens form
export function getDefaultFlushTokensFormData(): FlushTokensFormData {
	return {
		notAfter: "",
		confirmText: "",
	};
}

// Preview token safely (show first and last few characters)
export function previewToken(token: string, length = 8): string {
	if (token.length <= length * 2) return token;
	return `${token.substring(0, length)}...${token.substring(token.length - length)}`;
}

// Parse JWT token claims (basic parsing, doesn't verify signature)
export function parseJWTClaims(token: string): Record<string, any> | null {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;

		const payload = parts[1];
		const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

// Get token lifetime in human-readable format
export function getTokenLifetime(iat?: number, exp?: number): string {
	if (!iat || !exp) return "Unknown";

	const lifetime = exp - iat;
	return formatTimeToExpiry(lifetime);
}

// Check if token is expiring soon
export function isTokenExpiringSoon(exp?: number, thresholdHours = 24): boolean {
	if (!exp) return false;

	const now = Math.floor(Date.now() / 1000);
	const timeToExpiry = exp - now;

	return timeToExpiry > 0 && timeToExpiry <= thresholdHours * 3600;
}
