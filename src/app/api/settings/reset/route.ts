import { errorResponse, jsonResponse, withAdminAuth } from "@/lib/api-helpers";
import { getClientSettings, resetSettings } from "@/lib/settings-store";

export const POST = withAdminAuth(async () => {
	try {
		resetSettings();
		const settings = getClientSettings();
		return jsonResponse(settings);
	} catch (error) {
		return errorResponse(error);
	}
});
