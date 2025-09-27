'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  VpnKey as VpnKeyIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useOAuth2ConsentSessions, useOAuth2LoginSessions, useRevokeOAuth2ConsentSessions } from '@/features/oauth2-auth';
import { getRequestStatusInfo, formatChallenge } from '@/features/oauth2-auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`oauth2-auth-tabpanel-${index}`}
      aria-labelledby={`oauth2-auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OAuth2AuthFlowsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  // Hooks
  const { data: consentSessionsData, isLoading: consentLoading, error: consentError } = useOAuth2ConsentSessions();
  const { data: loginSessionsData, isLoading: loginLoading } = useOAuth2LoginSessions(
    subjectFilter,
    !!subjectFilter
  );
  const revokeConsentMutation = useRevokeOAuth2ConsentSessions();

  const consentSessions = consentSessionsData?.data || [];
  const loginSessions = loginSessionsData?.data || [];

  // Filter sessions based on search
  const filteredConsentSessions = consentSessions.filter((session: any) =>
    session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.client_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLoginSessions = loginSessions.filter((session: any) =>
    session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.client_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setViewDialogOpen(true);
  };

  const handleRevokeClick = (session: any) => {
    setSelectedSession(session);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedSession) return;

    try {
      await revokeConsentMutation.mutateAsync({
        subject: selectedSession.subject,
        client: selectedSession.client_id,
      });
      setRevokeDialogOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Failed to revoke consent:', error);
    }
  };

  // Consent sessions columns
  const consentColumns: GridColDef[] = [
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'client_id',
      headerName: 'Client',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'granted_scope',
      headerName: 'Granted Scopes',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value?.slice(0, 3).map((scope: string) => (
            <Chip
              key={scope}
              label={scope}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          {params.value?.length > 3 && (
            <Chip
              label={`+${params.value.length - 3}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString() : 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleViewSession(params.row)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleRevokeClick(params.row)}
            title="Revoke Consent"
            color="error"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Login sessions columns
  const loginColumns: GridColDef[] = [
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'session_id',
      headerName: 'Session ID',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {formatChallenge(params.value || '')}
        </Typography>
      ),
    },
    {
      field: 'authenticated_at',
      headerName: 'Authenticated',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString() : 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => handleViewSession(params.row)}
          title="View Details"
        >
          <ViewIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VpnKeyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              OAuth2 Auth Flows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage OAuth2 authentication flows and sessions
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {consentSessions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Consent Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {loginSessions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Login Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {new Set(consentSessions.map((s: any) => s.subject)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {new Set(consentSessions.map((s: any) => s.client_id)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Clients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search by subject or client ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Filter by subject (for login sessions)"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                variant="outlined"
                helperText="Enter a subject to load their login sessions"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {consentError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load consent sessions: {consentError.message}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`Consent Sessions (${filteredConsentSessions.length})`} />
            <Tab label={`Login Sessions (${filteredLoginSessions.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <DataGrid
            rows={filteredConsentSessions}
            columns={consentColumns}
            loading={consentLoading}
            autoHeight
            disableRowSelectionOnClick
            getRowId={(row) => `${row.subject}-${row.client_id}-${row.created_at || Math.random()}`}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {!subjectFilter ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Enter a subject in the filter above to view their login sessions
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredLoginSessions}
              columns={loginColumns}
              loading={loginLoading}
              autoHeight
              disableRowSelectionOnClick
              getRowId={(row) => row.session_id || Math.random()}
              sx={{
                border: 'none',
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          )}
        </TabPanel>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Session Details</DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSession.subject || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSession.client_id || 'N/A'}
                  </Typography>
                </Grid>
                {selectedSession.granted_scope && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Granted Scopes
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSession.granted_scope.map((scope: string) => (
                        <Chip
                          key={scope}
                          label={scope}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                {selectedSession.session_id && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Session ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {selectedSession.session_id}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {selectedSession.created_at ? new Date(selectedSession.created_at).toLocaleString() : 'Unknown'}
                  </Typography>
                </Grid>
                {selectedSession.authenticated_at && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Authenticated At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedSession.authenticated_at).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Consent Dialog */}
      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)}>
        <DialogTitle>Revoke Consent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke consent for subject "{selectedSession?.subject}"
            and client "{selectedSession?.client_id}"? This will terminate the user's session
            with this client.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRevokeConfirm}
            color="error"
            disabled={revokeConsentMutation.isPending}
          >
            {revokeConsentMutation.isPending ? 'Revoking...' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}