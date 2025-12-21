"use client";

import type React from "react";
import { Box, Chip } from "@/components/ui";
import { gradients } from "@/theme";

export interface PageTabsProps {
	tabs: Array<{
		label: string;
		value: string;
		icon?: React.ReactNode;
		badge?: number | string;
	}>;
	value: string;
	onChange: (value: string) => void;
	variant?: "default" | "pills" | "underline";
}

export function PageTabs({ tabs, value, onChange, variant = "default" }: PageTabsProps) {
	if (variant === "pills") {
		return (
			<Box
				sx={{
					display: "flex",
					gap: 1,
					flexWrap: "wrap",
					p: 0.5,
					backgroundColor: "action.hover",
					borderRadius: 2,
					width: "fit-content",
				}}
			>
				{tabs.map((tab) => (
					<Box
						key={tab.value}
						onClick={() => onChange(tab.value)}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							px: 2,
							py: 1,
							borderRadius: 1.5,
							cursor: "pointer",
							transition: "all 0.2s",
							fontWeight: 600,
							fontSize: "0.875rem",
							...(value === tab.value
								? {
										background: gradients.normal,
										color: "#ffffff",
										boxShadow: "0 2px 8px rgba(0, 117, 255, 0.3)",
									}
								: {
										color: "text.secondary",
										"&:hover": {
											backgroundColor: "background.paper",
											color: "text.primary",
										},
									}),
						}}
					>
						{tab.icon}
						{tab.label}
						{tab.badge !== undefined && (
							<Chip
								label={tab.badge}
								size="small"
								sx={{
									height: 20,
									minWidth: 20,
									fontSize: "0.75rem",
									...(value === tab.value
										? {
												backgroundColor: "rgba(255, 255, 255, 0.2)",
												color: "#ffffff",
											}
										: {
												backgroundColor: "action.selected",
											}),
								}}
							/>
						)}
					</Box>
				))}
			</Box>
		);
	}

	if (variant === "underline") {
		return (
			<Box
				sx={{
					display: "flex",
					gap: 3,
					borderBottom: "2px solid",
					borderColor: "divider",
				}}
			>
				{tabs.map((tab) => (
					<Box
						key={tab.value}
						onClick={() => onChange(tab.value)}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							px: 2,
							py: 1.5,
							cursor: "pointer",
							transition: "all 0.2s",
							fontWeight: 600,
							fontSize: "0.875rem",
							position: "relative",
							borderBottom: "2px solid",
							borderColor: value === tab.value ? "primary.main" : "transparent",
							marginBottom: "-2px",
							...(value === tab.value
								? {
										color: "primary.main",
									}
								: {
										color: "text.secondary",
										"&:hover": {
											color: "text.primary",
											borderColor: "action.hover",
										},
									}),
						}}
					>
						{tab.icon}
						{tab.label}
						{tab.badge !== undefined && (
							<Chip
								label={tab.badge}
								size="small"
								variant={value === tab.value ? "gradient" : "outlined"}
								sx={{
									height: 20,
									minWidth: 20,
									fontSize: "0.75rem",
								}}
							/>
						)}
					</Box>
				))}
			</Box>
		);
	}

	// default variant
	return (
		<Box
			sx={{
				display: "flex",
				gap: 2,
				flexWrap: "wrap",
			}}
		>
			{tabs.map((tab) => (
				<Box
					key={tab.value}
					onClick={() => onChange(tab.value)}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						px: 2,
						py: 1,
						borderRadius: 2,
						cursor: "pointer",
						transition: "all 0.2s",
						fontWeight: 600,
						fontSize: "0.875rem",
						border: "1px solid",
						...(value === tab.value
							? {
									background: gradients.normal,
									color: "#ffffff",
									borderColor: "transparent",
									boxShadow: "0 2px 8px rgba(0, 117, 255, 0.3)",
								}
							: {
									borderColor: "divider",
									color: "text.secondary",
									"&:hover": {
										borderColor: "primary.main",
										color: "primary.main",
										backgroundColor: "action.hover",
									},
								}),
					}}
				>
					{tab.icon}
					{tab.label}
					{tab.badge !== undefined && (
						<Chip
							label={tab.badge}
							size="small"
							sx={{
								height: 20,
								minWidth: 20,
								fontSize: "0.75rem",
								...(value === tab.value
									? {
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											color: "#ffffff",
										}
									: {
											backgroundColor: "action.hover",
										}),
							}}
						/>
					)}
				</Box>
			))}
		</Box>
	);
}

PageTabs.displayName = "PageTabs";
