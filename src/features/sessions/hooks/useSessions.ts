"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { listSessions, searchSessions } from "@/api/kratos/sessions";

// Infinite pagination sessions hook
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

// Server-side search — single request instead of client-side multi-page scanning
export const useSessionsWithSearch = (searchQuery?: string) => {
	const query = useQuery({
		queryKey: ["sessions", "search", searchQuery],
		queryFn: () => searchSessions(searchQuery!, 50),
		enabled: !!searchQuery?.trim(),
		staleTime: 60000,
		refetchOnWindowFocus: false,
	});

	return {
		...query,
		data: query.data ? { pages: [{ sessions: query.data.sessions }] } : undefined,
		isAutoSearching: false,
		loadMoreMatches: () => {},
		fetchNextPage: () => Promise.resolve({} as any),
		hasNextPage: false,
		isFetchingNextPage: false,
	};
};
