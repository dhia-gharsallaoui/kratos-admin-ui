import { useCallback, useMemo, useState } from "react";

export interface UsePaginationReturn<T> {
	currentPage: number;
	pageSize: number;
	totalPages: number;
	paginatedData: T[];
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	goToFirstPage: () => void;
	goToLastPage: () => void;
}

/**
 * Custom hook for client-side pagination
 * @param data - Array of items to paginate
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Object with pagination state and control functions
 */
export function usePagination<T>(data: T[], initialPageSize = 10): UsePaginationReturn<T> {
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize, setPageSizeState] = useState(initialPageSize);

	const totalPages = useMemo(() => Math.ceil(data.length / pageSize), [data.length, pageSize]);

	const paginatedData = useMemo(() => {
		const start = currentPage * pageSize;
		const end = start + pageSize;
		return data.slice(start, end);
	}, [data, currentPage, pageSize]);

	const setPage = useCallback(
		(page: number) => {
			const newPage = Math.max(0, Math.min(page, totalPages - 1));
			setCurrentPage(newPage);
		},
		[totalPages],
	);

	const setPageSize = useCallback((size: number) => {
		setPageSizeState(size);
		setCurrentPage(0); // Reset to first page when changing page size
	}, []);

	const nextPage = useCallback(() => {
		setPage(currentPage + 1);
	}, [currentPage, setPage]);

	const prevPage = useCallback(() => {
		setPage(currentPage - 1);
	}, [currentPage, setPage]);

	const goToFirstPage = useCallback(() => {
		setCurrentPage(0);
	}, []);

	const goToLastPage = useCallback(() => {
		setCurrentPage(totalPages - 1);
	}, [totalPages]);

	return {
		currentPage,
		pageSize,
		totalPages,
		paginatedData,
		setPage,
		setPageSize,
		nextPage,
		prevPage,
		goToFirstPage,
		goToLastPage,
	};
}
