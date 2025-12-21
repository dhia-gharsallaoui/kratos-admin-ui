import { getMetadataApi } from "./client";

/**
 * Check if Kratos is healthy and accessible
 */
export async function checkKratosHealth(): Promise<{
	isHealthy: boolean;
	error?: string;
}> {
	try {
		const api = getMetadataApi();
		// Try to call a lightweight endpoint to check connectivity
		await api.isReady();
		return { isHealthy: true };
	} catch (error: any) {
		console.error("Kratos health check failed:", error);

		// Determine the specific error
		let errorMessage = "Unable to connect to Kratos";

		if (error.code === "ECONNREFUSED" || error.message?.includes("fetch failed")) {
			errorMessage = "Connection refused - Kratos is not running or not accessible";
		} else if (error.response?.status === 502) {
			errorMessage = "Bad Gateway - Kratos admin URL may be incorrect";
		} else if (error.response?.status === 404) {
			errorMessage = "Endpoint not found - Kratos admin URL may be incorrect";
		} else if (error.message) {
			errorMessage = error.message;
		}

		return {
			isHealthy: false,
			error: errorMessage,
		};
	}
}
