import { errorResponse, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getIdentitySchema } from "@/services/kratos/endpoints/schemas";

export const GET = withAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		const { data } = await getIdentitySchema({ id });
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});
