"use client";

import {
	AdminPanelSettings as AdminIcon,
	VpnKey as ApiKeyIcon,
	Key as HydraIcon,
	Security as KratosIcon,
	Public as PublicIcon,
} from "@mui/icons-material";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ApiKeyField } from "@/components/forms";
import { FlexBox, SectionCard } from "@/components/layout";
import { ActionBar, Alert, Box, Grid, Paper, TextField, Typography } from "@/components/ui";
import { themeColors } from "@/theme";
import type { ServiceEndpoints, ServiceEndpointsForm } from "../hooks";

export interface ServiceConfigSectionProps {
	/** Service name - determines labels and icons */
	serviceName: "Kratos" | "Hydra";
	/** React Hook Form instance */
	form: UseFormReturn<ServiceEndpointsForm>;
	/** Current endpoints (for checking if API key exists) */
	currentEndpoints: ServiceEndpoints;
	/** Placeholder for public URL field */
	publicUrlPlaceholder: string;
	/** Placeholder for admin URL field */
	adminUrlPlaceholder: string;
	/** Helper text for public URL field */
	publicUrlHelperText: string;
	/** Helper text for admin URL field */
	adminUrlHelperText: string;
	/** Form submission handler */
	onSave: (data: ServiceEndpointsForm) => Promise<void>;
	/** URL validation function */
	validateUrl: (url: string) => string | true;
	/** Whether API key is being edited */
	isEditingApiKey: boolean;
	/** Callback to start API key editing */
	onApiKeyEditStart: () => void;
}

const serviceConfig = {
	Kratos: {
		icon: KratosIcon,
		color: themeColors.info,
		description: "Identity & User Management",
	},
	Hydra: {
		icon: HydraIcon,
		color: themeColors.purple,
		description: "OAuth2 & OpenID Connect",
	},
};

export function ServiceConfigSection({
	serviceName,
	form,
	currentEndpoints,
	publicUrlPlaceholder,
	adminUrlPlaceholder,
	publicUrlHelperText,
	adminUrlHelperText,
	onSave,
	validateUrl,
	isEditingApiKey,
	onApiKeyEditStart,
}: ServiceConfigSectionProps) {
	const {
		handleSubmit,
		control,
		formState: { errors, isDirty, isSubmitting },
	} = form;

	const config = serviceConfig[serviceName];
	const ServiceIcon = config.icon;

	return (
		<SectionCard
			title={
				<FlexBox align="center" gap={1.5}>
					<Box
						sx={{
							background: `${config.color}1a`,
							borderRadius: 1.5,
							p: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<ServiceIcon sx={{ fontSize: 22, color: config.color }} />
					</Box>
					<Box>
						<Typography variant="heading" size="lg">
							Ory {serviceName}
						</Typography>
						<Typography variant="body" color="secondary" sx={{ fontSize: "0.75rem" }}>
							{config.description}
						</Typography>
					</Box>
				</FlexBox>
			}
		>
			<Box component="form" onSubmit={handleSubmit(onSave)}>
				<Grid container spacing={3}>
					{/* Endpoints Section */}
					<Grid size={{ xs: 12 }}>
						<Paper
							elevation={0}
							sx={{
								p: 2.5,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 2,
								bgcolor: "background.default",
							}}
						>
							<FlexBox align="center" gap={1} sx={{ mb: 2 }}>
								<PublicIcon sx={{ fontSize: 18, color: "text.secondary" }} />
								<Typography variant="label" sx={{ fontWeight: 600 }}>
									API Endpoints
								</Typography>
							</FlexBox>
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, md: 6 }}>
									<Controller
										name="publicUrl"
										control={control}
										rules={{ validate: validateUrl }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Public URL"
												placeholder={publicUrlPlaceholder}
												fullWidth
												size="small"
												error={!!errors.publicUrl}
												helperText={errors.publicUrl?.message || publicUrlHelperText}
												slotProps={{
													input: {
														startAdornment: (
															<Box
																sx={{
																	mr: 1,
																	display: "flex",
																	color: "text.secondary",
																}}
															>
																<PublicIcon sx={{ fontSize: 18 }} />
															</Box>
														),
													},
												}}
											/>
										)}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<Controller
										name="adminUrl"
										control={control}
										rules={{ validate: validateUrl }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Admin URL"
												placeholder={adminUrlPlaceholder}
												fullWidth
												size="small"
												error={!!errors.adminUrl}
												helperText={errors.adminUrl?.message || adminUrlHelperText}
												slotProps={{
													input: {
														startAdornment: (
															<Box
																sx={{
																	mr: 1,
																	display: "flex",
																	color: "text.secondary",
																}}
															>
																<AdminIcon sx={{ fontSize: 18 }} />
															</Box>
														),
													},
												}}
											/>
										)}
									/>
								</Grid>
							</Grid>
						</Paper>
					</Grid>

					{/* Authentication Section */}
					<Grid size={{ xs: 12 }}>
						<Paper
							elevation={0}
							sx={{
								p: 2.5,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 2,
								bgcolor: "background.default",
							}}
						>
							<FlexBox align="center" gap={1} sx={{ mb: 2 }}>
								<ApiKeyIcon sx={{ fontSize: 18, color: "text.secondary" }} />
								<Typography variant="label" sx={{ fontWeight: 600 }}>
									Authentication
								</Typography>
								{currentEndpoints.apiKey?.trim() && (
									<Box
										sx={{
											ml: "auto",
											px: 1,
											py: 0.25,
											borderRadius: 1,
											bgcolor: `${themeColors.success}1a`,
										}}
									>
										<Typography
											sx={{
												fontSize: "0.7rem",
												color: themeColors.success,
												fontWeight: 600,
											}}
										>
											CONFIGURED
										</Typography>
									</Box>
								)}
							</FlexBox>
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, md: 6 }}>
									<ApiKeyField
										name="apiKey"
										control={control}
										label="API Key"
										hasExistingKey={!!currentEndpoints.apiKey?.trim()}
										isEditing={isEditingApiKey}
										onEditStart={onApiKeyEditStart}
										error={errors.apiKey?.message}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<Alert severity="info" sx={{ height: "100%" }}>
										<Typography variant="body" sx={{ fontSize: "0.8rem" }}>
											API keys are encrypted before storage. Required for Ory Network authentication.
										</Typography>
									</Alert>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</Grid>

				<ActionBar
					primaryAction={{
						label: isSubmitting ? "Saving..." : `Save ${serviceName} Settings`,
						onClick: handleSubmit(onSave),
						disabled: (!isDirty && !isEditingApiKey) || isSubmitting,
					}}
					align="right"
				/>
			</Box>
		</SectionCard>
	);
}

ServiceConfigSection.displayName = "ServiceConfigSection";
