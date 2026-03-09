import { errorResponse, jsonResponse, withAdminAuth, withAuth } from "@/lib/api-helpers";
import { deleteIdentity, getIdentity, patchIdentity } from "@/services/kratos/endpoints/identities";

export const GET = withAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		const url = new URL(_request.url);
		const includeCredential = url.searchParams.getAll("includeCredential");

		const { data } = await getIdentity({
			id,
			includeCredential: includeCredential.length > 0 ? (includeCredential as any) : undefined,
		});
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const PATCH = withAdminAuth(async (request, { params }) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const { data } = await patchIdentity({ id, jsonPatch: body.jsonPatch || body });
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});

export const DELETE = withAdminAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		await deleteIdentity({ id });
		return new Response(null, { status: 204 });
	} catch (error) {
		return errorResponse(error);
	}
});
