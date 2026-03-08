import { errorResponse, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { acceptOAuth2ConsentRequest, getOAuth2ConsentRequest, rejectOAuth2ConsentRequest } from "@/services/hydra/endpoints/oauth2-auth";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const challenge = params.get("challenge");
		if (!challenge) {
			return jsonResponse({ error: "challenge parameter is required" }, 400);
		}
		const result = await getOAuth2ConsentRequest(challenge);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const POST = withAuth(async (request) => {
	try {
		const { challenge, body } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await acceptOAuth2ConsentRequest(challenge, body);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAuth(async (request) => {
	try {
		const { challenge, body } = await request.json();
		if (!challenge) {
			return jsonResponse({ error: "challenge is required" }, 400);
		}
		const result = await rejectOAuth2ConsentRequest(challenge, body);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
