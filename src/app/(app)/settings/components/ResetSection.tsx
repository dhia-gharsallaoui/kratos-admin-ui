"use client";

import { RestartAlt as ResetIcon, Warning as WarningIcon } from "@mui/icons-material";
import { useState } from "react";
import { FlexBox } from "@/components/layout";
import { Box, Button, Paper, Typography } from "@/components/ui";
import { themeColors } from "@/theme";

export interface ResetSectionProps {
	/** Callback when reset is triggered */
	onReset: () => Promise<void>;
}

export function ResetSection({ onReset }: ResetSectionProps) {
	const [isResetting, setIsResetting] = useState(false);

	const handleReset = async () => {
		setIsResetting(true);
		try {
			await onReset();
		} finally {
			setIsResetting(false);
		}
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				border: "1px solid",
				borderColor: "error.light",
				borderRadius: 2,
				background: (theme) =>
					theme.palette.mode === "dark"
						? `linear-gradient(135deg, ${themeColors.error}08 0%, ${themeColors.error}03 100%)`
						: `linear-gradient(135deg, ${themeColors.error}08 0%, ${themeColors.error}04 100%)`,
			}}
		>
			<FlexBox justify="space-between" align="center" gap={3}>
				<FlexBox align="flex-start" gap={2}>
					<Box
						sx={{
							background: `${themeColors.error}15`,
							borderRadius: 1.5,
							p: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<WarningIcon sx={{ fontSize: 24, color: "error.main" }} />
					</Box>
					<Box>
						<Typography variant="heading" size="md" sx={{ mb: 0.5, color: "error.dark" }}>
							Danger Zone
						</Typography>
						<Typography variant="body" color="secondary" sx={{ maxWidth: 500 }}>
							Reset all settings to their default values. This will clear all custom endpoint configurations and API keys. This action cannot be
							undone.
						</Typography>
					</Box>
				</FlexBox>
				<Button
					variant="outlined"
					color="error"
					onClick={handleReset}
					startIcon={<ResetIcon />}
					disabled={isResetting}
					sx={{
						minWidth: 160,
						"&:hover": {
							bgcolor: "error.main",
							color: "white",
							borderColor: "error.main",
						},
					}}
				>
					{isResetting ? "Resetting..." : "Reset to Defaults"}
				</Button>
			</FlexBox>
		</Paper>
	);
}

ResetSection.displayName = "ResetSection";
