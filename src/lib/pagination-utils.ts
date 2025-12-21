/**
 * Pagination utilities for handling Kratos API link headers and pagination tokens
 */

/**
 * Parses the Link header from a response to extract pagination tokens
 * @param linkHeader - The Link header value from an HTTP response
 * @returns Object containing next and previous page tokens, or null if not found
 */
export const parseLinkHeader = (
	linkHeader: string | null | undefined,
): {
	next: string | null;
	prev: string | null;
} => {
	const result = {
		next: null as string | null,
		prev: null as string | null,
	};

	if (!linkHeader) {
		return result;
	}

	try {
		// Parse next page token
		// Supports both formats found in the codebase:
		// 1. page_token=([^&>]+)[^>]*>;\s*rel="next"
		// 2. <[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"
		const nextMatch = linkHeader.match(/(?:<[^>]*[?&])?page_token=([^&>]+)[^>]*>;\s*rel="next"/);
		if (nextMatch) {
			result.next = nextMatch[1];
		}

		// Parse previous page token
		const prevMatch = linkHeader.match(/(?:<[^>]*[?&])?page_token=([^&>]+)[^>]*>;\s*rel="prev"/);
		if (prevMatch) {
			result.prev = prevMatch[1];
		}
	} catch (error) {
		console.warn("Error parsing Link header:", error);
	}

	return result;
};

/**
 * Interface for paginated response data
 */
export interface PaginatedResponse<T = any> {
	data: T[];
	hasMore: boolean;
	nextPageToken: string | null;
	prevPageToken: string | null;
	totalCount?: number;
}

/**
 * Processes a response with Link header to create a standardized paginated response
 * @param data - The response data array
 * @param headers - Response headers object
 * @param dataKey - Key to extract data from if response is nested (optional)
 * @returns Standardized paginated response
 */
export const processPaginatedResponse = <T = any>(data: any, headers: Record<string, any> | Headers, dataKey?: string): PaginatedResponse<T> => {
	// Extract link header (support both Headers object and plain object)
	const linkHeader = headers instanceof Headers ? headers.get("link") : headers?.link;

	const { next, prev } = parseLinkHeader(linkHeader);

	// Extract actual data array
	const responseData = dataKey && data ? data[dataKey] : data;
	const dataArray = Array.isArray(responseData) ? responseData : [];

	return {
		data: dataArray,
		hasMore: next !== null,
		nextPageToken: next,
		prevPageToken: prev,
	};
};

/**
 * Progress callback for paginated fetch operations
 */
export type PaginationProgressCallback = (current: number, total?: number) => void;

/**
 * Options for fetching all pages of data
 */
export interface FetchAllPagesOptions<_T> {
	/** Maximum number of pages to fetch (safety limit) */
	maxPages?: number;
	/** Progress callback function */
	onProgress?: PaginationProgressCallback;
	/** Key to extract data from nested response */
	dataKey?: string;
	/** Whether to stop on first error or continue */
	stopOnError?: boolean;
}

/**
 * Fetches all pages of paginated data using a fetch function
 * @param fetchPage - Function that fetches a single page given a page token
 * @param options - Options for the fetch operation
 * @returns All data combined from all pages
 */
export const fetchAllPages = async <T = any>(
	fetchPage: (pageToken?: string) => Promise<{ data: any; headers: Record<string, any> }>,
	options: FetchAllPagesOptions<T> = {},
): Promise<T[]> => {
	const { maxPages = 100, onProgress, dataKey, stopOnError = true } = options;

	const allData: T[] = [];
	let currentPageToken: string | undefined;
	let pageCount = 0;
	const errors: Error[] = [];

	while (pageCount < maxPages) {
		try {
			onProgress?.(pageCount + 1);

			const response = await fetchPage(currentPageToken);
			const paginatedResponse = processPaginatedResponse<T>(response.data, response.headers, dataKey);

			allData.push(...paginatedResponse.data);
			pageCount++;

			// Check if there are more pages
			if (!paginatedResponse.hasMore || !paginatedResponse.nextPageToken) {
				break;
			}

			currentPageToken = paginatedResponse.nextPageToken;
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			errors.push(err);

			if (stopOnError) {
				throw err;
			}

			console.warn(`Error fetching page ${pageCount + 1}:`, err);
			break;
		}
	}

	// Log summary
	if (errors.length > 0 && !stopOnError) {
		console.warn(`Completed with ${errors.length} errors. Fetched ${allData.length} items from ${pageCount} pages.`);
	}

	if (pageCount >= maxPages) {
		console.warn(`Reached maximum page limit (${maxPages}). There may be more data available.`);
	}

	return allData;
};

/**
 * Creates pagination parameters for API calls
 * @param pageToken - Current page token
 * @param pageSize - Number of items per page
 * @returns URL search parameters for pagination
 */
export const createPaginationParams = (pageToken?: string, pageSize?: number): Record<string, string> => {
	const params: Record<string, string> = {};

	if (pageSize !== undefined) {
		params.page_size = String(pageSize);
	}

	if (pageToken) {
		params.page_token = pageToken;
	}

	return params;
};
