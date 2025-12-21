import { Error as ErrorIcon, Info, Refresh, Warning } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import type React from "react";
import { Button } from "./Button";

export interface ErrorDisplayProps {
	title?: string;
	message: string;
	severity?: "error" | "warning" | "info";
	onRetry?: () => void;
	retryText?: string;
	variant?: "inline" | "card" | "centered";
	showIcon?: boolean;
	className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
	title,
	message,
	severity = "error",
	onRetry,
	retryText = "Try Again",
	variant = "inline",
	showIcon = true,
	className,
}) => {
	const getIcon = () => {
		switch (severity) {
			case "warning":
				return <Warning sx={{ fontSize: 24 }} />;
			case "info":
				return <Info sx={{ fontSize: 24 }} />;
			default:
				return <ErrorIcon sx={{ fontSize: 24 }} />;
		}
	};

	const getColorVars = () => {
		switch (severity) {
			case "warning":
				return {
					bg: "var(--warning-bg)",
					border: "var(--warning-border)",
					text: "var(--warning-text)",
				};
			case "info":
				return {
					bg: "var(--info-bg)",
					border: "var(--info-border)",
					text: "var(--info-text)",
				};
			default:
				return {
					bg: "var(--error-bg)",
					border: "var(--error-border)",
					text: "var(--error-text)",
				};
		}
	};

	const colors = getColorVars();

	if (variant === "centered") {
		return (
			<Box
				className={className}
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "400px",
					p: 4,
					textAlign: "center",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						maxWidth: 500,
						width: "100%",
						p: 4,
						border: "1px solid var(--border)",
						borderRadius: 2,
						backgroundColor: "var(--background-primary)",
					}}
				>
					{showIcon && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								mb: 2,
								color: colors.text,
							}}
						>
							{getIcon()}
						</Box>
					)}

					{title && (
						<Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: colors.text }}>
							{title}
						</Typography>
					)}

					<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
						{message}
					</Typography>

					{onRetry && (
						<Button variant="outlined" startIcon={<Refresh />} onClick={onRetry} fullWidth>
							{retryText}
						</Button>
					)}
				</Paper>
			</Box>
		);
	}

	if (variant === "card") {
		return (
			<Paper
				elevation={0}
				className={className}
				sx={{
					p: 3,
					border: `1px solid ${colors.border}`,
					borderRadius: 2,
					backgroundColor: colors.bg,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
					{showIcon && <Box sx={{ color: colors.text, mt: 0.5 }}>{getIcon()}</Box>}

					<Box sx={{ flex: 1 }}>
						{title && (
							<Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: colors.text }}>
								{title}
							</Typography>
						)}

						<Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
							{message}
						</Typography>

						{onRetry && (
							<Box sx={{ mt: 2 }}>
								<Button variant="outlined" size="small" startIcon={<Refresh />} onClick={onRetry}>
									{retryText}
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			</Paper>
		);
	}

	// inline variant (default)
	return (
		<Box
			className={className}
			sx={{
				p: 2,
				border: `1px solid ${colors.border}`,
				borderRadius: 2,
				backgroundColor: colors.bg,
				display: "flex",
				alignItems: "center",
				gap: 2,
			}}
		>
			{showIcon && <Box sx={{ color: colors.text }}>{getIcon()}</Box>}

			<Box sx={{ flex: 1 }}>
				{title && (
					<Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text, mb: 0.5 }}>
						{title}
					</Typography>
				)}
				<Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
					{message}
				</Typography>
			</Box>

			{onRetry && (
				<Button variant="outlined" size="small" startIcon={<Refresh />} onClick={onRetry}>
					{retryText}
				</Button>
			)}
		</Box>
	);
};
