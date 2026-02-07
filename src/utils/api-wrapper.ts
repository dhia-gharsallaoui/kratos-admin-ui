/**
 * API Error Wrapper
 * Provides consistent error handling for external API calls
 */

export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	originalError: any;
}

export class ApiCallError extends Error {
	public status?: number;
	public code?: string;
	public originalError: any;

	constructor(message: string, status?: number, code?: string, originalError?: any) {
		super(message);
		this.name = "ApiCallError";
		this.status = status;
		this.code = code;
		this.originalError = originalError;
	}
}

/**
 * Wrapper for API calls that provides consistent error handling
 * Usage: const result = await withApiErrorHandling(() => api.someMethod(), 'Kratos');
 */
export async function withApiErrorHandling<T>(apiCall: () => Promise<T>, serviceName: string = "API"): Promise<T> {
	try {
		return await apiCall();
	} catch (error: any) {
		// Don't log or wrap canceled requests - they're expected when components unmount
		const isCanceled = error?.name === "CanceledError" || error?.code === "ERR_CANCELED" || error?.name === "AbortError";
		if (isCanceled) {
			// Re-throw as-is so React Query can handle it properly
			throw error;
		}

		// Log the error for debugging
		console.error(`[${serviceName}] API call failed:`, error);

		// Extract meaningful error information
		let message = `${serviceName} request failed`;
		let status: number | undefined;
		let code: string | undefined;

		// Handle Axios-style errors
		if (error.response) {
			status = error.response.status;
			message = `${serviceName} returned ${status}`;

			if (error.response.data?.error?.reason) {
				message = error.response.data.error.reason;
			} else if (error.response.data?.error?.message) {
				message = error.response.data.error.message;
			} else if (error.response.data?.message) {
				message = error.response.data.message;
			} else if (error.response.statusText) {
				message = `${serviceName} ${error.response.statusText}`;
			}
		}
		// Handle network errors
		else if (error.request) {
			code = error.code || "NETWORK_ERROR";

			if (error.code === "ECONNREFUSED") {
				message = `Cannot connect to ${serviceName} - connection refused`;
			} else if (error.code === "ETIMEDOUT") {
				message = `${serviceName} request timed out`;
			} else if (error.message?.includes("fetch failed")) {
				message = `Cannot connect to ${serviceName} - fetch failed`;
			} else {
				message = `Network error while connecting to ${serviceName}`;
			}
		}
		// Handle other errors
		else if (error.message) {
			message = error.message;
		}

		// Throw a structured error
		throw new ApiCallError(message, status, code, error);
	}
}

/**
 * Creates a wrapped version of an API function with error handling
 * Usage: const safeListSessions = createApiWrapper(listSessions, 'Kratos');
 */
export function createApiWrapper<TArgs extends any[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, serviceName: string) {
	return async (...args: TArgs): Promise<TReturn> => {
		return withApiErrorHandling(() => fn(...args), serviceName);
	};
}
