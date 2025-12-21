"use client";

import { InboxOutlined } from "@mui/icons-material";
import { Button as MuiButton } from "@mui/material";
import type React from "react";
import { Box, Typography } from "@/components/ui";
import { gradients } from "@/theme";

export interface EmptyStateProps {
	icon?: React.ElementType;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
	};
	illustration?: React.ReactNode;
}

export function EmptyState({ icon: Icon = InboxOutlined, title, description, action, illustration }: EmptyStateProps) {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				py: 8,
				px: 3,
				textAlign: "center",
			}}
		>
			{illustration ? (
				<Box sx={{ mb: 3 }}>{illustration}</Box>
			) : (
				<Box
					sx={{
						mb: 3,
						p: 3,
						borderRadius: "50%",
						backgroundColor: "action.hover",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Icon
						sx={{
							fontSize: 64,
							color: "text.secondary",
							opacity: 0.5,
						}}
					/>
				</Box>
			)}

			<Typography
				variant="h6"
				sx={{
					mb: 1,
					fontWeight: 600,
					color: "text.primary",
				}}
			>
				{title}
			</Typography>

			{description && (
				<Typography
					variant="body"
					color="text.secondary"
					sx={{
						mb: 3,
						maxWidth: 400,
					}}
				>
					{description}
				</Typography>
			)}

			{action && (
				<MuiButton
					onClick={action.onClick}
					startIcon={action.icon}
					sx={{
						background: gradients.normal,
						color: "#ffffff",
						fontWeight: 600,
						px: 3,
						"&:hover": {
							background: gradients.reversed,
							boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
						},
					}}
				>
					{action.label}
				</MuiButton>
			)}
		</Box>
	);
}

EmptyState.displayName = "EmptyState";
