"use client";

import { Cloud as CloudIcon, Dns as SelfHostedIcon } from "@mui/icons-material";
import { FlexBox, SectionCard } from "@/components/layout";
import { Box, Chip, Switch, Typography } from "@/components/ui";
import { alpha } from "@/theme";

export interface ConnectionModeSectionProps {
	/** Whether Ory Network mode is enabled */
	isOryNetwork: boolean;
	/** Callback when Ory Network mode is toggled */
	onOryNetworkChange: (enabled: boolean) => void;
}

export function ConnectionModeSection({ isOryNetwork, onOryNetworkChange }: ConnectionModeSectionProps) {
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
						<CloudIcon sx={{ fontSize: 22, color: "primary.main" }} />
					</Box>
					<Typography variant="heading" size="lg">
						Connection Mode
					</Typography>
					<Chip label={isOryNetwork ? "Ory Network" : "Self-Hosted"} size="small" color={isOryNetwork ? "primary" : "default"} sx={{ ml: 1 }} />
				</FlexBox>
			}
		>
			<FlexBox align="center" justify="space-between">
				<Box sx={{ maxWidth: "70%" }}>
					<FlexBox align="center" gap={1}>
						{isOryNetwork ? (
							<CloudIcon sx={{ fontSize: 20, color: "primary.main" }} />
						) : (
							<SelfHostedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
						)}
						<Typography variant="label" sx={{ fontWeight: 600 }}>
							{isOryNetwork ? "Ory Network Mode" : "Self-Hosted Mode"}
						</Typography>
					</FlexBox>
					<Typography variant="body" color="secondary" sx={{ mt: 0.5 }}>
						{isOryNetwork
							? "Connected to Ory Network (managed service). Health checks are skipped as they are not available on Ory Network."
							: "Running with self-hosted Ory services. Health checks are enabled for local/self-managed deployments."}
					</Typography>
				</Box>
				<Switch checked={isOryNetwork} onChange={(e) => onOryNetworkChange(e.target.checked)} color="primary" />
			</FlexBox>
		</SectionCard>
	);
}

ConnectionModeSection.displayName = "ConnectionModeSection";
