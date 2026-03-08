import { errorResponse, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getClientSettings, resetSettings } from "@/lib/settings-store";

export const POST = withAuth(async () => {
	try {
		resetSettings();
		const settings = getClientSettings();
		return jsonResponse(settings);
	} catch (error) {
		return errorResponse(error);
	}
});
