import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { createOAuth2Client, listOAuth2Clients } from "@/services/hydra/endpoints/oauth2-clients";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const result = await listOAuth2Clients({
			page_size: getIntParam(params, "pageSize"),
			page_token: params.get("pageToken") || undefined,
			client_name: params.get("clientName") || undefined,
			owner: params.get("owner") || undefined,
		});
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const POST = withAuth(async (request) => {
	try {
		const body = await request.json();
		const result = await createOAuth2Client(body);
		return jsonResponse(result.data, 201);
	} catch (error) {
		return errorResponse(error);
	}
});
