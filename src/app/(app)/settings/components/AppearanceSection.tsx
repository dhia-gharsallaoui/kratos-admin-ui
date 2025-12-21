"use client";

import { DarkMode, LightMode, Palette as PaletteIcon } from "@mui/icons-material";
import { FlexBox, SectionCard } from "@/components/layout";
import { Box, Switch, Typography } from "@/components/ui";
import { alpha } from "@/theme";

export interface AppearanceSectionProps {
	/** Current theme mode */
	currentTheme: "light" | "dark";
	/** Callback when theme is toggled */
	onThemeChange: () => void;
}

export function AppearanceSection({ currentTheme, onThemeChange }: AppearanceSectionProps) {
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
						<PaletteIcon sx={{ fontSize: 22, color: "primary.main" }} />
					</Box>
					<Typography variant="heading" size="lg">
						Appearance
					</Typography>
				</FlexBox>
			}
		>
			<FlexBox align="center" justify="space-between">
				<Box>
					<Typography variant="label" sx={{ fontWeight: 600 }}>
						Theme Preference
					</Typography>
					<Typography variant="body" color="secondary" sx={{ mt: 0.5 }}>
						Choose between light and dark theme. Your preference will be saved automatically.
					</Typography>
				</Box>
				<FlexBox align="center" gap={1.5}>
					<FlexBox
						align="center"
						gap={0.5}
						sx={{
							opacity: currentTheme === "light" ? 1 : 0.5,
							transition: "opacity 0.2s ease",
						}}
					>
						<LightMode sx={{ fontSize: 18, color: "warning.main" }} />
						<Typography variant="body" color="secondary">
							Light
						</Typography>
					</FlexBox>
					<Switch checked={currentTheme === "dark"} onChange={onThemeChange} color="primary" />
					<FlexBox
						align="center"
						gap={0.5}
						sx={{
							opacity: currentTheme === "dark" ? 1 : 0.5,
							transition: "opacity 0.2s ease",
						}}
					>
						<DarkMode sx={{ fontSize: 18, color: "primary.main" }} />
						<Typography variant="body" color="secondary">
							Dark
						</Typography>
					</FlexBox>
				</FlexBox>
			</FlexBox>
		</SectionCard>
	);
}

AppearanceSection.displayName = "AppearanceSection";
