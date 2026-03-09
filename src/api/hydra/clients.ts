import { apiClient } from "@/lib/api-client";

export async function listOAuth2Clients(params?: { pageSize?: number; pageToken?: string; clientName?: string; owner?: string }) {
	return apiClient<{ data: any[] }>("/api/hydra/clients", { params });
}

export async function getOAuth2Client(id: string) {
	return apiClient<any>(`/api/hydra/clients/${id}`);
}

export async function createOAuth2Client(body: any) {
	return apiClient<any>("/api/hydra/clients", { method: "POST", body });
}

export async function updateOAuth2Client(id: string, body: any) {
	return apiClient<any>(`/api/hydra/clients/${id}`, { method: "PUT", body });
}

export async function patchOAuth2Client(id: string, body: any) {
	return apiClient<any>(`/api/hydra/clients/${id}`, { method: "PATCH", body });
}

export async function deleteOAuth2Client(id: string) {
	return apiClient(`/api/hydra/clients/${id}`, { method: "DELETE" });
}
