import type { AcceptOAuth2ConsentRequest, AcceptOAuth2LoginRequest, RejectOAuth2Request } from "@ory/hydra-client";
import { withApiErrorHandling } from "@/utils/api-wrapper";
import { getAdminOAuth2Api } from "../client";
import type { PaginationParams } from "../types";

// Use PaginationParams from ../types instead

// OAuth2 Authentication Flow operations

export interface ListConsentSessionsParams extends PaginationParams {
	subject?: string;
	login_session_id?: string;
}

// Consent Request operations
export async function getOAuth2ConsentRequest(challenge: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().getOAuth2ConsentRequest({
			consentChallenge: challenge,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function acceptOAuth2ConsentRequest(challenge: string, body: AcceptOAuth2ConsentRequest) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().acceptOAuth2ConsentRequest({
			consentChallenge: challenge,
			acceptOAuth2ConsentRequest: body,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function rejectOAuth2ConsentRequest(challenge: string, body: RejectOAuth2Request) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().rejectOAuth2ConsentRequest({
			consentChallenge: challenge,
			rejectOAuth2Request: body,
		});
		return { data: response.data };
	}, "Hydra");
}

// Login Request operations
export async function getOAuth2LoginRequest(challenge: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().getOAuth2LoginRequest({
			loginChallenge: challenge,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function acceptOAuth2LoginRequest(challenge: string, body: AcceptOAuth2LoginRequest) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().acceptOAuth2LoginRequest({
			loginChallenge: challenge,
			acceptOAuth2LoginRequest: body,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function rejectOAuth2LoginRequest(challenge: string, body: RejectOAuth2Request) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().rejectOAuth2LoginRequest({
			loginChallenge: challenge,
			rejectOAuth2Request: body,
		});
		return { data: response.data };
	}, "Hydra");
}

// Logout Request operations
export async function getOAuth2LogoutRequest(challenge: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().getOAuth2LogoutRequest({
			logoutChallenge: challenge,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function acceptOAuth2LogoutRequest(challenge: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().acceptOAuth2LogoutRequest({
			logoutChallenge: challenge,
		});
		return { data: response.data };
	}, "Hydra");
}

export async function rejectOAuth2LogoutRequest(challenge: string) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().rejectOAuth2LogoutRequest({
			logoutChallenge: challenge,
		});
		return { data: response.data };
	}, "Hydra");
}

// Consent Session operations
export async function listOAuth2ConsentSessions(params: ListConsentSessionsParams = {}) {
	// Subject is required by Hydra API
	if (!params.subject) {
		throw new Error("Subject parameter is required for listing consent sessions");
	}

	const subject = params.subject; // Capture for type narrowing

	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().listOAuth2ConsentSessions({
			pageSize: params.page_size,
			pageToken: params.page_token,
			subject,
			loginSessionId: params.login_session_id,
		});

		return {
			data: response.data || [],
		};
	}, "Hydra");
}

export async function revokeOAuth2ConsentSessions(subject: string, client?: string, all?: boolean) {
	return withApiErrorHandling(async () => {
		const response = await getAdminOAuth2Api().revokeOAuth2ConsentSessions({
			subject,
			client,
			all,
		});
		return { data: response.data };
	}, "Hydra");
}

// Note: OAuth2LoginSession operations are not available in the official Hydra client
// Use OAuth2ConsentSession operations instead
