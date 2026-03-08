import { errorResponse, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getMessage } from "@/services/kratos/endpoints/courier";

export const GET = withAuth(async (_request, { params }) => {
	try {
		const { id } = await params;
		const { data } = await getMessage(id);
		return jsonResponse(data);
	} catch (error) {
		return errorResponse(error);
	}
});
