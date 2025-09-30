'use client';

import { Box, Typography, Grid, Paper, Card, CardContent, IconButton, Tooltip, Alert } from '@mui/material';
import { Refresh, TrendingUp, Group, Security, Schedule, Schema, HealthAndSafety, VpnKey, Cloud, Apps } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { useAnalytics } from '@/features/analytics/hooks';
import { DottedLoader } from '@/components/ui/DottedLoader';
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
            <DottedLoader variant="page" />
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
            <Alert severity="error" sx={{ mb: 3 }}>
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
              <Typography variant="h4" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Insights and metrics for your Ory Kratos and Hydra systems
              </Typography>
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refetchAll}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(102, 126, 234, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                  },
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.5 },
                    '50%': { opacity: 1 },
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Group sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Users
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {formatNumber(identity.data?.totalIdentities || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    +{identity.data?.newIdentitiesLast30Days || 0} in last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(240, 147, 251, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Security sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Active Sessions
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {formatNumber(session.data?.activeSessions || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {session.data?.sessionsLast7Days || 0} in last 7 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(79, 172, 254, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Schedule sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Avg Session
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {formatDuration(session.data?.averageSessionDuration || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Average duration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(250, 112, 154, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Verification Rate
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {identity.data
                      ? Math.round(
                          (identity.data.verificationStatus.verified /
                            (identity.data.verificationStatus.verified + identity.data.verificationStatus.unverified)) *
                            100
                        )
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Email verified users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: '#333',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(168, 237, 234, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Schema sx={{ fontSize: 32, color: '#667eea' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Identity Schemas
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {formatNumber(system.data?.totalSchemas || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total schemas configured
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #3eecac 0%, #1dd1a1 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(62, 236, 172, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <HealthAndSafety sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Kratos Health
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {system.data?.systemHealth === 'healthy' ? '✓' : system.data?.systemHealth || '?'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {system.data?.systemHealth || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Hydra Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(255, 167, 81, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Apps sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      OAuth2 Clients
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {formatNumber(hydra.data?.totalClients || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {hydra.data?.publicClients || 0} public, {hydra.data?.confidentialClients || 0} confidential
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(196, 113, 245, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <VpnKey sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Grant Types
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {hydra.data?.clientsByGrantType.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Different grant types in use
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(48, 207, 208, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        mr: 2,
                      }}
                    >
                      <Cloud sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Hydra Health
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    {hydra.data?.systemHealth === 'healthy' ? '✓' : hydra.data?.systemHealth === 'error' ? '✗' : '?'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {hydra.data?.systemHealth || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3}>
            {/* User Growth Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  New User Registrations (Last 30 Days)
                </Typography>
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
              </Paper>
            </Grid>

            {/* Identity Schema Distribution */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  Users by Schema
                </Typography>
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
              </Paper>
            </Grid>

            {/* Session Activity Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  Session Activity (Last 7 Days)
                </Typography>
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
              </Paper>
            </Grid>

            {/* Verification Status */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  Email Verification Rate
                </Typography>
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
                  <Typography variant="body2" color="text.secondary">
                    {identity.data?.verificationStatus.verified || 0} verified of{' '}
                    {(identity.data?.verificationStatus.verified || 0) + (identity.data?.verificationStatus.unverified || 0)} total users
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* OAuth2 Client Types Distribution */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  OAuth2 Client Types
                </Typography>
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
              </Paper>
            </Grid>

            {/* Grant Types Distribution */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  OAuth2 Grant Types Usage
                </Typography>
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
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
