import { errorResponse, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { disableSession, extendSession, getSession } from "@/services/kratos/endpoints/sessions";

export const GET = withAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const url = new URL(request.url);
		const expand = url.searchParams.getAll("expand") as ("identity" | "devices")[];

		const { data } = await getSession(id, expand.length > 0 ? expand : undefined);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		await disableSession(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return errorResponse(error);
	}
});

export const PATCH = withAdminAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const body = await request.json();

		if (body.action === "extend") {
			const { data } = await extendSession(id);
			return jsonResponse(data);
		}

		return Response.json({ error: "Unknown action" }, { status: 400 });
	} catch (error) {
		return errorResponse(error);
	}
});
