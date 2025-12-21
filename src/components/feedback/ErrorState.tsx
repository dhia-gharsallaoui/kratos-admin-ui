"use client";

import { ErrorOutline, Refresh, Settings } from "@mui/icons-material";
import type React from "react";
import { Alert, Box, Button, Typography } from "@/components/ui";

export interface ErrorStateProps {
	title?: string;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
	};
	secondaryAction?: {
		label: string;
		onClick: () => void;
		icon?: React.ReactNode;
	};
	variant?: "page" | "inline";
}

export function ErrorState({ title = "Something went wrong", message, action, secondaryAction, variant = "page" }: ErrorStateProps) {
	if (variant === "inline") {
		return (
			<Alert
				severity="error"
				action={
					action ? (
						<Button
							size="small"
							onClick={action.onClick}
							startIcon={action.icon || <Refresh sx={{ fontSize: 16 }} />}
							sx={{
								color: "error.main",
								fontWeight: 600,
								"&:hover": {
									backgroundColor: "rgba(244, 67, 54, 0.04)",
								},
							}}
						>
							{action.label}
						</Button>
					) : undefined
				}
			>
				{message}
			</Alert>
		);
	}

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
			<Box
				sx={{
					mb: 3,
					p: 3,
					borderRadius: "50%",
					backgroundColor: "rgba(244, 67, 54, 0.08)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<ErrorOutline
					sx={{
						fontSize: 64,
						color: "error.main",
					}}
				/>
			</Box>

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

			<Typography
				variant="body"
				color="text.secondary"
				sx={{
					mb: 3,
					maxWidth: 500,
				}}
			>
				{message}
			</Typography>

			<Box
				sx={{
					display: "flex",
					gap: 2,
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{action && (
					<Button
						onClick={action.onClick}
						startIcon={action.icon || <Refresh />}
						variant="outlined"
						color="error"
						sx={{
							fontWeight: 600,
							px: 3,
						}}
					>
						{action.label}
					</Button>
				)}
				{secondaryAction && (
					<Button
						onClick={secondaryAction.onClick}
						startIcon={secondaryAction.icon || <Settings />}
						variant="outlined"
						sx={{
							fontWeight: 600,
							px: 3,
						}}
					>
						{secondaryAction.label}
					</Button>
				)}
			</Box>
		</Box>
	);
}

ErrorState.displayName = "ErrorState";
