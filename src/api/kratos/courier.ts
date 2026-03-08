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

export async function getMessage(id: string) {
	return apiClient<any>(`/api/kratos/courier/messages/${id}`);
}
