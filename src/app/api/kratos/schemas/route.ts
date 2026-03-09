import { errorResponse, jsonResponse, withAuth } from "@/lib/api-helpers";
import { listIdentitySchemas } from "@/services/kratos/endpoints/schemas";

export const GET = withAuth(async () => {
	try {
		const { data } = await listIdentitySchemas();
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});
