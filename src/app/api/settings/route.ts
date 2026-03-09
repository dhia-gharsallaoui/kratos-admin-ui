import { errorResponse, jsonResponse, withAdminAuth } from "@/lib/api-helpers";
import { getClientSettings, updateSettings } from "@/lib/settings-store";

export async function GET() {
	try {
		const settings = getClientSettings();
		return jsonResponse(settings);
	} catch (error) {
		return errorResponse(error);
	}
}

export const PUT = withAdminAuth(async (request) => {
	try {
		const body = await request.json();
		updateSettings(body);
		const settings = getClientSettings();
		return jsonResponse(settings);
	} catch (error) {
		return errorResponse(error);
	}
});
