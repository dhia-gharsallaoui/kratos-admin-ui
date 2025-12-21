import { useCallback, useState } from "react";
import { HttpError, NetworkError, TimeoutError } from "@/lib/http-client";

interface UseRetryRequestOptions {
	maxRetries?: number;
	baseDelay?: number;
	onRetry?: (error: Error, attempt: number) => void;
	onError?: (error: Error) => void;
}

interface UseRetryRequestResult<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
	retry: () => Promise<void>;
	execute: () => Promise<T>;
	reset: () => void;
}

export function useRetryRequest<T>(requestFn: () => Promise<T>, options: UseRetryRequestOptions = {}): UseRetryRequestResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const execute = useCallback(async (): Promise<T> => {
		setLoading(true);
		setError(null);

		try {
			const result = await requestFn();
			setData(result);
			setLoading(false);
			return result;
		} catch (err) {
			const error = err as Error;
			setError(error);
			setLoading(false);
			options.onError?.(error);
			throw error;
		}
	}, [requestFn, options]);

	const retry = useCallback(async (): Promise<void> => {
		await execute();
	}, [execute]);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setLoading(false);
	}, []);

	return {
		data,
		loading,
		error,
		retry,
		execute,
		reset,
	};
}

// Hook specifically for Kratos API calls with enhanced error handling
export function useKratosRequest<T>(requestFn: () => Promise<T>, options: UseRetryRequestOptions = {}) {
	const enhancedOptions: UseRetryRequestOptions = {
		maxRetries: 3,
		baseDelay: 1000,
		onRetry: (error, attempt) => {
			// Silent retries, only call user-provided onRetry
			options.onRetry?.(error, attempt);
		},
		onError: (error) => {
			if (error instanceof HttpError) {
				console.error("[Kratos Request] HTTP Error:", {
					status: error.status,
					message: error.message,
					url: error.url,
				});
			} else if (error instanceof NetworkError) {
				console.error("[Kratos Request] Network Error:", error.message);
			} else if (error instanceof TimeoutError) {
				console.error("[Kratos Request] Timeout Error:", error.message);
			} else {
				console.error("[Kratos Request] Unknown Error:", error);
			}
			options.onError?.(error);
		},
		...options,
	};

	return useRetryRequest(requestFn, enhancedOptions);
}

// Utility function to check if an error is retryable
export function isRetryableError(error: Error): boolean {
	if (error instanceof NetworkError) return true;
	if (error instanceof TimeoutError) return true;
	if (error instanceof HttpError && error.status && error.status >= 500) return true;
	if (error instanceof HttpError && error.status === 429) return true; // Rate limit

	return false;
}

// Utility function to get user-friendly error message
export function getErrorMessage(error: Error): string {
	if (error instanceof HttpError) {
		if (error.status === 404) return "Resource not found";
		if (error.status === 401) return "Authentication required";
		if (error.status === 403) return "Access denied";
		if (error.status === 429) return "Too many requests, please try again later";
		if (error.status && error.status >= 500) return "Server error, please try again";
		return error.message;
	}

	if (error instanceof NetworkError) {
		return "Network connection failed. Please check your internet connection and Kratos configuration.";
	}

	if (error instanceof TimeoutError) {
		return "Request timed out. Please try again.";
	}

	return error.message || "An unexpected error occurred";
}
