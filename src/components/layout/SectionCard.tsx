"use client";

import type React from "react";
import { Alert, Box, Card, CardContent, type CardProps, Spinner, Typography } from "@/components/ui";

export interface SectionCardProps extends Omit<CardProps, "title"> {
	title?: string | React.ReactNode;
	subtitle?: string;
	headerActions?: React.ReactNode;
	children: React.ReactNode;
	loading?: boolean;
	error?: string | boolean;
	emptyMessage?: string;
	padding?: boolean;
}

export function SectionCard({
	title,
	subtitle,
	headerActions,
	children,
	loading = false,
	error,
	emptyMessage,
	padding = true,
	variant = "bordered",
	sx,
	...rest
}: SectionCardProps) {
	return (
		<Card variant={variant} sx={sx} {...rest}>
			<CardContent sx={{ p: padding ? undefined : 0 }}>
				{(title || subtitle || headerActions) && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							mb: 2,
							gap: 2,
						}}
					>
						<Box sx={{ flex: 1 }}>
							{title && (
								<Box>
									{typeof title === "string" ? (
										<Typography variant="heading" level="h2">
											{title}
										</Typography>
									) : (
										title
									)}
								</Box>
							)}
							{subtitle && (
								<Typography variant="body" color="secondary" sx={{ mt: 0.5 }}>
									{subtitle}
								</Typography>
							)}
						</Box>
						{headerActions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{headerActions}</Box>}
					</Box>
				)}

				{loading ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: 200,
						}}
					>
						<Spinner variant="ring" size="medium" />
					</Box>
				) : error ? (
					<Alert severity="error" variant="inline">
						{typeof error === "string" ? error : "An error occurred"}
					</Alert>
				) : emptyMessage && !children ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: 200,
						}}
					>
						<Typography variant="body" color="secondary">
							{emptyMessage}
						</Typography>
					</Box>
				) : (
					children
				)}
			</CardContent>
		</Card>
	);
}

SectionCard.displayName = "SectionCard";
