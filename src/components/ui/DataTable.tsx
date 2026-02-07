import { Add, Clear, NavigateBefore, NavigateNext, Refresh, Search } from "@mui/icons-material";
import {
	Alert,
	Box,
	Checkbox,
	CircularProgress,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

export interface DataTableColumn<T = any> {
	field: string;
	headerName: string;
	flex?: number;
	minWidth?: number;
	maxWidth?: number;
	width?: number;
	sortable?: boolean;
	filterable?: boolean;
	renderCell?: (value: any, row: T, index: number) => React.ReactNode;
	valueGetter?: (row: T) => any;
	valueFormatter?: (value: any) => string;
}

export interface DataTableProps<T = any> {
	// Data
	data: T[];
	columns: DataTableColumn<T>[];
	keyField?: string;

	// Loading states
	loading?: boolean;
	error?: string | null;

	// Search functionality
	searchable?: boolean;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	searchFields?: string[];

	// Pagination
	pagination?: boolean;
	currentPage?: number;
	pageSize?: number;
	totalCount?: number;
	hasNextPage?: boolean;
	hasPreviousPage?: boolean;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSizeOptions?: number[];

	// Actions
	onRowClick?: (row: T, index: number) => void;
	onRefresh?: () => void;
	onAdd?: () => void;
	addButtonText?: string;

	// Filters
	filters?: Array<{
		field: string;
		label: string;
		value: any;
		options: Array<{ label: string; value: any }>;
		onChange: (value: any) => void;
	}>;

	// Selection
	selectable?: boolean;
	selectedKeys?: Set<string>;
	onSelectionChange?: (selectedKeys: Set<string>) => void;

	// Styling
	maxHeight?: number;
	emptyMessage?: string;
	className?: string;
}

export const DataTable = React.memo(
	<T extends Record<string, any>>({
		data,
		columns,
		keyField = "id",
		loading = false,
		error = null,
		searchable = true,
		searchValue = "",
		onSearchChange,
		searchPlaceholder = "Search...",
		searchFields = [],
		pagination = false,
		currentPage = 1,
		pageSize = 25,
		totalCount,
		hasNextPage = false,
		hasPreviousPage = false,
		onPageChange,
		onPageSizeChange,
		pageSizeOptions = [10, 25, 50, 100],
		onRowClick,
		onRefresh,
		onAdd,
		addButtonText = "Add",
		filters = [],
		selectable = false,
		selectedKeys,
		onSelectionChange,
		maxHeight = 600,
		emptyMessage = "No data available",
		className,
	}: DataTableProps<T>) => {
		const [internalSearchValue, setInternalSearchValue] = useState(searchValue);
		const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

		// Debounce search input
		useEffect(() => {
			const timer = setTimeout(() => {
				setDebouncedSearchValue(internalSearchValue);
				onSearchChange?.(internalSearchValue);
			}, 300);

			return () => clearTimeout(timer);
		}, [internalSearchValue, onSearchChange]);

		// Update internal search when external value changes
		useEffect(() => {
			setInternalSearchValue(searchValue);
		}, [searchValue]);

		// Filter data based on search if no external search handling
		const filteredData = useMemo(() => {
			if (!searchable || !debouncedSearchValue || onSearchChange) {
				return data;
			}

			const searchLower = debouncedSearchValue.toLowerCase();
			return data.filter((row) => {
				// If specific search fields are provided, only search those
				if (searchFields.length > 0) {
					return searchFields.some((field) => {
						const value = String(row[field] || "").toLowerCase();
						return value.includes(searchLower);
					});
				}

				// Otherwise search all string fields
				return Object.values(row).some((value) =>
					String(value || "")
						.toLowerCase()
						.includes(searchLower),
				);
			});
		}, [data, debouncedSearchValue, searchable, onSearchChange, searchFields]);

		const handleClearSearch = useCallback(() => {
			setInternalSearchValue("");
			onSearchChange?.("");
		}, [onSearchChange]);

		const handleClearFilters = useCallback(() => {
			for (const filter of filters) {
				filter.onChange("");
			}
			handleClearSearch();
		}, [filters, handleClearSearch]);

		const renderLoadingSkeleton = () => (
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							{selectable && (
								<TableCell padding="checkbox">
									<Skeleton width={20} height={20} />
								</TableCell>
							)}
							{columns.map((column) => (
								<TableCell key={column.field} style={{ minWidth: column.minWidth }}>
									<Skeleton width="60%" height={20} />
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.from({ length: pageSize }).map((_, index) => (
							<TableRow key={index}>
								{selectable && (
									<TableCell padding="checkbox">
										<Skeleton width={20} height={20} />
									</TableCell>
								)}
								{columns.map((column) => (
									<TableCell key={column.field}>
										<Skeleton width="80%" height={20} />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);

		const renderCell = useCallback((column: DataTableColumn<T>, row: T, index: number) => {
			let value = column.valueGetter ? column.valueGetter(row) : row[column.field];

			if (column.renderCell) {
				return column.renderCell(value, row, index);
			}

			if (column.valueFormatter) {
				value = column.valueFormatter(value);
			}

			return value;
		}, []);

		const totalColumns = selectable ? columns.length + 1 : columns.length;

		const allVisibleSelected =
			selectable && filteredData.length > 0 && selectedKeys ? filteredData.every((row) => selectedKeys.has(row[keyField])) : false;

		const someVisibleSelected =
			selectable && selectedKeys ? filteredData.some((row) => selectedKeys.has(row[keyField])) && !allVisibleSelected : false;

		const handleSelectAll = useCallback(() => {
			if (!onSelectionChange) return;
			if (allVisibleSelected) {
				onSelectionChange(new Set());
			} else {
				onSelectionChange(new Set(filteredData.map((row) => row[keyField])));
			}
		}, [allVisibleSelected, filteredData, keyField, onSelectionChange]);

		const handleSelectRow = useCallback(
			(rowKey: string) => {
				if (!onSelectionChange || !selectedKeys) return;
				const next = new Set(selectedKeys);
				if (next.has(rowKey)) {
					next.delete(rowKey);
				} else {
					next.add(rowKey);
				}
				onSelectionChange(next);
			},
			[onSelectionChange, selectedKeys],
		);

		const hasActiveFilters = filters.some((filter) => filter.value) || debouncedSearchValue;

		return (
			<Box className={className}>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
						flexDirection: { xs: "column", sm: "row" },
						gap: 2,
					}}
				>
					<Box sx={{ display: "flex", gap: 2, flex: 1, width: "100%" }}>
						{/* Search */}
						{searchable && (
							<TextField
								placeholder={searchPlaceholder}
								value={internalSearchValue}
								onChange={(e) => setInternalSearchValue(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search />
										</InputAdornment>
									),
									endAdornment: internalSearchValue && (
										<InputAdornment position="end">
											<IconButton size="small" onClick={handleClearSearch}>
												<Clear />
											</IconButton>
										</InputAdornment>
									),
								}}
								sx={{ minWidth: 250 }}
							/>
						)}

						{/* Filters */}
						{filters.map((filter) => (
							<FormControl key={filter.field} sx={{ minWidth: 120 }}>
								<InputLabel>{filter.label}</InputLabel>
								<Select value={filter.value} label={filter.label} onChange={(e) => filter.onChange(e.target.value)}>
									<MenuItem value="">All</MenuItem>
									{filter.options.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						))}

						{/* Clear filters */}
						{hasActiveFilters && (
							<Button variant="outlined" onClick={handleClearFilters} size="small">
								Clear Filters
							</Button>
						)}
					</Box>

					<Box sx={{ display: "flex", gap: 1 }}>
						{/* Add button */}
						{onAdd && (
							<Button variant="primary" startIcon={<Add />} onClick={onAdd}>
								{addButtonText}
							</Button>
						)}

						{/* Refresh button */}
						{onRefresh && (
							<Tooltip title="Refresh">
								<IconButton variant="action" onClick={onRefresh}>
									<Refresh />
								</IconButton>
							</Tooltip>
						)}
					</Box>
				</Box>

				{/* Error display */}
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{/* Table */}
				<Paper
					elevation={0}
					sx={{
						width: "100%",
						overflow: "hidden",
						border: 1,
						borderColor: "divider",
						borderRadius: 2,
					}}
				>
					<TableContainer sx={{ maxHeight }}>
						{loading ? (
							renderLoadingSkeleton()
						) : (
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										{selectable && (
											<TableCell
												padding="checkbox"
												sx={{
													backgroundColor: "background.paper",
													borderBottom: 1,
													borderColor: "divider",
												}}
											>
												<Checkbox
													indeterminate={someVisibleSelected}
													checked={allVisibleSelected}
													onChange={handleSelectAll}
													inputProps={{ "aria-label": "select all" }}
												/>
											</TableCell>
										)}
										{columns.map((column) => (
											<TableCell
												key={column.field}
												style={{
													minWidth: column.minWidth,
													maxWidth: column.maxWidth,
													width: column.width,
												}}
												sx={{
													fontWeight: 600,
													backgroundColor: "background.paper",
													borderBottom: 1,
													borderColor: "divider",
												}}
											>
												{column.headerName}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredData.length === 0 ? (
										<TableRow>
											<TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
												{loading ? <CircularProgress size={24} /> : <Typography color="text.secondary">{emptyMessage}</Typography>}
											</TableCell>
										</TableRow>
									) : (
										filteredData.map((row, index) => {
											const rowKey = row[keyField];
											const isSelected = selectable && selectedKeys ? selectedKeys.has(rowKey) : false;
											return (
												<TableRow
													key={rowKey || index}
													onClick={() => onRowClick?.(row, index)}
													selected={isSelected}
													sx={{
														"&:hover": {
															backgroundColor: "action.hover",
															cursor: onRowClick ? "pointer" : "default",
														},
														"&.Mui-selected": {
															backgroundColor: "action.selected",
															"&:hover": {
																backgroundColor: "action.selected",
															},
														},
														"&:not(:last-child) td": {
															borderBottom: 1,
															borderColor: "divider",
														},
													}}
												>
													{selectable && (
														<TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
															<Checkbox
																checked={isSelected}
																onChange={() => handleSelectRow(rowKey)}
																inputProps={{ "aria-label": `select row ${rowKey}` }}
															/>
														</TableCell>
													)}
													{columns.map((column) => (
														<TableCell
															key={column.field}
															style={{
																minWidth: column.minWidth,
																maxWidth: column.maxWidth,
																width: column.width,
															}}
														>
															{renderCell(column, row, index)}
														</TableCell>
													))}
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						)}
					</TableContainer>

					{/* Pagination */}
					{pagination && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								p: 2,
								borderTop: 1,
								borderColor: "divider",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Rows per page:
								</Typography>
								<FormControl size="small">
									<Select value={pageSize} onChange={(e) => onPageSizeChange?.(Number(e.target.value))}>
										{pageSizeOptions.map((size) => (
											<MenuItem key={size} value={size}>
												{size}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								{totalCount && (
									<Typography variant="body2" color="text.secondary">
										Page {currentPage} • {totalCount} total
									</Typography>
								)}
								<IconButton disabled={!hasPreviousPage} onClick={() => onPageChange?.(currentPage - 1)}>
									<NavigateBefore />
								</IconButton>
								<IconButton disabled={!hasNextPage} onClick={() => onPageChange?.(currentPage + 1)}>
									<NavigateNext />
								</IconButton>
							</Box>
						</Box>
					)}
				</Paper>
			</Box>
		);
	},
);

DataTable.displayName = "DataTable";
