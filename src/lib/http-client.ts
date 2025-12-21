interface RetryOptions {
	maxRetries?: number;
	baseDelay?: number;
	maxDelay?: number;
	retryCondition?: (error: Error, attempt: number) => boolean;
	onRetry?: (error: Error, attempt: number) => void;
}

interface HttpClientOptions extends RetryOptions {
	timeout?: number;
	headers?: Record<string, string>;
}

class HttpError extends Error {
	constructor(
		message: string,
		public status?: number,
		public statusText?: string,
		public url?: string,
	) {
		super(message);
		this.name = "HttpError";
	}
}

class TimeoutError extends Error {
	constructor(timeout: number, url: string) {
		super(`Request timeout after ${timeout}ms: ${url}`);
		this.name = "TimeoutError";
	}
}

class NetworkError extends Error {
	constructor(
		message: string,
		public code?: string,
		public url?: string,
	) {
		super(message);
		this.name = "NetworkError";
	}
}

const DEFAULT_OPTIONS: Required<HttpClientOptions> = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 10000,
	timeout: 30000,
	headers: {},
	retryCondition: (error: Error, attempt: number) => {
		// Retry on network errors, timeouts, and 5xx status codes
		if (error instanceof NetworkError) return true;
		if (error instanceof TimeoutError) return true;
		if (error instanceof HttpError && error.status && error.status >= 500) return true;

		// Don't retry on 4xx errors (client errors)
		if (error instanceof HttpError && error.status && error.status >= 400 && error.status < 500) return false;

		return attempt < 3; // Default retry for other errors
	},
	onRetry: () => {
		// Silent retries by default
	},
};

export class HttpClient {
	private options: Required<HttpClientOptions>;

	constructor(options: HttpClientOptions = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
	}

	private async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private calculateDelay(attempt: number): number {
		// Exponential backoff with jitter
		const exponentialDelay = this.options.baseDelay * 2 ** (attempt - 1);
		const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
		return Math.min(exponentialDelay + jitter, this.options.maxDelay);
	}

	private createTimeoutSignal(timeout: number): {
		signal: AbortSignal;
		cleanup: () => void;
	} {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		return {
			signal: controller.signal,
			cleanup: () => clearTimeout(timeoutId),
		};
	}

	async fetch(url: string, init: RequestInit = {}): Promise<Response> {
		let lastError: Error;

		for (let attempt = 1; attempt <= this.options.maxRetries + 1; attempt++) {
			try {
				const { signal, cleanup } = this.createTimeoutSignal(this.options.timeout);

				try {
					const response = await fetch(url, {
						...init,
						headers: {
							...this.options.headers,
							...init.headers,
						},
						signal: init.signal || signal,
					});

					cleanup();

					// Check for HTTP errors
					if (!response.ok) {
						throw new HttpError(`HTTP ${response.status}: ${response.statusText}`, response.status, response.statusText, url);
					}

					return response;
				} catch (error) {
					cleanup();

					if (error instanceof Error) {
						// Handle AbortError (timeout)
						if (error.name === "AbortError") {
							throw new TimeoutError(this.options.timeout, url);
						}

						// Handle network errors
						if (
							error.message.includes("fetch") ||
							error.message.includes("network") ||
							error.message.includes("ECONNRESET") ||
							error.message.includes("ENOTFOUND") ||
							error.message.includes("socket hang up")
						) {
							throw new NetworkError(error.message, (error as any).code, url);
						}
					}

					throw error;
				}
			} catch (error) {
				lastError = error as Error;

				// Check if we should retry
				if (attempt <= this.options.maxRetries && this.options.retryCondition(lastError, attempt)) {
					this.options.onRetry(lastError, attempt);
					const delayMs = this.calculateDelay(attempt);
					await this.delay(delayMs);
					continue;
				}

				// No more retries, throw the last error
				throw lastError;
			}
		}

		throw lastError!;
	}

	async get(url: string, init?: Omit<RequestInit, "method">): Promise<Response> {
		return this.fetch(url, { ...init, method: "GET" });
	}

	async post(url: string, body?: any, init?: Omit<RequestInit, "method" | "body">): Promise<Response> {
		return this.fetch(url, {
			...init,
			method: "POST",
			body: typeof body === "string" ? body : JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				...init?.headers,
			},
		});
	}

	async put(url: string, body?: any, init?: Omit<RequestInit, "method" | "body">): Promise<Response> {
		return this.fetch(url, {
			...init,
			method: "PUT",
			body: typeof body === "string" ? body : JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				...init?.headers,
			},
		});
	}

	async patch(url: string, body?: any, init?: Omit<RequestInit, "method" | "body">): Promise<Response> {
		return this.fetch(url, {
			...init,
			method: "PATCH",
			body: typeof body === "string" ? body : JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				...init?.headers,
			},
		});
	}

	async delete(url: string, init?: Omit<RequestInit, "method">): Promise<Response> {
		return this.fetch(url, { ...init, method: "DELETE" });
	}
}

// Default instance with standard settings
export const httpClient = new HttpClient();

// Instance optimized for Kratos API calls
export const kratosHttpClient = new HttpClient({
	maxRetries: 3,
	baseDelay: 500,
	maxDelay: 5000,
	timeout: 30000,
	retryCondition: (error: Error, attempt: number) => {
		if (error instanceof NetworkError) return true;
		if (error instanceof TimeoutError) return true;
		if (error instanceof HttpError && error.status && error.status >= 500) return true;

		// Don't retry 4xx errors except for 429 (rate limit)
		if (error instanceof HttpError && error.status === 429) return true;
		if (error instanceof HttpError && error.status && error.status >= 400 && error.status < 500) return false;

		return attempt <= 3;
	},
	onRetry: () => {
		// Silent retries for Kratos API
	},
});

export { HttpError, TimeoutError, NetworkError };
