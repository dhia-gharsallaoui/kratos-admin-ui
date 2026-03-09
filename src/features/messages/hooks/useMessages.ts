"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type CourierMessageStatus, getMessage, listMessages, searchMessages } from "@/api/kratos/courier";

export type { CourierMessageStatus };

// Infinite pagination messages hook
export const useMessagesPaginated = (options?: { pageSize?: number; status?: CourierMessageStatus; recipient?: string }) => {
	const { pageSize = 25, status, recipient } = options || {};

	return useInfiniteQuery({
		queryKey: ["messages", "paginated", { pageSize, status, recipient }],
		queryFn: async ({ pageParam }) => {
			return await listMessages({ pageSize, pageToken: pageParam, status, recipient });
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		refetchOnWindowFocus: false,
		staleTime: 30000,
		gcTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
				return false;
			}
			return failureCount < 2;
		},
	});
};

// Hook to fetch a single message by ID
export const useMessage = (messageId: string, options?: { enabled?: boolean }) => {
	const { enabled = true } = options || {};

	return useQuery({
		queryKey: ["message", messageId],
		queryFn: () => getMessage(messageId),
		enabled: enabled && !!messageId,
		staleTime: 60000,
		refetchOnWindowFocus: false,
		retry: 2,
	});
};

// Server-side search — single request instead of client-side multi-page scanning
export const useMessagesWithSearch = (searchQuery?: string, statusFilter?: CourierMessageStatus) => {
	const query = useQuery({
		queryKey: ["messages", "search", searchQuery, statusFilter],
		queryFn: () => searchMessages(searchQuery!, 50, statusFilter),
		enabled: !!searchQuery?.trim(),
		staleTime: 60000,
		refetchOnWindowFocus: false,
	});

	return {
		...query,
		data: query.data ? { pages: [{ messages: query.data.messages }] } : undefined,
		isAutoSearching: false,
		loadMoreMatches: () => {},
		fetchNextPage: () => Promise.resolve({} as any),
		hasNextPage: false,
		isFetchingNextPage: false,
	};
};
