'use client';

import { Box, Grid, Paper } from '@mui/material';
import { Refresh, TrendingUp, Group, Security, Schedule, Schema, HealthAndSafety, VpnKey, Cloud, Apps } from '@mui/icons-material';
import { Alert, Card, IconButton, Tooltip, Typography } from '@/components/ui';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { useAnalytics } from '@/features/analytics/hooks';
import { Spinner } from '@/components/ui/Spinner';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from '@mui/x-charts/Gauge';

export default function Dashboard() {
  const { identity, session, system, hydra, isLoading, isError, refetchAll } = useAnalytics();

  const sessionDays =
    session.data?.sessionsByDay?.map((item) =>
      new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ) || [];
  const sessionValues = session.data?.sessionsByDay?.map((item) => item.count) || [];

  const identityDays =
    identity.data?.identitiesByDay?.map((item) =>
      new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ) || [];
  const identityValues = identity.data?.identitiesByDay?.map((item) => item.count) || [];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={UserRole.VIEWER}>
        <AdminLayout>
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Spinner variant="ring" size="large" />
          </Box>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (isError) {
    return (
      <ProtectedRoute requiredRole={UserRole.VIEWER}>
        <AdminLayout>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Failed to load analytics data. Please try refreshing the page.
            </Alert>
          </Box>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={UserRole.VIEWER}>
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="heading" level="h1">
                Analytics Dashboard
              </Typography>
              <Typography variant="body">
                Insights and metrics for your Ory Kratos and Hydra systems
              </Typography>
            </Box>
            <Tooltip content="Refresh Data">
              <IconButton onClick={refetchAll} aria-label="Refresh data">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Total Users"
                value={formatNumber(identity.data?.totalIdentities || 0)}
                subtitle={`+${identity.data?.newIdentitiesLast30Days || 0} in last 30 days`}
                icon={Group}
                color="#667eea"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Active Sessions"
                value={formatNumber(session.data?.activeSessions || 0)}
                subtitle={`${session.data?.sessionsLast7Days || 0} in last 7 days`}
                icon={Security}
                color="#764ba2"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Avg Session"
                value={formatDuration(session.data?.averageSessionDuration || 0)}
                subtitle="Average duration"
                icon={Schedule}
                color="#00b894"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Verification Rate"
                value={`${
                  identity.data
                    ? Math.round(
                        (identity.data.verificationStatus.verified /
                          (identity.data.verificationStatus.verified + identity.data.verificationStatus.unverified)) *
                          100
                      )
                    : 0
                }%`}
                subtitle="Email verified users"
                icon={TrendingUp}
                color="#e17055"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Identity Schemas"
                value={formatNumber(system.data?.totalSchemas || 0)}
                subtitle="Total schemas configured"
                icon={Schema}
                color="#0984e3"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Kratos Health"
                value={system.data?.systemHealth === 'healthy' ? '✓' : system.data?.systemHealth || '?'}
                subtitle={system.data?.systemHealth || 'Unknown'}
                icon={HealthAndSafety}
                color="#00b894"
              />
            </Grid>

            {/* Hydra Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="OAuth2 Clients"
                value={formatNumber(hydra.data?.totalClients || 0)}
                subtitle={`${hydra.data?.publicClients || 0} public, ${hydra.data?.confidentialClients || 0} confidential`}
                icon={Apps}
                color="#fdcb6e"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Grant Types"
                value={hydra.data?.clientsByGrantType.length || 0}
                subtitle="Different grant types in use"
                icon={VpnKey}
                color="#a29bfe"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                title="Hydra Health"
                value={hydra.data?.systemHealth === 'healthy' ? '✓' : hydra.data?.systemHealth === 'error' ? '✗' : '?'}
                subtitle={hydra.data?.systemHealth || 'Unknown'}
                icon={Cloud}
                color="#74b9ff"
              />
            </Grid>
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
                      scaleType: 'point',
                      tickSize: 0,
                    },
                  ]}
                  series={[
                    {
                      data: identityValues,
                      color: '#0075ff',
                      area: true,
                      curve: 'monotoneX',
                    },
                  ]}
                  height={350}
                  margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                  grid={{ horizontal: true, vertical: false }}
                  sx={{
                    '& .MuiLineElement-root': {
                      strokeWidth: 3,
                    },
                    '& .MuiAreaElement-root': {
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
                          label: item.schema,
                          value: item.count,
                        })) || [],
                      innerRadius: 40,
                      outerRadius: 100,
                      paddingAngle: 3,
                      cornerRadius: 4,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  height={350}
                  slotProps={{
                    legend: {
                      position: { vertical: 'bottom', horizontal: 'center' },
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
                      scaleType: 'point',
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
                      color: '#009688',
                      curve: 'monotoneX',
                    },
                  ]}
                  height={350}
                  margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                  grid={{ horizontal: true, vertical: false }}
                  sx={{
                    '& .MuiLineElement-root': {
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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 300,
                  }}
                >
                  <Gauge
                    value={
                      identity.data
                        ? Math.round(
                            (identity.data.verificationStatus.verified /
                              (identity.data.verificationStatus.verified + identity.data.verificationStatus.unverified)) *
                              100
                          )
                        : 0
                    }
                    startAngle={-90}
                    endAngle={90}
                    innerRadius="70%"
                    outerRadius="90%"
                    text={({ value }) => `${value}%`}
                    sx={{
                      '& .MuiGauge-valueText': {
                        fontSize: 32,
                        fontWeight: 'bold',
                      },
                      '& .MuiGauge-valueArc': {
                        fill: '#4caf50',
                      },
                      '& .MuiGauge-referenceArc': {
                        fill: '#ff0000',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body" color="secondary">
                    {identity.data?.verificationStatus.verified || 0} verified of{' '}
                    {(identity.data?.verificationStatus.verified || 0) + (identity.data?.verificationStatus.unverified || 0)} total users
                  </Typography>
                </Box>
              </ChartCard>
            </Grid>

            {/* OAuth2 Client Types Distribution */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <ChartCard title="OAuth2 Client Types">
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          label: 'Public',
                          value: hydra.data?.publicClients || 0,
                          color: '#2196f3',
                        },
                        {
                          id: 1,
                          label: 'Confidential',
                          value: hydra.data?.confidentialClients || 0,
                          color: '#ff9800',
                        },
                      ],
                      innerRadius: 40,
                      outerRadius: 100,
                      paddingAngle: 3,
                      cornerRadius: 4,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  height={350}
                  slotProps={{
                    legend: {
                      position: { vertical: 'bottom', horizontal: 'center' },
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
                      data: hydra.data?.clientsByGrantType.map((item, index) => ({
                        id: index,
                        label: item.grantType,
                        value: item.count,
                      })) || [],
                      innerRadius: 60,
                      outerRadius: 120,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  height={350}
                  slotProps={{
                    legend: {
                      position: { vertical: 'bottom', horizontal: 'center' },
                    },
                  }}
                />
              </ChartCard>
            </Grid>
          </Grid>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
