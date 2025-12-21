import type { IdentityApiListIdentitySessionsRequest } from "@ory/kratos-client";
import { withApiErrorHandling } from "@/utils/api-wrapper";
import { getAdminApi } from "../client";

// Session operations
export async function listIdentitySessions(params: IdentityApiListIdentitySessionsRequest) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.listIdentitySessions(params);
	}, "Kratos");
}

export async function listSessions(active?: boolean) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.listSessions({ expand: ["identity"], active });
	}, "Kratos");
}

// Get sessions with pagination for UI display
export async function getSessionsPage(options?: { pageToken?: string; pageSize?: number; active?: boolean; signal?: AbortSignal }) {
	const { pageToken, pageSize = 25, active, signal } = options || {};

	const requestParams: any = {
		pageSize,
		expand: ["identity"],
		active,
	};

	if (pageToken) {
		requestParams.pageToken = pageToken;
	}

	const response = await withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.listSessions(requestParams, { signal });
	}, "Kratos");

	// Extract next page token from Link header
	const linkHeader = response.headers?.link;
	let nextPageToken = null;

	if (linkHeader) {
		const nextMatch = linkHeader.match(/page_token=([^&>]+)[^>]*>;\s*rel="next"/);
		if (nextMatch) {
			nextPageToken = nextMatch[1];
		}
	}

	return {
		sessions: response.data,
		nextPageToken,
		hasMore: !!nextPageToken,
	};
}

// Get all sessions with automatic pagination handling
export async function getAllSessions(options?: {
	maxPages?: number;
	pageSize?: number;
	active?: boolean;
	onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
	const { maxPages = 20, pageSize = 250, active, onProgress } = options || {};

	let allSessions: any[] = [];
	let pageToken: string | undefined;
	let hasMore = true;
	let pageCount = 0;

	console.log("Starting getAllSessions fetch...");

	while (hasMore && pageCount < maxPages) {
		console.log(`Fetching sessions page ${pageCount + 1} with token: ${pageToken}`);

		try {
			const requestParams: any = {
				pageSize,
				expand: ["identity"],
				active,
			};

			// Only add pageToken if it's not the first page
			if (pageToken) {
				requestParams.pageToken = pageToken;
			}

			const response = await withApiErrorHandling(async () => {
				const adminApi = getAdminApi();
				return await adminApi.listSessions(requestParams);
			}, "Kratos");

			console.log(`Sessions page ${pageCount + 1}: Got ${response.data.length} sessions`);
			allSessions = [...allSessions, ...response.data];

			// Call progress callback if provided
			onProgress?.(allSessions.length, pageCount + 1);

			// Extract next page token from Link header
			const linkHeader = response.headers?.link;
			let nextPageToken = null;

			if (linkHeader) {
				const nextMatch = linkHeader.match(/page_token=([^&>]+)[^>]*>;\s*rel="next"/);
				if (nextMatch) {
					nextPageToken = nextMatch[1];
				}
			}

			hasMore = !!nextPageToken;
			pageToken = nextPageToken || "";
			pageCount++;

			console.log(`Next token: ${nextPageToken}, Has more: ${hasMore}`);

			// Small delay to avoid overwhelming the API
			if (hasMore) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		} catch (error) {
			console.error(`Error fetching sessions page ${pageCount + 1}:`, error);
			hasMore = false; // Stop on error
		}
	}

	console.log(`Total sessions fetched: ${allSessions.length}`);

	return {
		sessions: allSessions,
		totalCount: allSessions.length,
		isComplete: !hasMore, // true if we got all sessions, false if limited by maxPages
		pagesFetched: pageCount,
	};
}

// Get sessions until a specific date with smart pagination stopping
export async function getSessionsUntilDate(options?: {
	maxPages?: number;
	pageSize?: number;
	active?: boolean;
	untilDate?: Date;
	onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
	const {
		maxPages = 20,
		pageSize = 250,
		active,
		untilDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
		onProgress,
	} = options || {};

	let allSessions: any[] = [];
	let pageToken: string | undefined;
	let hasMore = true;
	let pageCount = 0;
	let shouldStop = false;

	console.log(`Starting getSessionsUntilDate fetch until: ${untilDate.toISOString()}`);

	while (hasMore && pageCount < maxPages && !shouldStop) {
		console.log(`Fetching sessions page ${pageCount + 1} with token: ${pageToken}`);

		try {
			const requestParams: any = {
				pageSize,
				expand: ["identity"],
				active,
			};

			// Only add pageToken if it's not the first page
			if (pageToken) {
				requestParams.pageToken = pageToken;
			}

			const response = await withApiErrorHandling(async () => {
				const adminApi = getAdminApi();
				return await adminApi.listSessions(requestParams);
			}, "Kratos");

			console.log(`Sessions page ${pageCount + 1}: Got ${response.data.length} sessions`);

			// Filter sessions and check if we should stop
			const currentPageSessions = response.data;
			const relevantSessions: any[] = [];

			for (const session of currentPageSessions) {
				// Check session creation date (authenticated_at is when session was created)
				const sessionDate = new Date(session.authenticated_at || session.issued_at || "");

				if (sessionDate >= untilDate) {
					relevantSessions.push(session);
				} else {
					// Found a session older than our cutoff date, stop fetching
					console.log(`Found session older than ${untilDate.toISOString()}, stopping pagination`);
					shouldStop = true;
					break;
				}
			}

			allSessions = [...allSessions, ...relevantSessions];

			// Call progress callback if provided
			onProgress?.(allSessions.length, pageCount + 1);

			// If we didn't find any relevant sessions in this page, also stop
			if (relevantSessions.length === 0) {
				console.log("No relevant sessions found in this page, stopping pagination");
				shouldStop = true;
			}

			if (!shouldStop) {
				// Extract next page token from Link header
				const linkHeader = response.headers?.link;
				let nextPageToken = null;

				if (linkHeader) {
					const nextMatch = linkHeader.match(/page_token=([^&>]+)[^>]*>;\s*rel="next"/);
					if (nextMatch) {
						nextPageToken = nextMatch[1];
					}
				}

				hasMore = !!nextPageToken;
				pageToken = nextPageToken || "";

				console.log(`Next token: ${nextPageToken}, Has more: ${hasMore}`);

				// Small delay to avoid overwhelming the API
				if (hasMore) {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}

			pageCount++;
		} catch (error) {
			console.error(`Error fetching sessions page ${pageCount + 1}:`, error);
			hasMore = false; // Stop on error
			shouldStop = true;
		}
	}

	console.log(`Total relevant sessions fetched: ${allSessions.length}`);

	return {
		sessions: allSessions,
		totalCount: allSessions.length,
		isComplete: shouldStop || !hasMore, // true if we got all relevant sessions
		pagesFetched: pageCount,
		stoppedAtDate: shouldStop, // indicates if we stopped due to date cutoff
	};
}

// Get detailed session information by ID
export async function getSession(id: string, expand?: ("identity" | "devices")[]) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.getSession({ id, expand });
	}, "Kratos");
}

export async function disableSession(id: string) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.disableSession({ id });
	}, "Kratos");
}

// Extend a session by ID
export async function extendSession(id: string) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.extendSession({ id });
	}, "Kratos");
}

// Delete all sessions for a specific identity
export async function deleteIdentitySessions(identityId: string) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.deleteIdentitySessions({ id: identityId });
	}, "Kratos");
}
