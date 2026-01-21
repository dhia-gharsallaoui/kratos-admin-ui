"use client";

import { Apps as AppsIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from "@mui/icons-material";
import { FlexBox, SectionCard } from "@/components/layout";
import { Box, Chip, Switch, Typography } from "@/components/ui";
import { alpha } from "@/theme";

export interface HydraIntegrationSectionProps {
	/** Whether Hydra integration is enabled */
	hydraEnabled: boolean;
	/** Callback when Hydra integration is toggled */
	onHydraEnabledChange: (enabled: boolean) => void;
	/** Whether Hydra is currently healthy/available (optional, for status display) */
	isHydraHealthy?: boolean;
}

export function HydraIntegrationSection({ hydraEnabled, onHydraEnabledChange, isHydraHealthy }: HydraIntegrationSectionProps) {
	return (
		<SectionCard
			title={
				<FlexBox align="center" gap={1.5}>
					<Box
						sx={{
							background: alpha.primary[10],
							borderRadius: 1.5,
							p: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<AppsIcon sx={{ fontSize: 22, color: "primary.main" }} />
					</Box>
					<Typography variant="heading" size="lg">
						Hydra Integration
					</Typography>
					<Chip label={hydraEnabled ? "Enabled" : "Disabled"} size="small" color={hydraEnabled ? "primary" : "default"} sx={{ ml: 1 }} />
				</FlexBox>
			}
		>
			<FlexBox align="center" justify="space-between">
				<Box sx={{ maxWidth: "70%" }}>
					<FlexBox align="center" gap={1}>
						<AppsIcon sx={{ fontSize: 20, color: hydraEnabled ? "primary.main" : "text.secondary" }} />
						<Typography variant="label" sx={{ fontWeight: 600 }}>
							{hydraEnabled ? "Hydra Integration Enabled" : "Hydra Integration Disabled"}
						</Typography>
						{hydraEnabled && isHydraHealthy !== undefined && (
							<Chip
								icon={isHydraHealthy ? <CheckCircleIcon /> : <ErrorIcon />}
								label={isHydraHealthy ? "Connected" : "Unavailable"}
								size="small"
								color={isHydraHealthy ? "success" : "error"}
								variant="outlined"
								sx={{ ml: 1 }}
							/>
						)}
					</FlexBox>
					<Typography variant="body" color="secondary" sx={{ mt: 0.5 }}>
						{hydraEnabled
							? "Hydra integration is enabled. OAuth2 client management and analytics are available."
							: "Hydra integration is disabled. Enable it to manage OAuth2 clients and view OAuth2 analytics. Useful for Kratos-only setups."}
					</Typography>
				</Box>
				<Switch checked={hydraEnabled} onChange={(e) => onHydraEnabledChange(e.target.checked)} color="primary" />
			</FlexBox>
		</SectionCard>
	);
}

HydraIntegrationSection.displayName = "HydraIntegrationSection";
