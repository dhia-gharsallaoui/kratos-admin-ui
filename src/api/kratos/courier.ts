import { apiClient } from "@/lib/api-client";

export type CourierMessageStatus = "queued" | "sent" | "processing" | "abandoned";

export interface MessagesPage {
	messages: any[];
	nextPageToken: string | null;
	hasMore: boolean;
}

export async function listMessages(params?: { pageSize?: number; pageToken?: string; status?: CourierMessageStatus; recipient?: string }) {
	return apiClient<MessagesPage>("/api/kratos/courier/messages", { params });
}

export async function searchMessages(query: string, pageSize = 25, status?: CourierMessageStatus) {
	return apiClient<{ messages: any[]; totalMatched: number; hasMore: boolean; isSearchResult: boolean }>("/api/kratos/courier/messages/search", {
		params: { q: query, pageSize, status },
	});
}

export async function getMessage(id: string) {
	return apiClient<any>(`/api/kratos/courier/messages/${id}`);
}
