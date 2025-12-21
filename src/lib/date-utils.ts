/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Formats a date string or Date object to a localized string
 * @param date - Date string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
	if (!date) {
		return "";
	}

	try {
		const dateObj = typeof date === "string" ? new Date(date) : date;

		// Check if date is valid
		if (Number.isNaN(dateObj.getTime())) {
			return "";
		}

		// Default options for consistent formatting
		const defaultOptions: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		};

		return dateObj.toLocaleString(undefined, { ...defaultOptions, ...options });
	} catch (error) {
		console.warn("Error formatting date:", error);
		return "";
	}
};

/**
 * Formats a date to just the date part (no time)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string without time
 */
export const formatDateOnly = (date: string | Date | null | undefined): string => {
	return formatDate(date, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

/**
 * Formats a date to just the time part (no date)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted time string without date
 */
export const formatTimeOnly = (date: string | Date | null | undefined): string => {
	return formatDate(date, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

/**
 * Formats a date relative to now (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string, Date object, or null/undefined
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
	if (!date) {
		return "";
	}

	try {
		const dateObj = typeof date === "string" ? new Date(date) : date;

		if (Number.isNaN(dateObj.getTime())) {
			return "";
		}

		const now = new Date();
		const diffMs = now.getTime() - dateObj.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMinutes < 1) {
			return "Just now";
		} else if (diffMinutes < 60) {
			return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
		} else if (diffHours < 24) {
			return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
		} else if (diffDays < 30) {
			return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
		} else {
			return formatDate(date);
		}
	} catch (error) {
		console.warn("Error formatting relative time:", error);
		return formatDate(date);
	}
};
