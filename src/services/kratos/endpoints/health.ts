import { getMetadataApi } from "../client";

// Health check operations
export async function checkKratosReady() {
	try {
		const metadataApi = getMetadataApi();
		const response = await metadataApi.isReady();
		return response.status === 200;
	} catch (error) {
		console.error("Kratos health check failed:", error);
		return false;
	}
}

export async function checkKratosAlive() {
	try {
		const metadataApi = getMetadataApi();
		const response = await metadataApi.isAlive();
		return response.status === 200;
	} catch (error) {
		console.error("Kratos alive check failed:", error);
		return false;
	}
}

export async function getKratosVersion() {
	try {
		const metadataApi = getMetadataApi();
		const response = await metadataApi.getVersion();
		return response.data;
	} catch (error) {
		console.error("Failed to get Kratos version:", error);
		throw error;
	}
}
