import { errorResponse, jsonResponse, withAdminAuth } from "@/lib/api-helpers";
import { createRecoveryLink } from "@/services/kratos/endpoints/identities";

export const POST = withAdminAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		const { data } = await createRecoveryLink(id);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});
