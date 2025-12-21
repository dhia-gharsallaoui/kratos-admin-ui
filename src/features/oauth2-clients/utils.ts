import type { OAuth2Client } from "@/services/hydra";
import type { OAuth2ClientFormData, OAuth2ClientFormErrors, OAuth2ClientTableRow } from "./types";

// Transform OAuth2 client data for table display
export function transformOAuth2ClientForTable(client: OAuth2Client): OAuth2ClientTableRow {
	return {
		...client,
		id: client.client_id || "unknown",
		displayName: client.client_name || client.client_id || "Unnamed Client",
		createdDate: client.created_at ? new Date(client.created_at).toLocaleDateString() : undefined,
		updatedDate: client.updated_at ? new Date(client.updated_at).toLocaleDateString() : undefined,
		scopeList: client.scope ? client.scope.split(" ").filter((s) => s.trim()) : [],
		redirectUrisList: client.redirect_uris || [],
		grantTypesList: client.grant_types || [],
	};
}

// Transform form data to API request format
export function transformFormDataToCreateRequest(formData: OAuth2ClientFormData) {
	return {
		client_name: formData.client_name,
		client_uri: formData.client_uri || undefined,
		logo_uri: formData.logo_uri || undefined,
		contacts: formData.contacts?.filter((contact) => contact.trim()) || undefined,
		grant_types: formData.grant_types,
		response_types: formData.response_types,
		redirect_uris: formData.redirect_uris.filter((uri) => uri.trim()),
		scope: formData.scope || undefined,
		audience: formData.audience?.filter((aud) => aud.trim()) || undefined,
		owner: formData.owner || undefined,
		policy_uri: formData.policy_uri || undefined,
		tos_uri: formData.tos_uri || undefined,
		subject_type: formData.subject_type || undefined,
		token_endpoint_auth_method: formData.token_endpoint_auth_method || undefined,
		userinfo_signed_response_alg: formData.userinfo_signed_response_alg || undefined,
		metadata: formData.metadata || undefined,
	};
}

// Transform OAuth2 client to form data
export function transformOAuth2ClientToFormData(client: OAuth2Client): OAuth2ClientFormData {
	return {
		client_name: client.client_name || "",
		client_uri: client.client_uri || "",
		logo_uri: client.logo_uri || "",
		contacts: client.contacts || [],
		grant_types: client.grant_types || ["authorization_code"],
		response_types: client.response_types || ["code"],
		redirect_uris: client.redirect_uris || [],
		scope: client.scope || "",
		audience: client.audience || [],
		owner: client.owner || "",
		policy_uri: client.policy_uri || "",
		tos_uri: client.tos_uri || "",
		subject_type: (client.subject_type as "public" | "pairwise") || "public",
		token_endpoint_auth_method: client.token_endpoint_auth_method || "client_secret_basic",
		userinfo_signed_response_alg: client.userinfo_signed_response_alg || "",
		metadata: client.metadata || {},
	};
}

// Validate OAuth2 client form data
export function validateOAuth2ClientForm(formData: OAuth2ClientFormData): OAuth2ClientFormErrors {
	const errors: OAuth2ClientFormErrors = {};

	// Required field validation
	if (!formData.client_name.trim()) {
		errors.client_name = "Client name is required";
	}

	if (formData.grant_types.length === 0) {
		errors.grant_types = "At least one grant type is required";
	}

	if (formData.response_types.length === 0) {
		errors.response_types = "At least one response type is required";
	}

	// Conditional validation: authorization_code flow requires redirect URIs
	if (formData.grant_types.includes("authorization_code") && formData.redirect_uris.filter((uri) => uri.trim()).length === 0) {
		errors.redirect_uris = "Redirect URIs are required for authorization_code grant type";
	}

	// URL validation
	const urlFields = ["client_uri", "logo_uri", "policy_uri", "tos_uri"] as const;
	urlFields.forEach((field) => {
		if (formData[field] && !isValidUrl(formData[field]!)) {
			errors[field] = "Must be a valid URL";
		}
	});

	// Redirect URIs validation
	const invalidRedirectUris = formData.redirect_uris.filter((uri) => uri.trim() && !isValidUrl(uri));
	if (invalidRedirectUris.length > 0) {
		errors.redirect_uris = "All redirect URIs must be valid URLs";
	}

	// Contacts validation (email format)
	const invalidContacts = formData.contacts?.filter((contact) => contact.trim() && !isValidEmail(contact));
	if (invalidContacts && invalidContacts.length > 0) {
		errors.contacts = "All contacts must be valid email addresses";
	}

	// Metadata validation (must be valid JSON)
	if (formData.metadata) {
		try {
			JSON.stringify(formData.metadata);
		} catch {
			errors.metadata = "Metadata must be valid JSON";
		}
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

// Helper function to validate email addresses
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Generate default values for new OAuth2 client
export function getDefaultOAuth2ClientFormData(): OAuth2ClientFormData {
	return {
		client_name: "",
		client_uri: "",
		logo_uri: "",
		contacts: [],
		grant_types: ["authorization_code"],
		response_types: ["code"],
		redirect_uris: [],
		scope: "openid profile email",
		audience: [],
		owner: "",
		policy_uri: "",
		tos_uri: "",
		subject_type: "public",
		token_endpoint_auth_method: "client_secret_basic",
		userinfo_signed_response_alg: "",
		metadata: {},
	};
}

// Format client ID for display
export function formatClientId(clientId: string): string {
	if (clientId.length <= 20) return clientId;
	return `${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 8)}`;
}

// Get client type based on client secret
export function getClientType(client: OAuth2Client): "public" | "confidential" {
	return client.client_secret ? "confidential" : "public";
}

// Get grant types display names
export function getGrantTypeDisplayName(grantType: string): string {
	const displayNames: Record<string, string> = {
		authorization_code: "Authorization Code",
		client_credentials: "Client Credentials",
		refresh_token: "Refresh Token",
		implicit: "Implicit",
		password: "Resource Owner Password",
		"urn:ietf:params:oauth:grant-type:jwt-bearer": "JWT Bearer",
	};
	return displayNames[grantType] || grantType;
}

// Get response types display names
export function getResponseTypeDisplayName(responseType: string): string {
	const displayNames: Record<string, string> = {
		code: "Authorization Code",
		token: "Access Token",
		id_token: "ID Token",
		"code token": "Code + Token",
		"code id_token": "Code + ID Token",
		"token id_token": "Token + ID Token",
		"code token id_token": "Code + Token + ID Token",
	};
	return displayNames[responseType] || responseType;
}
