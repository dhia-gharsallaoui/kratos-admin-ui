import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { checkHydraHealth } from "@/services/hydra/health";

export async function GET() {
	try {
		const result = await checkHydraHealth();
		return jsonResponse(result);
	} catch (error) {
		return errorResponse(error);
	}
}
