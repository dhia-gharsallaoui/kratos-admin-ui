import { useCallback, useMemo } from "react";

export interface UseFormattersReturn {
	formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
	formatDateTime: (date: string | Date) => string;
	formatRelativeTime: (date: string | Date) => string;
	formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
	formatCurrency: (amount: number, currency?: string) => string;
	formatPercentage: (value: number, decimals?: number) => string;
	formatDuration: (minutes: number) => string;
	formatBytes: (bytes: number, decimals?: number) => string;
}

/**
 * Custom hook providing common formatting utilities
 * @param locale - Locale string (default: 'en-US')
 * @returns Object with various formatting functions
 */
export function useFormatters(locale = "en-US"): UseFormattersReturn {
	const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);

	const dateTimeFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		[locale],
	);

	const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

	const formatDate = useCallback(
		(date: string | Date, options?: Intl.DateTimeFormatOptions) => {
			try {
				const dateObj = typeof date === "string" ? new Date(date) : date;
				if (Number.isNaN(dateObj.getTime())) return "Invalid date";
				if (options) {
					return new Intl.DateTimeFormat(locale, options).format(dateObj);
				}
				return dateFormatter.format(dateObj);
			} catch {
				return "Invalid date";
			}
		},
		[dateFormatter, locale],
	);

	const formatDateTime = useCallback(
		(date: string | Date) => {
			try {
				const dateObj = typeof date === "string" ? new Date(date) : date;
				if (Number.isNaN(dateObj.getTime())) return "Invalid date";
				return dateTimeFormatter.format(dateObj);
			} catch {
				return "Invalid date";
			}
		},
		[dateTimeFormatter],
	);

	const formatRelativeTime = useCallback((date: string | Date) => {
		try {
			const dateObj = typeof date === "string" ? new Date(date) : date;
			if (Number.isNaN(dateObj.getTime())) return "Invalid date";

			const now = new Date();
			const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

			if (diffInSeconds < 60) return "just now";
			if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
			if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
			if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
			if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
			if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
			return `${Math.floor(diffInSeconds / 31536000)}y ago`;
		} catch {
			return "Invalid date";
		}
	}, []);

	const formatNumber = useCallback(
		(num: number, options?: Intl.NumberFormatOptions) => {
			try {
				if (options) {
					return new Intl.NumberFormat(locale, options).format(num);
				}
				return numberFormatter.format(num);
			} catch {
				return String(num);
			}
		},
		[numberFormatter, locale],
	);

	const formatCurrency = useCallback(
		(amount: number, currency = "USD") => {
			try {
				return new Intl.NumberFormat(locale, {
					style: "currency",
					currency,
				}).format(amount);
			} catch {
				return `${currency} ${amount}`;
			}
		},
		[locale],
	);

	const formatPercentage = useCallback((value: number, decimals = 0) => {
		try {
			return `${value.toFixed(decimals)}%`;
		} catch {
			return `${value}%`;
		}
	}, []);

	const formatDuration = useCallback((minutes: number) => {
		if (minutes < 60) {
			return `${minutes}m`;
		}
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		if (remainingMinutes === 0) {
			return `${hours}h`;
		}
		return `${hours}h ${remainingMinutes}m`;
	}, []);

	const formatBytes = useCallback((bytes: number, decimals = 2) => {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
	}, []);

	return {
		formatDate,
		formatDateTime,
		formatRelativeTime,
		formatNumber,
		formatCurrency,
		formatPercentage,
		formatDuration,
		formatBytes,
	};
}
