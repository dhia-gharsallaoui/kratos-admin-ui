import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { checkKratosHealth } from "@/services/kratos/health";

export async function GET() {
	try {
		const result = await checkKratosHealth();
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
}
