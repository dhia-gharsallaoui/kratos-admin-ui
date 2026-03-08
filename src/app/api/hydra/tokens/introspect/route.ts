import { errorResponse, jsonResponse, withAuth } from "@/lib/api-helpers";
import { introspectOAuth2Token } from "@/services/hydra/endpoints/oauth2-tokens";

export const POST = withAuth(async (request) => {
	try {
		const tokenData = await request.json();
		const result = await introspectOAuth2Token(tokenData);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
