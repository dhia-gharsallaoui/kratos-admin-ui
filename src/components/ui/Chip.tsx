import { Chip as MuiChip, type ChipProps as MuiChipProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { alpha, gradientColors, gradients } from "@/theme";

type CustomChipVariant = "gradient" | "status" | "role" | "tag";

export interface ChipProps extends Omit<MuiChipProps, "variant"> {
	variant?: MuiChipProps["variant"] | CustomChipVariant;
	status?: "active" | "inactive" | "pending" | "error";
}

interface StyledChipProps extends Omit<MuiChipProps, "variant"> {
	$variant?: "gradient" | "status" | "role" | "tag";
	$status?: "active" | "inactive" | "pending" | "error";
}

const StyledChip = styled(MuiChip, {
	shouldForwardProp: (prop) => !["$variant", "$status"].includes(prop as string),
})<StyledChipProps>(({ theme, $variant = "tag", $status }) => {
	const baseStyles = {
		fontWeight: 500,
		borderRadius: "8px",
	};

	if ($variant === "gradient") {
		return {
			...baseStyles,
			background: gradients.normal,
			color: "#ffffff",
			border: "none",
			fontWeight: 600,
		};
	}

	if ($variant === "status") {
		const statusColors = {
			active: {
				bg: theme.palette.mode === "dark" ? "rgba(76, 175, 80, 0.2)" : "rgba(76, 175, 80, 0.1)",
				color: theme.palette.mode === "dark" ? "#81c784" : "#388e3c",
				border: theme.palette.mode === "dark" ? "1px solid rgba(76, 175, 80, 0.5)" : "1px solid rgba(76, 175, 80, 0.3)",
			},
			inactive: {
				bg: theme.palette.mode === "dark" ? "rgba(158, 158, 158, 0.2)" : "rgba(158, 158, 158, 0.1)",
				color: theme.palette.mode === "dark" ? "#bdbdbd" : "#616161",
				border: theme.palette.mode === "dark" ? "1px solid rgba(158, 158, 158, 0.5)" : "1px solid rgba(158, 158, 158, 0.3)",
			},
			pending: {
				bg: theme.palette.mode === "dark" ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 152, 0, 0.1)",
				color: theme.palette.mode === "dark" ? "#ffb74d" : "#f57c00",
				border: theme.palette.mode === "dark" ? "1px solid rgba(255, 152, 0, 0.5)" : "1px solid rgba(255, 152, 0, 0.3)",
			},
			error: {
				bg: theme.palette.mode === "dark" ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.1)",
				color: theme.palette.mode === "dark" ? "#e57373" : "#d32f2f",
				border: theme.palette.mode === "dark" ? "1px solid rgba(244, 67, 54, 0.5)" : "1px solid rgba(244, 67, 54, 0.3)",
			},
		};

		const colors = statusColors[$status || "active"];
		return {
			...baseStyles,
			backgroundColor: colors.bg,
			color: colors.color,
			border: colors.border,
		};
	}

	if ($variant === "role") {
		return {
			...baseStyles,
			backgroundColor: alpha.primary[10],
			color: gradientColors.primary,
			border: `1px solid ${alpha.primary[30]}`,
			fontWeight: 600,
		};
	}

	// tag variant (default)
	return {
		...baseStyles,
		backgroundColor: "transparent",
		color: theme.palette.text.primary,
		border: `1px solid ${theme.palette.divider}`,
	};
});

const customChipVariants: CustomChipVariant[] = ["gradient", "status", "role", "tag"];

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(({ variant = "tag", status, ...props }, ref) => {
	const isCustomVariant = customChipVariants.includes(variant as CustomChipVariant);

	if (isCustomVariant) {
		return <StyledChip ref={ref} $variant={variant as CustomChipVariant} $status={status} size="small" {...props} />;
	}

	// Use MUI variant directly
	return <MuiChip ref={ref} variant={variant as MuiChipProps["variant"]} size="small" {...props} />;
});

Chip.displayName = "Chip";
