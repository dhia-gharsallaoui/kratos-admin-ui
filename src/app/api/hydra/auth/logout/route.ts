import { errorResponse, getSearchParams, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { acceptOAuth2LogoutRequest, getOAuth2LogoutRequest, rejectOAuth2LogoutRequest } from "@/services/hydra/endpoints/oauth2-auth";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const challenge = params.get("challenge");
		if (!challenge) {
			return jsonResponse({ error: "challenge parameter is required" }, 400);
		}
		const result = await getOAuth2LogoutRequest(challenge);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const POST = withAdminAuth(async (request) => {
	try {
		const { challenge } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await acceptOAuth2LogoutRequest(challenge);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (request) => {
	try {
		const { challenge } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await rejectOAuth2LogoutRequest(challenge);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
