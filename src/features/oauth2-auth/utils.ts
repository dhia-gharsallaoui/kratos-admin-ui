import type { OAuth2ConsentRequest, OAuth2LoginRequest, OAuth2LogoutRequest } from "@/services/hydra";
import type {
	AcceptConsentFormData,
	AcceptLoginFormData,
	OAuth2AuthFlowTableRow,
	OAuth2ConsentRequestDetails,
	OAuth2LoginRequestDetails,
	RejectRequestFormData,
	ScopeInfo,
} from "./types";

// Transform consent request for table display
export function transformConsentRequestForTable(request: OAuth2ConsentRequest): OAuth2AuthFlowTableRow {
	return {
		id: request.challenge || "unknown",
		type: "consent",
		challenge: request.challenge || "",
		subject: request.subject,
		clientId: request.client?.client_id,
		clientName: request.client?.client_name || request.client?.client_id,
		requestedScopes: request.requested_scope,
		requestUrl: request.request_url,
		skip: request.skip,
		status: request.skip ? "accepted" : "pending", // Simplified status logic
		createdAt: undefined, // Not available in basic request
		handledAt: undefined, // Not available in basic request
	};
}

// Transform login request for table display
export function transformLoginRequestForTable(request: OAuth2LoginRequest): OAuth2AuthFlowTableRow {
	return {
		id: request.challenge || "unknown",
		type: "login",
		challenge: request.challenge || "",
		subject: request.subject,
		clientId: request.client?.client_id,
		clientName: request.client?.client_name || request.client?.client_id,
		requestedScopes: request.requested_scope,
		requestUrl: request.request_url,
		skip: request.skip,
		status: request.skip ? "accepted" : "pending",
		createdAt: undefined,
		handledAt: undefined,
	};
}

// Transform logout request for table display
export function transformLogoutRequestForTable(request: OAuth2LogoutRequest): OAuth2AuthFlowTableRow {
	return {
		id: request.challenge || "unknown",
		type: "logout",
		challenge: request.challenge || "",
		subject: request.subject,
		clientId: request.client?.client_id,
		clientName: request.client?.client_name || request.client?.client_id,
		requestedScopes: undefined,
		requestUrl: request.request_url,
		skip: false, // Logout requests typically don't have skip
		status: "pending",
		createdAt: undefined,
		handledAt: undefined,
	};
}

// Enhance consent request with additional display information
export function enhanceConsentRequestDetails(request: OAuth2ConsentRequest): OAuth2ConsentRequestDetails {
	return {
		...request,
		displayScopes: request.requested_scope?.map((scope) => transformScopeToScopeInfo(scope)),
		clientInfo: {
			name: request.client?.client_name,
			logoUri: request.client?.logo_uri,
			policyUri: request.client?.policy_uri,
			tosUri: request.client?.tos_uri,
			contacts: request.client?.contacts,
		},
		sessionInfo: {
			loginSessionId: request.login_session_id,
			authMethods: request.amr,
			authTime: undefined, // Would need to parse from context
		},
	};
}

// Enhance login request with additional display information
export function enhanceLoginRequestDetails(request: OAuth2LoginRequest): OAuth2LoginRequestDetails {
	return {
		...request,
		clientInfo: {
			name: request.client?.client_name,
			logoUri: request.client?.logo_uri,
			policyUri: request.client?.policy_uri,
			tosUri: request.client?.tos_uri,
		},
		oidcInfo: {
			acrValues: request.oidc_context?.acr_values,
			display: request.oidc_context?.display,
			idTokenHintClaims: request.oidc_context?.id_token_hint_claims,
			loginHint: request.oidc_context?.login_hint,
			uiLocales: request.oidc_context?.ui_locales,
		},
	};
}

// Transform scope string to scope info
export function transformScopeToScopeInfo(scope: string): ScopeInfo {
	const scopeDescriptions: Record<string, { displayName: string; description: string; required: boolean }> = {
		openid: {
			displayName: "OpenID Connect",
			description: "Access to your OpenID Connect profile information",
			required: true,
		},
		profile: {
			displayName: "Profile Information",
			description: "Access to your basic profile information (name, picture, etc.)",
			required: false,
		},
		email: {
			displayName: "Email Address",
			description: "Access to your email address",
			required: false,
		},
		address: {
			displayName: "Address Information",
			description: "Access to your address information",
			required: false,
		},
		phone: {
			displayName: "Phone Number",
			description: "Access to your phone number",
			required: false,
		},
		offline_access: {
			displayName: "Offline Access",
			description: "Access to your data when you are not actively using the application",
			required: false,
		},
	};

	const scopeInfo = scopeDescriptions[scope] || {
		displayName: scope,
		description: `Access to ${scope} resources`,
		required: false,
	};

	return {
		name: scope,
		...scopeInfo,
	};
}

// Transform form data to accept consent request
export function transformAcceptConsentFormData(formData: AcceptConsentFormData) {
	return {
		grant_scope: formData.grantScope,
		grant_access_token_audience: formData.grantAccessTokenAudience,
		remember: formData.remember,
		remember_for: formData.rememberFor,
		session: {
			access_token: formData.accessTokenClaims,
			id_token: formData.idTokenClaims,
		},
		handled_at: new Date().toISOString(),
	};
}

// Transform form data to accept login request
export function transformAcceptLoginFormData(formData: AcceptLoginFormData) {
	return {
		subject: formData.subject,
		remember: formData.remember,
		remember_for: formData.rememberFor,
		acr: formData.acr,
		amr: formData.amr,
		context: formData.context,
		extend_session_lifespan: formData.extendSessionLifespan,
		force_subject_identifier: formData.forceSubjectIdentifier,
		identity_provider_session_id: formData.identityProviderSessionId,
	};
}

// Transform form data to reject request
export function transformRejectRequestFormData(formData: RejectRequestFormData) {
	return {
		error: formData.error,
		error_description: formData.errorDescription,
		error_hint: formData.errorHint,
		error_debug: formData.errorDebug,
		status_code: formData.statusCode,
	};
}

// Get default values for accept consent form
export function getDefaultAcceptConsentFormData(request: OAuth2ConsentRequest): AcceptConsentFormData {
	return {
		grantScope: request.requested_scope || [],
		grantAccessTokenAudience: request.requested_access_token_audience || [],
		remember: false,
		rememberFor: 3600, // 1 hour
		accessTokenClaims: {},
		idTokenClaims: {},
	};
}

// Get default values for accept login form
export function getDefaultAcceptLoginFormData(request: OAuth2LoginRequest): AcceptLoginFormData {
	return {
		subject: request.subject || "",
		remember: false,
		rememberFor: 3600, // 1 hour
		acr: request.oidc_context?.acr_values?.[0],
		amr: [],
		context: {},
		extendSessionLifespan: false,
		forceSubjectIdentifier: "",
		identityProviderSessionId: "",
	};
}

// Get default values for reject request form
export function getDefaultRejectRequestFormData(): RejectRequestFormData {
	return {
		error: "access_denied",
		errorDescription: "The user denied the request",
		errorHint: "",
		errorDebug: "",
		statusCode: 403,
	};
}

// Format challenge for display
export function formatChallenge(challenge: string): string {
	if (challenge.length <= 16) return challenge;
	return `${challenge.substring(0, 8)}...${challenge.substring(challenge.length - 8)}`;
}

// Get request type display name
export function getRequestTypeDisplayName(type: "consent" | "login" | "logout"): string {
	const displayNames = {
		consent: "Consent Request",
		login: "Login Request",
		logout: "Logout Request",
	};
	return displayNames[type];
}

// Get request status display name and color
export function getRequestStatusInfo(status: string): {
	displayName: string;
	color: "success" | "warning" | "error" | "info";
} {
	switch (status) {
		case "pending":
			return { displayName: "Pending", color: "warning" };
		case "accepted":
			return { displayName: "Accepted", color: "success" };
		case "rejected":
			return { displayName: "Rejected", color: "error" };
		case "expired":
			return { displayName: "Expired", color: "error" };
		default:
			return { displayName: status, color: "info" };
	}
}

// Validate consent request form
export function validateAcceptConsentForm(formData: AcceptConsentFormData): string | null {
	if (formData.grantScope.length === 0) {
		return "At least one scope must be granted";
	}

	if (formData.rememberFor < 0) {
		return "Remember duration must be non-negative";
	}

	return null;
}

// Validate login request form
export function validateAcceptLoginForm(formData: AcceptLoginFormData): string | null {
	if (!formData.subject.trim()) {
		return "Subject is required";
	}

	if (formData.rememberFor < 0) {
		return "Remember duration must be non-negative";
	}

	return null;
}

// Validate reject request form
export function validateRejectRequestForm(formData: RejectRequestFormData): string | null {
	if (!formData.error.trim()) {
		return "Error code is required";
	}

	if (formData.statusCode && (formData.statusCode < 400 || formData.statusCode > 599)) {
		return "Status code must be between 400 and 599";
	}

	return null;
}
