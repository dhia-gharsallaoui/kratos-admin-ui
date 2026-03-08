import { ApiCallError } from "@/utils/api-wrapper";

interface ApiClientOptions extends Omit<RequestInit, "body"> {
	params?: Record<string, string | number | boolean | undefined>;
	body?: unknown;
}

/** Client-side fetch wrapper for calling API routes */
export async function apiClient<T>(path: string, options?: ApiClientOptions): Promise<T> {
	const { params, body, ...fetchOptions } = options || {};

	// Build URL with query params
	let url = path;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				searchParams.set(key, String(value));
			}
		}
		const queryString = searchParams.toString();
		if (queryString) {
			url = `${path}?${queryString}`;
		}
	}

	const headers: Record<string, string> = {};
	if (body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers: { ...headers, ...(fetchOptions.headers as Record<string, string>) },
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		let errorData: any = {};
		try {
			errorData = await response.json();
		} catch {
			// Response body isn't JSON
		}

		throw new ApiCallError(errorData.error || errorData.message || `Request failed with status ${response.status}`, response.status, errorData.code);
	}

	// Handle 204 No Content
	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}
