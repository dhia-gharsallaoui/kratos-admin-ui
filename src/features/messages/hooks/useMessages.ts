import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React from "react";
import { type CourierMessageStatus, getMessage, getMessagesPage } from "@/services/kratos/endpoints/courier";

// Infinite pagination messages hook
export const useMessagesPaginated = (options?: { pageSize?: number; status?: CourierMessageStatus; recipient?: string }) => {
	const { pageSize = 25, status, recipient } = options || {};

	return useInfiniteQuery({
		queryKey: ["messages", "paginated", { pageSize, status, recipient }],
		queryFn: async ({ pageParam, signal }) => {
			return await getMessagesPage({
				pageToken: pageParam,
				pageSize,
				status,
				recipient,
				signal,
			});
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		refetchOnWindowFocus: false,
		staleTime: 30000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: (failureCount, error: any) => {
			// Don't retry if the request was cancelled
			if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
				return false;
			}
			// Retry up to 2 times for other errors
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
		staleTime: 60000, // 1 minute
		refetchOnWindowFocus: false,
		retry: 2,
	});
};

// Auto-search hook that continues until enough matches found or all messages fetched
export const useMessagesWithSearch = (searchQuery?: string, statusFilter?: CourierMessageStatus) => {
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);
	const stopTimerRef = React.useRef<NodeJS.Timeout | null>(null);
	const [isAutoSearching, setIsAutoSearching] = React.useState(false);
	const [autoSearchTarget, setAutoSearchTarget] = React.useState(15);

	const query = useInfiniteQuery({
		queryKey: ["messages", "search", searchQuery, statusFilter],
		queryFn: async ({ pageParam, signal }) => {
			if (!searchQuery) {
				return { messages: [], nextPageToken: null, hasMore: false };
			}
			return await getMessagesPage({
				pageToken: pageParam,
				pageSize: 250, // Larger page size for search to get more results faster
				status: statusFilter,
				signal,
			});
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: !!searchQuery,
		staleTime: 60000, // 1 minute for search results
		refetchOnWindowFocus: false,
		retry: (failureCount, error: any) => {
			if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
				return false;
			}
			return failureCount < 2;
		},
	});

	// Auto-fetch logic: continue loading until we have enough matches or no more pages
	React.useEffect(() => {
		// Clear any existing timers
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

		// Get all messages loaded so far
		const allMessages = query.data.pages.flatMap((page) => page.messages);

		// Filter to get matches
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

		// Continue fetching if we haven't reached the current target and more pages available
		if (matches.length < autoSearchTarget && query.hasNextPage) {
			setIsAutoSearching(true);
			// Small delay to avoid overwhelming the API
			timerRef.current = setTimeout(() => {
				query.fetchNextPage();
			}, 300);

			return () => {
				if (timerRef.current) {
					clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			};
		} else {
			// Use a delay before stopping to avoid flashing during rapid page fetches
			stopTimerRef.current = setTimeout(() => {
				setIsAutoSearching(false);
			}, 500); // 500ms delay to ensure auto-search has actually stopped
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, query.data, query.hasNextPage, query.isFetchingNextPage, query.isLoading, query.fetchNextPage, autoSearchTarget]);

	// Reset target when search query changes
	React.useEffect(() => {
		setAutoSearchTarget(15);
	}, []);

	// Cleanup timers on unmount
	React.useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			if (stopTimerRef.current) {
				clearTimeout(stopTimerRef.current);
			}
		};
	}, []);

	// Function to load more matches (increase target by 15)
	const loadMoreMatches = React.useCallback(() => {
		setAutoSearchTarget((prev) => prev + 15);
	}, []);

	return { ...query, isAutoSearching, loadMoreMatches };
};
