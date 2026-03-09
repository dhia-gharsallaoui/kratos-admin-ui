import { errorResponse, jsonResponse, withAdminAuth } from "@/lib/api-helpers";
import { exchangeOAuth2Token } from "@/services/hydra/endpoints/oauth2-tokens";

export const POST = withAdminAuth(async (request) => {
	try {
		const tokenData = await request.json();
		const result = await exchangeOAuth2Token(tokenData);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
