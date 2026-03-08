"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React from "react";
import { type CourierMessageStatus, getMessage, listMessages } from "@/api/kratos/courier";

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

// Auto-search hook
export const useMessagesWithSearch = (searchQuery?: string, statusFilter?: CourierMessageStatus) => {
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);
	const stopTimerRef = React.useRef<NodeJS.Timeout | null>(null);
	const [isAutoSearching, setIsAutoSearching] = React.useState(false);
	const [autoSearchTarget, setAutoSearchTarget] = React.useState(15);

	const query = useInfiniteQuery({
		queryKey: ["messages", "search", searchQuery, statusFilter],
		queryFn: async ({ pageParam }) => {
			if (!searchQuery) {
				return { messages: [], nextPageToken: null, hasMore: false };
			}
			return await listMessages({ pageSize: 250, pageToken: pageParam, status: statusFilter });
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: !!searchQuery,
		staleTime: 60000,
		refetchOnWindowFocus: false,
		retry: (failureCount, error: any) => {
			if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
				return false;
			}
			return failureCount < 2;
		},
	});

	React.useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (stopTimerRef.current) {
			clearTimeout(stopTimerRef.current);
			stopTimerRef.current = null;
		}

		if (!searchQuery || !query.data || query.isFetchingNextPage || query.isLoading) {
			return;
		}

		const allMessages = query.data.pages.flatMap((page) => page.messages);
		const matches = allMessages.filter((message: any) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				message.recipient?.toLowerCase().includes(searchLower) ||
				message.subject?.toLowerCase().includes(searchLower) ||
				message.id?.toLowerCase().includes(searchLower) ||
				message.template_type?.toLowerCase().includes(searchLower) ||
				message.type?.toLowerCase().includes(searchLower)
			);
		});

		if (matches.length < autoSearchTarget && query.hasNextPage) {
			setIsAutoSearching(true);
			timerRef.current = setTimeout(() => {
				query.fetchNextPage();
			}, 300);
			return () => {
				if (timerRef.current) {
					clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			};
		}
		stopTimerRef.current = setTimeout(() => {
			setIsAutoSearching(false);
		}, 500);
	}, [searchQuery, query.data, query.hasNextPage, query.isFetchingNextPage, query.isLoading, query.fetchNextPage, autoSearchTarget]);

	React.useEffect(() => {
		setAutoSearchTarget(15);
	}, []);
	React.useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
		};
	}, []);

	const loadMoreMatches = React.useCallback(() => {
		setAutoSearchTarget((prev) => prev + 15);
	}, []);

	return { ...query, isAutoSearching, loadMoreMatches };
};
