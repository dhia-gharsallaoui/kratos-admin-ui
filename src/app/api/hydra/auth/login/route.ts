import { errorResponse, getSearchParams, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { acceptOAuth2LoginRequest, getOAuth2LoginRequest, rejectOAuth2LoginRequest } from "@/services/hydra/endpoints/oauth2-auth";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const challenge = params.get("challenge");
		if (!challenge) {
			return jsonResponse({ error: "challenge parameter is required" }, 400);
		}
		const result = await getOAuth2LoginRequest(challenge);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const POST = withAdminAuth(async (request) => {
	try {
		const { challenge, body } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await acceptOAuth2LoginRequest(challenge, body);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (request) => {
	try {
		const { challenge, body } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await rejectOAuth2LoginRequest(challenge, body);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
