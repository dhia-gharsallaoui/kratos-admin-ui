import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getMessagesPage } from "@/services/kratos/endpoints/courier";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const pageSize = getIntParam(params, "pageSize");
		const pageToken = params.get("pageToken") || undefined;
		const status = (params.get("status") as any) || undefined;
		const recipient = params.get("recipient") || undefined;

		const result = await getMessagesPage({ pageToken, pageSize, status, recipient });
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
