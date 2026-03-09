import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { listOAuth2ConsentSessions, revokeOAuth2ConsentSessions } from "@/services/hydra/endpoints/oauth2-auth";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const result = await listOAuth2ConsentSessions({
			subject: params.get("subject") || undefined,
			login_session_id: params.get("loginSessionId") || undefined,
			page_size: getIntParam(params, "pageSize"),
			page_token: params.get("pageToken") || undefined,
		});
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (request) => {
	try {
		const { subject, client, all } = await request.json();
		if (!subject) {
			return jsonResponse({ error: "subject is required" }, 400);
		}
		const result = await revokeOAuth2ConsentSessions(subject, client, all);
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
});
