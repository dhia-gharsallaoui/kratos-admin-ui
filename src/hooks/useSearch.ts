import { useMemo } from "react";

/**
 * Custom hook for searching/filtering data arrays
 * @param data - Array of items to search through
 * @param searchFields - Array of field names to search in
 * @param searchTerm - Current search query
 * @returns Filtered array based on search term
 */
export function useSearch<T extends Record<string, any>>(data: T[], searchFields: (keyof T)[], searchTerm: string): T[] {
	return useMemo(() => {
		if (!searchTerm.trim()) return data;

		const lowerSearchTerm = searchTerm.toLowerCase();

		return data.filter((item) =>
			searchFields.some((field) => {
				const value = item[field];
				if (value == null) return false;
				return String(value).toLowerCase().includes(lowerSearchTerm);
			}),
		);
	}, [data, searchFields, searchTerm]);
}
