import { apiClient } from "@/lib/api-client";

export async function listSchemas() {
	return apiClient<any[]>("/api/kratos/schemas");
}

export async function getSchema(id: string) {
	return apiClient<any>(`/api/kratos/schemas/${id}`);
}
