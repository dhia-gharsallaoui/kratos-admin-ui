import { errorResponse, withAdminAuth } from "@/lib/api-helpers";
import { deleteIdentityCredentials } from "@/services/kratos/endpoints/identities";

export const DELETE = withAdminAuth(async (request, { params }) => {
	try {
		const { id, type } = await params;
		const url = new URL(request.url);
		const identifier = url.searchParams.get("identifier") || undefined;

		await deleteIdentityCredentials({ id, type: type as any, identifier });
		return new Response(null, { status: 204 });
	} catch (error) {
		return errorResponse(error);
	}
});
