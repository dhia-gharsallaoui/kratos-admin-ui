/**
 * Error handling utilities for better user-facing error messages
 */

export interface ParsedError {
	title: string;
	message: string;
	type: "connection" | "network" | "api" | "unknown";
	canRetry: boolean;
	suggestSettings: boolean;
}

/**
 * Parse an error and return a user-friendly error object
 */
export function parseError(error: unknown): ParsedError {
	// Handle network/connection errors
	if (error instanceof Error) {
		const errorMessage = error.message.toLowerCase();

		// Connection refused / network errors
		if (
			errorMessage.includes("fetch failed") ||
			errorMessage.includes("failed to fetch") ||
			errorMessage.includes("network request failed") ||
			errorMessage.includes("network error") ||
			errorMessage.includes("connection refused") ||
			errorMessage.includes("econnrefused")
		) {
			return {
				title: "Connection Failed",
				message: "Unable to connect to the server. Please check that Kratos and Hydra are running and the endpoint URLs are correct.",
				type: "connection",
				canRetry: true,
				suggestSettings: true,
			};
		}

		// Timeout errors
		if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
			return {
				title: "Request Timeout",
				message: "The server took too long to respond. This might be a temporary issue.",
				type: "network",
				canRetry: true,
				suggestSettings: false,
			};
		}

		// CORS errors
		if (errorMessage.includes("cors") || errorMessage.includes("cross-origin")) {
			return {
				title: "CORS Error",
				message: "Cross-origin request blocked. Please check your server CORS configuration.",
				type: "network",
				canRetry: false,
				suggestSettings: true,
			};
		}

		// Invalid URL errors
		if (errorMessage.includes("invalid url") || errorMessage.includes("malformed")) {
			return {
				title: "Invalid Configuration",
				message: "The endpoint URL appears to be invalid. Please check your settings.",
				type: "connection",
				canRetry: false,
				suggestSettings: true,
			};
		}

		// 404 errors
		if (errorMessage.includes("404") || errorMessage.includes("not found")) {
			return {
				title: "Endpoint Not Found",
				message: "The requested endpoint was not found. Please verify the API URL is correct.",
				type: "api",
				canRetry: false,
				suggestSettings: true,
			};
		}

		// 401/403 errors
		if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("unauthorized")) {
			return {
				title: "Authentication Error",
				message: "Access denied. Please check your authentication configuration.",
				type: "api",
				canRetry: false,
				suggestSettings: true,
			};
		}

		// 500 errors
		if (errorMessage.includes("500") || errorMessage.includes("internal server")) {
			return {
				title: "Server Error",
				message: "The server encountered an error. This is usually temporary.",
				type: "api",
				canRetry: true,
				suggestSettings: false,
			};
		}

		// Generic error with message
		return {
			title: "Error",
			message: error.message || "An unexpected error occurred.",
			type: "unknown",
			canRetry: true,
			suggestSettings: false,
		};
	}

	// Handle string errors
	if (typeof error === "string") {
		return {
			title: "Error",
			message: error,
			type: "unknown",
			canRetry: true,
			suggestSettings: false,
		};
	}

	// Handle objects with error information
	if (error && typeof error === "object" && "message" in error) {
		return parseError(new Error((error as any).message));
	}

	// Fallback for unknown errors
	return {
		title: "Unknown Error",
		message: "An unexpected error occurred. Please try again.",
		type: "unknown",
		canRetry: true,
		suggestSettings: false,
	};
}

/**
 * Check if an error is a connection error
 */
export function isConnectionError(error: unknown): boolean {
	const parsed = parseError(error);
	return parsed.type === "connection";
}

/**
 * Check if settings should be suggested for this error
 */
export function shouldSuggestSettings(error: unknown): boolean {
	const parsed = parseError(error);
	return parsed.suggestSettings;
}
