/**
 * Application-wide constants for consistent configuration
 */

/**
 * Pagination configuration
 */
export const PAGINATION = {
	/** Default page size for data grids */
	DEFAULT_PAGE_SIZE: 25,
	/** Available page size options for data grids */
	PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
	/** Maximum number of items to fetch per page */
	MAX_PAGE_SIZE: 250,
} as const;

/**
 * Timing constants for animations and delays
 */
export const TIMING = {
	/** Copy to clipboard feedback duration (ms) */
	COPY_FEEDBACK_DURATION: 2000,
	/** Default debounce delay (ms) */
	DEBOUNCE_DELAY: 300,
	/** Search input debounce delay (ms) */
	SEARCH_DEBOUNCE_DELAY: 500,
	/** Toast notification duration (ms) */
	TOAST_DURATION: 5000,
} as const;

/**
 * Chart configuration defaults
 */
export const CHART_CONFIG = {
	/** Default chart height (px) */
	DEFAULT_HEIGHT: 350,
	/** Default gauge size (px) */
	GAUGE_SIZE: 280,
	/** Default chart margin */
	DEFAULT_MARGIN: { top: 20, right: 30, bottom: 60, left: 60 },
} as const;

/**
 * Data grid configuration
 */
export const DATA_GRID = {
	/** Border color with opacity */
	BORDER_COLOR: "rgba(102, 126, 234, 0.08)",
	/** Row hover background */
	ROW_HOVER_BG: "rgba(102, 126, 234, 0.08)",
	/** Header border color */
	HEADER_BORDER: "2px solid rgba(102, 126, 234, 0.2)",
} as const;

/**
 * Form validation constraints
 */
export const VALIDATION = {
	/** Minimum password length */
	MIN_PASSWORD_LENGTH: 8,
	/** Maximum text field length */
	MAX_TEXT_LENGTH: 1000,
	/** Maximum email length */
	MAX_EMAIL_LENGTH: 254,
	/** Username min length */
	MIN_USERNAME_LENGTH: 3,
	/** Username max length */
	MAX_USERNAME_LENGTH: 50,
} as const;

/**
 * API configuration
 */
export const API = {
	/** Request timeout (ms) */
	REQUEST_TIMEOUT: 30000,
	/** Max retry attempts */
	MAX_RETRY_ATTEMPTS: 3,
	/** Retry delay (ms) */
	RETRY_DELAY: 1000,
} as const;
