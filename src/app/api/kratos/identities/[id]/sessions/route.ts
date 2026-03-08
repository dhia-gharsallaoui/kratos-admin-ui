import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { deleteIdentitySessions, listIdentitySessions } from "@/services/kratos/endpoints/sessions";

export const GET = withAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const searchParams = getSearchParams(request);
		const pageSize = getIntParam(searchParams, "pageSize");
		const pageToken = searchParams.get("pageToken") || undefined;
		const active = searchParams.get("active") === "true" ? true : searchParams.get("active") === "false" ? false : undefined;

		const response = await listIdentitySessions({ id, pageSize, pageToken, active });
		return jsonResponse({ sessions: response.data });
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		await deleteIdentitySessions(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return errorResponse(error);
	}
});
