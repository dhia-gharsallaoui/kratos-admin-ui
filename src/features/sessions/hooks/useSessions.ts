"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { listSessions } from "@/api/kratos/sessions";

// Infinite pagination sessions hook with automatic cleanup
export const useSessionsPaginated = (options?: { pageSize?: number; active?: boolean }) => {
	const { pageSize = 25, active } = options || {};

	return useInfiniteQuery({
		queryKey: ["sessions", "paginated", { pageSize, active }],
		queryFn: async ({ pageParam }) => {
			return await listSessions({ pageSize, pageToken: pageParam, active });
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

// Auto-search hook that continues until enough matches found or all sessions fetched
export const useSessionsWithSearch = (searchQuery?: string) => {
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);
	const stopTimerRef = React.useRef<NodeJS.Timeout | null>(null);
	const [isAutoSearching, setIsAutoSearching] = React.useState(false);
	const [autoSearchTarget, setAutoSearchTarget] = React.useState(15);

	const query = useInfiniteQuery({
		queryKey: ["sessions", "search", searchQuery],
		queryFn: async ({ pageParam }) => {
			if (!searchQuery) {
				return { sessions: [], nextPageToken: null, hasMore: false };
			}
			return await listSessions({ pageSize: 250, pageToken: pageParam });
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

	// Auto-fetch logic
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

		const allSessions = query.data.pages.flatMap((page) => page.sessions);

		const matches = allSessions.filter((session) => {
			const identityDisplay = session.identity?.traits?.email || session.identity?.traits?.username || session.identity?.id || "Unknown";
			const id = session.id;
			const lowerQuery = searchQuery.toLowerCase();
			return identityDisplay.toLowerCase().includes(lowerQuery) || id.toLowerCase().includes(lowerQuery);
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
