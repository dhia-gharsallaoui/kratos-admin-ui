import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getSessionsPage } from "@/services/kratos/endpoints/sessions";

/**
 * Server-side session search.
 * Fetches sessions page by page on the server and filters by identity display or session ID.
 */
export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const query = params.get("q")?.trim();
		const pageSize = getIntParam(params, "pageSize") || 25;

		if (!query) {
			return jsonResponse({ sessions: [], totalMatched: 0, isSearchResult: false });
		}

		const searchLower = query.toLowerCase();
		const matched: any[] = [];
		let pageToken: string | undefined;
		let hasMore = true;
		let pageCount = 0;
		const maxPages = 10;

		while (matched.length < pageSize && hasMore && pageCount < maxPages) {
			const page = await getSessionsPage({ pageToken, pageSize: 250 });

			for (const session of page.sessions) {
				const identity = session.identity;
				const identityDisplay = identity?.traits?.email || identity?.traits?.username || identity?.id || "";
				const id = session.id || "";

				if (identityDisplay.toLowerCase().includes(searchLower) || id.toLowerCase().includes(searchLower)) {
					matched.push(session);
					if (matched.length >= pageSize) break;
				}
			}

			hasMore = page.hasMore;
			pageToken = page.nextPageToken || undefined;
			pageCount++;
		}

		return jsonResponse({
			sessions: matched.slice(0, pageSize),
			totalMatched: matched.length,
			hasMore: hasMore && matched.length >= pageSize,
			isSearchResult: true,
		});
	} catch (error) {
		return errorResponse(error);
	}
});
