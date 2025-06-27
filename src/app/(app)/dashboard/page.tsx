'use client';

import { Box, Typography, Grid, Paper, Card, CardContent, IconButton, Tooltip, Alert } from '@mui/material';
import { Refresh, TrendingUp, Group, Security, Schedule, Schema, HealthAndSafety, AccessTime } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/config/users';
import { useAnalytics } from '@/features/analytics/hooks';
import { DottedLoader } from '@/components/ui/DottedLoader';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from '@mui/x-charts/Gauge';

export default function Dashboard() {
  const { identity, session, system, isLoading, isError, refetchAll } = useAnalytics();

  const sessionDays = session.data?.sessionsByDay?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [];
  const sessionValues = session.data?.sessionsByDay?.map(item => item.count) || [];
  
  const identityDays = identity.data?.identitiesByDay?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [];
  const identityValues = identity.data?.identitiesByDay?.map(item => item.count) || [];

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Insights and metrics for your Kratos identity management system
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
            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">
                      Total Users
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatNumber(identity.data?.totalIdentities || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +{identity.data?.newIdentitiesLast30Days || 0} in last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Security color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="success.main">
                      Active Sessions
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatNumber(session.data?.activeSessions || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {session.data?.sessionsLast7Days || 0} in last 7 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="warning.main">
                      Avg Session
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatDuration(session.data?.averageSessionDuration || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average duration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="info.main">
                      Verification Rate
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {identity.data ?
                      Math.round((identity.data.verificationStatus.verified /
                        (identity.data.verificationStatus.verified + identity.data.verificationStatus.unverified)) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email verified users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schema color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="secondary.main">
                      Identity Schemas
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatNumber(system.data?.totalSchemas || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total schemas configured
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HealthAndSafety color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="success.main">
                      System Health
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {system.data?.systemHealth === 'healthy' ? '✓' : system.data?.systemHealth || '?'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {system.data?.systemHealth || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 1.7 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="info.main">
                      Last Updated
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {system.data?.lastUpdated ?
                      new Date(system.data.lastUpdated).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) :
                      '--:--'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data refresh time
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
                  xAxis={[{ 
                    data: identityDays, 
                    scaleType: 'point',
                    tickSize: 0
                  }]}
                  series={[{ 
                    data: identityValues, 
                    color: '#0075ff',
                    area: true,
                    curve: 'monotoneX'
                  }]}
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
                      data: identity.data?.identitiesBySchema.map((item, index) => ({
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
                  xAxis={[{ 
                    data: sessionDays, 
                    scaleType: 'point',
                    tickSize: 0
                  }]}
                  yAxis={[{
                    min: 0
                  }]}
                  series={[{ 
                    data: sessionValues, 
                    color: '#009688',
                    curve: 'monotoneX'
                  }]}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Gauge
                    value={identity.data ?
                      Math.round((identity.data.verificationStatus.verified /
                        (identity.data.verificationStatus.verified + identity.data.verificationStatus.unverified)) * 100)
                      : 0}
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

          </Grid>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
