"use client";

import { Apps, Cloud, Group, HealthAndSafety, Info, Refresh, Schedule, Schema, Security, Settings, VpnKey } from "@mui/icons-material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ErrorState, LoadingState, StatCard } from "@/components";
import { PageHeader, ProtectedPage } from "@/components/layout";
import { Alert, Box, Grid, IconButton, Tooltip, Typography } from "@/components/ui";
import { ChartCard } from "@/components/ui/ChartCard";
import { useAnalytics } from "@/features/analytics/hooks";
import { UserRole } from "@/features/auth";
import { useFormatters } from "@/hooks";
import { gradientColors, themeColors } from "@/theme";
import { parseError } from "@/utils/errors";

export default function Dashboard() {
	const { identity, session, system, hydra, isLoading, isError, isHydraAvailable, hydraEnabled, refetchAll } = useAnalytics();
	const { formatNumber, formatDuration } = useFormatters();
	const router = useRouter();

	const sessionDays = useMemo(
		() =>
			session.data?.sessionsByDay?.map((item) =>
				new Date(item.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
			) || [],
		[session.data?.sessionsByDay],
	);

	const sessionValues = useMemo(() => session.data?.sessionsByDay?.map((item) => item.count) || [], [session.data?.sessionsByDay]);

	const identityDays = useMemo(
		() =>
			identity.data?.identitiesByDay?.map((item) =>
				new Date(item.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
			) || [],
		[identity.data?.identitiesByDay],
	);

	const identityValues = useMemo(() => identity.data?.identitiesByDay?.map((item) => item.count) || [], [identity.data?.identitiesByDay]);

	const verificationRate = useMemo(() => {
		if (!identity.data) return 0;
		const { verified, unverified } = identity.data.verificationStatus;
		return Math.round((verified / (verified + unverified)) * 100);
	}, [identity.data]);

	if (isLoading) {
		return <LoadingState variant="page" message="Loading analytics data..." />;
	}

	if (isError) {
		// Get the first error from any of the analytics queries
		const firstError = identity.error || session.error || system.error || hydra.error;
		const parsedError = parseError(firstError);

		return (
			<ProtectedPage requiredRole={UserRole.VIEWER}>
				<Box sx={{ p: 3 }}>
					<ErrorState
						variant="page"
						title={parsedError.title}
						message={parsedError.message}
						action={
							parsedError.canRetry
								? {
										label: "Retry",
										onClick: refetchAll,
										icon: <Refresh />,
									}
								: undefined
						}
						secondaryAction={
							parsedError.suggestSettings
								? {
										label: "Check Settings",
										onClick: () => router.push("/settings"),
										icon: <Settings />,
									}
								: undefined
						}
					/>
				</Box>
			</ProtectedPage>
		);
	}

	return (
		<ProtectedPage requiredRole={UserRole.VIEWER}>
			<Box sx={{ p: 3 }}>
				<PageHeader
					title="Analytics Dashboard"
					subtitle={
						isHydraAvailable ? "Insights and metrics for your Ory Kratos and Hydra systems" : "Insights and metrics for your Ory Kratos system"
					}
					actions={
						<Tooltip content="Refresh Data">
							<IconButton onClick={refetchAll} aria-label="Refresh data">
								<Refresh />
							</IconButton>
						</Tooltip>
					}
				/>

				{/* Hydra not available info banner */}
				{!isHydraAvailable && (
					<Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
						{!hydraEnabled
							? "Hydra integration is disabled. Enable it in Settings to view OAuth2 analytics."
							: "Hydra is not available. OAuth2 analytics are hidden. Check your Hydra configuration in Settings."}
					</Alert>
				)}

				{/* Key Metrics Cards */}
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard
							title="Total Users"
							value={formatNumber(identity.data?.totalIdentities || 0)}
							subtitle={`+${identity.data?.newIdentitiesLast30Days || 0} in last 30 days`}
							icon={Group}
							colorVariant="primary"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard
							title="Active Sessions"
							value={formatNumber(session.data?.activeSessions || 0)}
							subtitle={`${session.data?.sessionsLast7Days || 0} in last 7 days`}
							icon={Security}
							colorVariant="secondary"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard
							title="Avg Session"
							value={formatDuration(session.data?.averageSessionDuration || 0)}
							subtitle="Average duration"
							icon={Schedule}
							colorVariant="success"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard title="Verification Rate" value={`${verificationRate}%`} subtitle="Email verified users" icon={Schema} colorVariant="error" />
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard
							title="Identity Schemas"
							value={formatNumber(system.data?.totalSchemas || 0)}
							subtitle="Total schemas configured"
							icon={Schema}
							colorVariant="info"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<StatCard
							title="Kratos Health"
							value={system.data?.systemHealth === "healthy" ? "✓" : system.data?.systemHealth || "?"}
							subtitle={system.data?.systemHealth || "Unknown"}
							icon={HealthAndSafety}
							colorVariant="success"
						/>
					</Grid>

					{/* Hydra Metrics - only shown when Hydra is available */}
					{isHydraAvailable && (
						<>
							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<StatCard
									title="OAuth2 Clients"
									value={formatNumber(hydra.data?.totalClients || 0)}
									subtitle={`${hydra.data?.publicClients || 0} public, ${hydra.data?.confidentialClients || 0} confidential`}
									icon={Apps}
									colorVariant="warning"
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<StatCard
									title="Grant Types"
									value={hydra.data?.clientsByGrantType.length || 0}
									subtitle="Different grant types in use"
									icon={VpnKey}
									colorVariant="purple"
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<StatCard
									title="Hydra Health"
									value={hydra.data?.systemHealth === "healthy" ? "✓" : hydra.data?.systemHealth === "error" ? "✗" : "?"}
									subtitle={hydra.data?.systemHealth || "Unknown"}
									icon={Cloud}
									colorVariant="blue"
								/>
							</Grid>
						</>
					)}
				</Grid>

				{/* Charts Section */}
				<Grid container spacing={3}>
					{/* User Growth Chart */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<ChartCard title="New User Registrations (Last 30 Days)">
							<LineChart
								xAxis={[
									{
										data: identityDays,
										scaleType: "point",
										tickSize: 0,
									},
								]}
								series={[
									{
										data: identityValues,
										color: themeColors.info,
										area: true,
										curve: "monotoneX",
									},
								]}
								height={350}
								margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
								grid={{ horizontal: true, vertical: false }}
								sx={{
									"& .MuiLineElement-root": {
										strokeWidth: 3,
									},
									"& .MuiAreaElement-root": {
										fillOpacity: 0.1,
									},
								}}
							/>
						</ChartCard>
					</Grid>

					{/* Identity Schema Distribution */}
					<Grid size={{ xs: 12, lg: 4 }}>
						<ChartCard title="Users by Schema">
							<PieChart
								series={[
									{
										data:
											identity.data?.identitiesBySchema.map((item, index) => ({
												id: index,
												label: item.schema.length > 20 ? `${item.schema.slice(0, 20)}...` : item.schema,
												value: item.count,
											})) || [],
										innerRadius: 40,
										outerRadius: 100,
										paddingAngle: 3,
										cornerRadius: 4,
										highlightScope: { fade: "global", highlight: "item" },
										valueFormatter: (value, { dataIndex }) => {
											const schema = identity.data?.identitiesBySchema[dataIndex]?.schema || "";
											return `${schema}: ${value.value}`;
										},
									},
								]}
								height={350}
								slotProps={{
									legend: {
										position: { vertical: "bottom", horizontal: "center" },
									},
								}}
							/>
						</ChartCard>
					</Grid>

					{/* Session Activity Chart */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<ChartCard title="Session Activity (Last 7 Days)">
							<LineChart
								xAxis={[
									{
										data: sessionDays,
										scaleType: "point",
										tickSize: 0,
									},
								]}
								yAxis={[
									{
										min: 0,
									},
								]}
								series={[
									{
										data: sessionValues,
										color: themeColors.success,
										curve: "monotoneX",
									},
								]}
								height={350}
								margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
								grid={{ horizontal: true, vertical: false }}
								sx={{
									"& .MuiLineElement-root": {
										strokeWidth: 3,
									},
								}}
							/>
						</ChartCard>
					</Grid>

					{/* Verification Status */}
					<Grid size={{ xs: 12, lg: 4 }}>
						<ChartCard title="Email Verification Rate">
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									height: 350,
									py: 2,
								}}
							>
								<Gauge
									value={verificationRate}
									startAngle={-110}
									endAngle={110}
									width={280}
									height={280}
									cornerRadius="50%"
									text={({ value }) => `${value}%`}
									sx={(theme) => ({
										[`& .${gaugeClasses.valueText}`]: {
											fontSize: 56,
											fontWeight: 700,
											fill: gradientColors.primary,
										},
										[`& .${gaugeClasses.valueArc}`]: {
											fill: "url(#gradient)",
										},
										[`& .${gaugeClasses.referenceArc}`]: {
											fill: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
										},
									})}
								>
									<defs>
										<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
											<stop offset="0%" stopColor={gradientColors.primary} />
											<stop offset="100%" stopColor={gradientColors.secondary} />
										</linearGradient>
									</defs>
								</Gauge>
								<Box sx={{ mt: 2, textAlign: "center" }}>
									<Typography variant="body" color="text.secondary">
										{identity.data?.verificationStatus.verified || 0} verified of{" "}
										{(identity.data?.verificationStatus.verified || 0) + (identity.data?.verificationStatus.unverified || 0)} total users
									</Typography>
								</Box>
							</Box>
						</ChartCard>
					</Grid>

					{/* OAuth2 Charts - only shown when Hydra is available */}
					{isHydraAvailable && (
						<>
							{/* OAuth2 Client Types Distribution */}
							<Grid size={{ xs: 12, lg: 4 }}>
								<ChartCard title="OAuth2 Client Types">
									<PieChart
										series={[
											{
												data: [
													{
														id: 0,
														label: "Public",
														value: hydra.data?.publicClients || 0,
														color: "#2196f3",
													},
													{
														id: 1,
														label: "Confidential",
														value: hydra.data?.confidentialClients || 0,
														color: "#ff9800",
													},
												],
												innerRadius: 40,
												outerRadius: 100,
												paddingAngle: 3,
												cornerRadius: 4,
												highlightScope: { fade: "global", highlight: "item" },
												valueFormatter: (value, { dataIndex }) => {
													const labels = ["Public", "Confidential"];
													return `${labels[dataIndex]}: ${value.value}`;
												},
											},
										]}
										height={350}
										slotProps={{
											legend: {
												position: { vertical: "bottom", horizontal: "center" },
											},
										}}
									/>
								</ChartCard>
							</Grid>

							{/* Grant Types Distribution */}
							<Grid size={{ xs: 12, lg: 8 }}>
								<ChartCard title="OAuth2 Grant Types Usage">
									<PieChart
										series={[
											{
												data:
													hydra.data?.clientsByGrantType.map((item, index) => ({
														id: index,
														label: item.grantType.length > 20 ? `${item.grantType.slice(0, 20)}...` : item.grantType,
														value: item.count,
													})) || [],
												innerRadius: 60,
												outerRadius: 120,
												paddingAngle: 2,
												cornerRadius: 4,
												highlightScope: { fade: "global", highlight: "item" },
												valueFormatter: (value, { dataIndex }) => {
													const grantType = hydra.data?.clientsByGrantType[dataIndex]?.grantType || "";
													return `${grantType}: ${value.value}`;
												},
											},
										]}
										height={350}
										slotProps={{
											legend: {
												position: { vertical: "bottom", horizontal: "center" },
											},
										}}
									/>
								</ChartCard>
							</Grid>
						</>
					)}
				</Grid>
			</Box>
		</ProtectedPage>
	);
}
