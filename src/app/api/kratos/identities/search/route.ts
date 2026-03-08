import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { listIdentities } from "@/services/kratos/endpoints/identities";

/**
 * Server-side identity search.
 * Uses Kratos `previewCredentialsIdentifierSimilar` for fuzzy matching on identifiers,
 * then supplements with trait-based filtering for broader matches.
 */
export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const query = params.get("q")?.trim();
		const pageSize = getIntParam(params, "pageSize") || 25;

		if (!query) {
			return jsonResponse({ identities: [], totalMatched: 0, isSearchResult: false });
		}

		// Strategy: Use Kratos native fuzzy search first, then fall back to multi-page scan
		// if native search returns too few results (it only matches on credentials identifiers)
		const nativeResults = await listIdentities({
			pageSize: pageSize * 2, // fetch extra to account for dedup
			previewCredentialsIdentifierSimilar: query,
		});

		const nativeIdentities = nativeResults.data || [];

		// If native search found enough results, return them
		if (nativeIdentities.length >= pageSize) {
			return jsonResponse({
				identities: nativeIdentities.slice(0, pageSize),
				totalMatched: nativeIdentities.length,
				isSearchResult: true,
			});
		}

		// Supplement with multi-page scan for ID and trait matches
		// that the credential search might miss
		const nativeIds = new Set(nativeIdentities.map((i: any) => i.id));
		const allMatched = [...nativeIdentities];
		let pageToken: string | undefined;
		let hasMore = true;
		let pageCount = 0;
		const maxPages = 10;
		const searchLower = query.toLowerCase();

		while (allMatched.length < pageSize && hasMore && pageCount < maxPages) {
			const response = await listIdentities({ pageSize: 250, pageToken });

			for (const identity of response.data || []) {
				if (nativeIds.has(identity.id)) continue; // skip already matched

				const traits = identity.traits as any;
				const fields = [
					String(identity.id || ""),
					String(traits?.email || ""),
					String(traits?.username || ""),
					String(traits?.first_name || traits?.firstName || ""),
					String(traits?.last_name || traits?.lastName || ""),
					String(traits?.name || ""),
				];

				if (fields.some((f) => f.toLowerCase().includes(searchLower))) {
					allMatched.push(identity);
					if (allMatched.length >= pageSize) break;
				}
			}

			// Extract next page token
			const linkHeader = response.headers?.link;
			if (linkHeader) {
				const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
				pageToken = nextMatch?.[1];
				hasMore = !!pageToken;
			} else {
				hasMore = false;
			}

			pageCount++;
		}

		return jsonResponse({
			identities: allMatched.slice(0, pageSize),
			totalMatched: allMatched.length,
			isSearchResult: true,
		});
	} catch (error) {
		return errorResponse(error);
	}
});
