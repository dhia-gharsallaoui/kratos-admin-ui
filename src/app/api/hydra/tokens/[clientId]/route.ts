import { errorResponse, jsonResponse, withAdminAuth } from "@/lib/api-helpers";
import { deleteOAuth2AccessTokens } from "@/services/hydra/endpoints/oauth2-tokens";

export const DELETE = withAdminAuth(async (_request, { params }) => {
	try {
		const { clientId } = await params;
		const result = await deleteOAuth2AccessTokens(clientId);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
