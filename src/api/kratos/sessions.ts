import { apiClient } from "@/lib/api-client";

export interface SessionsPage {
	sessions: any[];
	nextPageToken: string | null;
	hasMore: boolean;
}

export async function listSessions(params?: { pageSize?: number; pageToken?: string; active?: boolean }) {
	return apiClient<SessionsPage>("/api/kratos/sessions", { params });
}

export async function getSession(id: string, expand?: string[]) {
	return apiClient<any>(`/api/kratos/sessions/${id}`, {
		params: expand ? { expand: expand.join(",") } : undefined,
	});
}

export async function disableSession(id: string) {
	return apiClient(`/api/kratos/sessions/${id}`, { method: "DELETE" });
}

export async function extendSession(id: string) {
	return apiClient<any>(`/api/kratos/sessions/${id}`, { method: "PATCH", body: { action: "extend" } });
}
