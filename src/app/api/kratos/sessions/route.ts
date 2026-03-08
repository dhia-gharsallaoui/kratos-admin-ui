import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getSessionsPage } from "@/services/kratos/endpoints/sessions";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const pageSize = getIntParam(params, "pageSize");
		const pageToken = params.get("pageToken") || undefined;
		const active = params.get("active") === "true" ? true : params.get("active") === "false" ? false : undefined;

		const result = await getSessionsPage({ pageToken, pageSize, active });
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
