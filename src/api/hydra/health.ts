import type { HealthResponse } from "@/api/kratos/health";
import { apiClient } from "@/lib/api-client";

export async function checkHydraHealth() {
	return apiClient<HealthResponse>("/api/hydra/health");
}
