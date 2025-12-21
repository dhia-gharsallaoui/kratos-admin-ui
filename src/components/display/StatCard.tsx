"use client";

import { TrendingDown, TrendingUp } from "@mui/icons-material";
import type React from "react";
import { Box, Card, CardContent, Skeleton, Typography } from "@/components/ui";
import { gradientColors, themeColors } from "@/theme";

export interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ElementType;
	iconColor?: string; // Deprecated - use colorVariant instead
	colorVariant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "purple" | "orange" | "blue";
	trend?: {
		value: number;
		label?: string;
		direction?: "up" | "down";
	};
	loading?: boolean;
	variant?: "default" | "gradient" | "outlined";
}

// Color mapping using theme colors
const colorMap: Record<string, string> = {
	primary: gradientColors.primary,
	secondary: gradientColors.secondary,
	success: themeColors.success,
	warning: themeColors.warning,
	error: themeColors.error,
	info: themeColors.info,
	purple: themeColors.purple,
	orange: themeColors.orange,
	blue: themeColors.blue,
};

export function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	iconColor: iconColorProp,
	colorVariant,
	trend,
	loading = false,
	variant = "default",
}: StatCardProps) {
	// Use colorVariant if provided, otherwise fall back to iconColor prop or default primary
	const iconColor = colorVariant ? colorMap[colorVariant] : iconColorProp || gradientColors.primary;
	if (loading) {
		return (
			<Card
				elevation={0}
				sx={{
					border: "1px solid",
					borderColor: "divider",
					borderLeft: `4px solid ${iconColor}`,
				}}
			>
				<CardContent>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2, mr: 2 }} />
						<Skeleton width={100} />
					</Box>
					<Skeleton width="60%" height={40} sx={{ mb: 0.5 }} />
					<Skeleton width="80%" />
				</CardContent>
			</Card>
		);
	}

	const cardStyles = {
		default: {
			border: "1px solid",
			borderColor: "divider",
			borderLeft: `4px solid ${iconColor}`,
		},
		gradient: {
			background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%)`,
			color: "#ffffff",
		},
		outlined: {
			border: `2px solid ${iconColor}`,
		},
	};

	return (
		<Card
			elevation={0}
			sx={{
				...cardStyles[variant],
				transition: "all 0.2s ease",
				"&:hover": {
					boxShadow: variant === "default" ? "0 4px 12px rgba(0, 0, 0, 0.08)" : "0 8px 24px rgba(0, 0, 0, 0.12)",
					transform: "translateY(-2px)",
				},
			}}
		>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					{Icon && (
						<Box
							sx={{
								background: variant === "gradient" ? "rgba(255, 255, 255, 0.2)" : `${iconColor}1a`,
								borderRadius: 2,
								p: 1,
								display: "flex",
								mr: 2,
							}}
						>
							<Icon
								sx={{
									fontSize: 28,
									color: variant === "gradient" ? "#ffffff" : iconColor,
								}}
							/>
						</Box>
					)}
					<Typography
						variant="body2"
						color={variant === "gradient" ? "inherit" : "text.secondary"}
						sx={{ fontWeight: 500, opacity: variant === "gradient" ? 0.9 : 1 }}
					>
						{title}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 600,
							color: variant === "gradient" ? "#ffffff" : "text.primary",
						}}
					>
						{value}
					</Typography>

					{trend && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 0.5,
								px: 1,
								py: 0.25,
								borderRadius: 1,
								backgroundColor:
									variant === "gradient"
										? "rgba(255, 255, 255, 0.2)"
										: trend.direction === "up"
											? "rgba(76, 175, 80, 0.1)"
											: "rgba(244, 67, 54, 0.1)",
							}}
						>
							{trend.direction === "up" ? (
								<TrendingUp
									sx={{
										fontSize: 16,
										color: variant === "gradient" ? "#ffffff" : "#4caf50",
									}}
								/>
							) : (
								<TrendingDown
									sx={{
										fontSize: 16,
										color: variant === "gradient" ? "#ffffff" : "#f44336",
									}}
								/>
							)}
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: variant === "gradient" ? "#ffffff" : trend.direction === "up" ? "#4caf50" : "#f44336",
								}}
							>
								{trend.value}%
							</Typography>
						</Box>
					)}
				</Box>

				{(subtitle || trend?.label) && (
					<Typography
						variant="caption"
						color={variant === "gradient" ? "inherit" : "text.secondary"}
						sx={{ opacity: variant === "gradient" ? 0.8 : 1 }}
					>
						{trend?.label || subtitle}
					</Typography>
				)}
			</CardContent>
		</Card>
	);
}

StatCard.displayName = "StatCard";
