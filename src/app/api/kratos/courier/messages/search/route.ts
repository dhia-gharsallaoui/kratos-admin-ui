import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { getMessagesPage } from "@/services/kratos/endpoints/courier";

/**
 * Server-side courier message search.
 * Fetches messages page by page on the server and filters by recipient, subject, ID, or type.
 */
export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const query = params.get("q")?.trim();
		const status = (params.get("status") as any) || undefined;
		const pageSize = getIntParam(params, "pageSize") || 25;

		if (!query) {
			return jsonResponse({ messages: [], totalMatched: 0, isSearchResult: false });
		}

		const searchLower = query.toLowerCase();
		const matched: any[] = [];
		let pageToken: string | undefined;
		let hasMore = true;
		let pageCount = 0;
		const maxPages = 10;

		while (matched.length < pageSize && hasMore && pageCount < maxPages) {
			const page = await getMessagesPage({ pageToken, pageSize: 250, status });

			for (const message of page.messages) {
				const fields = [message.recipient || "", message.subject || "", message.id || "", message.template_type || "", message.type || ""];

				if (fields.some((f: string) => f.toLowerCase().includes(searchLower))) {
					matched.push(message);
					if (matched.length >= pageSize) break;
				}
			}

			hasMore = page.hasMore;
			pageToken = page.nextPageToken || undefined;
			pageCount++;
		}

		return jsonResponse({
			messages: matched.slice(0, pageSize),
			totalMatched: matched.length,
			hasMore: hasMore && matched.length >= pageSize,
			isSearchResult: true,
		});
	} catch (error) {
		return errorResponse(error);
	}
});
