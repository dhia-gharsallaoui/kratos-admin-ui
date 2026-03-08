import { apiClient } from "@/lib/api-client";

export interface HealthResponse {
	isHealthy: boolean;
	error?: string;
	disabled?: boolean;
}

export async function checkKratosHealth() {
	return apiClient<HealthResponse>("/api/kratos/health");
}
