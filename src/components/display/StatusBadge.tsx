"use client";

import { Cancel, CheckCircle, Error as ErrorIcon, HealthAndSafety, HourglassEmpty, Warning } from "@mui/icons-material";
import type React from "react";
import { Box } from "@/components/ui";

type StatusType = "active" | "inactive" | "pending" | "error" | "success" | "warning" | "healthy" | "unhealthy";

export interface StatusBadgeProps {
	status: StatusType;
	label?: string;
	showIcon?: boolean;
	size?: "small" | "medium" | "large";
	variant?: "filled" | "outlined" | "dot";
}

const statusConfig: Record<
	StatusType,
	{
		label: string;
		icon: React.ElementType;
		color: string;
		bgColor: string;
		borderColor: string;
	}
> = {
	active: {
		label: "Active",
		icon: CheckCircle,
		color: "#4caf50",
		bgColor: "rgba(76, 175, 80, 0.1)",
		borderColor: "rgba(76, 175, 80, 0.3)",
	},
	inactive: {
		label: "Inactive",
		icon: Cancel,
		color: "#9e9e9e",
		bgColor: "rgba(158, 158, 158, 0.1)",
		borderColor: "rgba(158, 158, 158, 0.3)",
	},
	pending: {
		label: "Pending",
		icon: HourglassEmpty,
		color: "#ff9800",
		bgColor: "rgba(255, 152, 0, 0.1)",
		borderColor: "rgba(255, 152, 0, 0.3)",
	},
	error: {
		label: "Error",
		icon: ErrorIcon,
		color: "#f44336",
		bgColor: "rgba(244, 67, 54, 0.1)",
		borderColor: "rgba(244, 67, 54, 0.3)",
	},
	success: {
		label: "Success",
		icon: CheckCircle,
		color: "#4caf50",
		bgColor: "rgba(76, 175, 80, 0.1)",
		borderColor: "rgba(76, 175, 80, 0.3)",
	},
	warning: {
		label: "Warning",
		icon: Warning,
		color: "#ff9800",
		bgColor: "rgba(255, 152, 0, 0.1)",
		borderColor: "rgba(255, 152, 0, 0.3)",
	},
	healthy: {
		label: "Healthy",
		icon: HealthAndSafety,
		color: "#4caf50",
		bgColor: "rgba(76, 175, 80, 0.1)",
		borderColor: "rgba(76, 175, 80, 0.3)",
	},
	unhealthy: {
		label: "Unhealthy",
		icon: ErrorIcon,
		color: "#f44336",
		bgColor: "rgba(244, 67, 54, 0.1)",
		borderColor: "rgba(244, 67, 54, 0.3)",
	},
};

export function StatusBadge({ status, label, showIcon = true, size = "medium", variant = "filled" }: StatusBadgeProps) {
	const config = statusConfig[status];
	const displayLabel = label || config.label;
	const Icon = config.icon;

	const sizeStyles = {
		small: { fontSize: 14, iconSize: 14, px: 1, py: 0.25, dotSize: 6 },
		medium: { fontSize: 14, iconSize: 16, px: 1.5, py: 0.5, dotSize: 8 },
		large: { fontSize: 16, iconSize: 18, px: 2, py: 0.75, dotSize: 10 },
	};

	const styles = sizeStyles[size];

	if (variant === "dot") {
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<Box
					sx={{
						width: styles.dotSize,
						height: styles.dotSize,
						borderRadius: "50%",
						backgroundColor: config.color,
						flexShrink: 0,
					}}
				/>
				<Box
					sx={{
						fontSize: styles.fontSize,
						color: "text.primary",
						fontWeight: 500,
					}}
				>
					{displayLabel}
				</Box>
			</Box>
		);
	}

	if (variant === "outlined") {
		return (
			<Box
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: 0.75,
					px: styles.px,
					py: styles.py,
					borderRadius: 2,
					border: `1px solid ${config.borderColor}`,
					backgroundColor: "transparent",
				}}
			>
				{showIcon && <Icon sx={{ fontSize: styles.iconSize, color: config.color }} />}
				<Box
					sx={{
						fontSize: styles.fontSize,
						color: config.color,
						fontWeight: 500,
					}}
				>
					{displayLabel}
				</Box>
			</Box>
		);
	}

	// filled variant
	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: 0.75,
				px: styles.px,
				py: styles.py,
				borderRadius: 2,
				backgroundColor: config.bgColor,
				border: `1px solid ${config.borderColor}`,
			}}
		>
			{showIcon && <Icon sx={{ fontSize: styles.iconSize, color: config.color }} />}
			<Box
				sx={{
					fontSize: styles.fontSize,
					color: config.color,
					fontWeight: 500,
				}}
			>
				{displayLabel}
			</Box>
		</Box>
	);
}

StatusBadge.displayName = "StatusBadge";
