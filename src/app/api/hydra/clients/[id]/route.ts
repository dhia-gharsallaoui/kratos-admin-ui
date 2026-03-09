import { errorResponse, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { deleteOAuth2Client, getOAuth2Client, patchOAuth2Client, updateOAuth2Client } from "@/services/hydra/endpoints/oauth2-clients";

export const GET = withAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		const result = await getOAuth2Client(id);
		return jsonResponse(result.data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const PUT = withAdminAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const result = await updateOAuth2Client(id, body);
		return jsonResponse(result.data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const PATCH = withAdminAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const result = await patchOAuth2Client(id, body);
		return jsonResponse(result.data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		await deleteOAuth2Client(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return errorResponse(error);
	}
});
