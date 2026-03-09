import { apiClient } from "@/lib/api-client";

export interface IdentitiesPage {
	identities: any[];
	nextPageToken: string | null;
	hasMore: boolean;
}

export async function listIdentities(params?: { pageSize?: number; pageToken?: string }) {
	return apiClient<IdentitiesPage>("/api/kratos/identities", { params });
}

export async function getIdentity(id: string, includeCredential?: string[]) {
	return apiClient<any>(`/api/kratos/identities/${id}`, {
		params: includeCredential ? { includeCredential: includeCredential.join(",") } : undefined,
	});
}

export async function createIdentity(body: { schema_id: string; traits: any }) {
	return apiClient<any>("/api/kratos/identities", { method: "POST", body });
}

export async function patchIdentity(id: string, jsonPatch: any[]) {
	return apiClient<any>(`/api/kratos/identities/${id}`, { method: "PATCH", body: { jsonPatch } });
}

export async function deleteIdentity(id: string) {
	return apiClient(`/api/kratos/identities/${id}`, { method: "DELETE" });
}

export async function deleteIdentityCredentials(id: string, type: string, identifier?: string) {
	return apiClient(`/api/kratos/identities/${id}/credentials/${type}`, {
		method: "DELETE",
		params: identifier ? { identifier } : undefined,
	});
}

export async function createRecoveryLink(id: string) {
	return apiClient<any>(`/api/kratos/identities/${id}/recovery-link`, { method: "POST" });
}

export interface SearchResult<T> {
	identities?: T[];
	sessions?: T[];
	messages?: T[];
	totalMatched: number;
	hasMore?: boolean;
	isSearchResult: boolean;
}

export async function searchIdentities(query: string, pageSize = 25) {
	return apiClient<SearchResult<any>>("/api/kratos/identities/search", { params: { q: query, pageSize } });
}

export async function listIdentitySessions(id: string, params?: { pageSize?: number; pageToken?: string; active?: boolean }) {
	return apiClient<{ sessions: any[] }>(`/api/kratos/identities/${id}/sessions`, { params });
}

export async function deleteIdentitySessions(id: string) {
	return apiClient(`/api/kratos/identities/${id}/sessions`, { method: "DELETE" });
}
