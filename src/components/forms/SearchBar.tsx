"use client";

import { Clear, Search } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import type React from "react";
import { Box, Chip, IconButton, InputAdornment, TextField } from "@/components/ui";

export interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onSearch?: () => void;
	placeholder?: string;
	filters?: Array<{
		label: string;
		value: string;
		icon?: React.ReactNode;
	}>;
	onFilterChange?: (filter: string) => void;
	activeFilter?: string;
	loading?: boolean;
}

export function SearchBar({
	value,
	onChange,
	onSearch,
	placeholder = "Search...",
	filters,
	onFilterChange,
	activeFilter,
	loading = false,
}: SearchBarProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && onSearch) {
			onSearch();
		}
	};

	const handleClear = () => {
		onChange("");
		if (onSearch) {
			onSearch();
		}
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Box
				sx={{
					display: "flex",
					gap: 2,
					alignItems: "center",
					mb: filters ? 2 : 0,
				}}
			>
				<TextField
					fullWidth
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder={placeholder}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search sx={{ color: "text.secondary" }} />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								{loading ? (
									<CircularProgress size={20} sx={{ mr: 1 }} />
								) : value ? (
									<IconButton size="small" onClick={handleClear} sx={{ mr: 1 }}>
										<Clear sx={{ fontSize: 20 }} />
									</IconButton>
								) : null}
							</InputAdornment>
						),
					}}
				/>
			</Box>

			{filters && filters.length > 0 && (
				<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
					{filters.map((filter) => (
						<Chip
							key={filter.value}
							label={filter.label}
							icon={filter.icon ? <Box component="span">{filter.icon}</Box> : undefined}
							onClick={() => onFilterChange?.(filter.value)}
							variant={activeFilter === filter.value ? "gradient" : "outlined"}
							sx={{
								cursor: "pointer",
								transition: "all 0.2s",
								...(activeFilter !== filter.value && {
									"&:hover": {
										borderColor: "primary.main",
										backgroundColor: "action.hover",
									},
								}),
							}}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}

SearchBar.displayName = "SearchBar";
