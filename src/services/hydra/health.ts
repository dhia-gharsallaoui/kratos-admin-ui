import { getHydraMetadataApi } from "./client";

/**
 * Check if Hydra is healthy and accessible
 */
export async function checkHydraHealth(): Promise<{
	isHealthy: boolean;
	error?: string;
}> {
	try {
		const api = getHydraMetadataApi();
		// Try to call a lightweight endpoint to check connectivity
		await api.isReady();
		return { isHealthy: true };
	} catch (error: any) {
		console.error("Hydra health check failed:", error);

		// Determine the specific error
		let errorMessage = "Unable to connect to Hydra";

		if (error.code === "ECONNREFUSED" || error.message?.includes("fetch failed")) {
			errorMessage = "Connection refused - Hydra is not running or not accessible";
		} else if (error.response?.status === 502) {
			errorMessage = "Bad Gateway - Hydra admin URL may be incorrect";
		} else if (error.response?.status === 404) {
			errorMessage = "Endpoint not found - Hydra admin URL may be incorrect";
		} else if (error.message) {
			errorMessage = error.message;
		}

		return {
			isHealthy: false,
			error: errorMessage,
		};
	}
}
