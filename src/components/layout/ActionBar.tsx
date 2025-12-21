"use client";

import { Box, CircularProgress, Button as MuiButton } from "@mui/material";
import type React from "react";
import { gradients } from "@/theme";

export interface ActionBarProps {
	primaryAction?: {
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
		loading?: boolean;
		disabled?: boolean;
	};
	secondaryActions?: Array<{
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
		variant?: "outlined" | "text";
		disabled?: boolean;
	}>;
	align?: "left" | "right" | "center" | "space-between";
	spacing?: number;
}

export function ActionBar({ primaryAction, secondaryActions = [], align = "right", spacing = 2 }: ActionBarProps) {
	const alignmentStyles = {
		left: "flex-start",
		right: "flex-end",
		center: "center",
		"space-between": "space-between",
	};

	return (
		<Box
			sx={{
				display: "flex",
				gap: spacing,
				justifyContent: alignmentStyles[align],
				alignItems: "center",
				flexWrap: "wrap",
			}}
		>
			{secondaryActions.map((action, index) => (
				<MuiButton
					key={index}
					onClick={action.onClick}
					disabled={action.disabled}
					variant={action.variant || "outlined"}
					startIcon={action.icon}
					sx={{
						...(action.variant === "text" && {
							color: "text.secondary",
							"&:hover": {
								backgroundColor: "rgba(0, 0, 0, 0.04)",
							},
						}),
					}}
				>
					{action.label}
				</MuiButton>
			))}

			{primaryAction && (
				<MuiButton
					onClick={primaryAction.onClick}
					disabled={primaryAction.disabled || primaryAction.loading}
					startIcon={primaryAction.loading ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : primaryAction.icon}
					sx={{
						background: gradients.normal,
						color: "#ffffff",
						fontWeight: 600,
						px: 3,
						"&:hover": {
							background: gradients.reversed,
							boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
						},
						"&:disabled": {
							background: "rgba(0, 0, 0, 0.12)",
							color: "rgba(0, 0, 0, 0.26)",
						},
					}}
				>
					{primaryAction.label}
				</MuiButton>
			)}
		</Box>
	);
}

ActionBar.displayName = "ActionBar";
