'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { Alert, Button, Card, Chip, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@/components/ui';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Token as TokenIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  useTokenIntrospectionManager,
  useRevokeOAuth2Token,
  useOAuth2TokenStats,
} from '@/features/oauth2-tokens';
import {
  getDefaultIntrospectTokenFormData,
  validateIntrospectTokenForm,
  enhanceTokenDetails,
  getTokenStatusInfo,
  previewToken,
  parseJWTClaims,
} from '@/features/oauth2-tokens';
import type { IntrospectTokenFormData, TokenFormErrors } from '@/features/oauth2-tokens';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  CheckCircle, 
  Error as ErrorIcon, 
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon 
} from '@mui/icons-material';

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
      id={`oauth2-tokens-tabpanel-${index}`}
      aria-labelledby={`oauth2-tokens-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OAuth2TokensPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [introspectFormData, setIntrospectFormData] = useState<IntrospectTokenFormData>(
    getDefaultIntrospectTokenFormData()
  );
  const [formErrors, setFormErrors] = useState<TokenFormErrors>({});
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeTokenValue, setRevokeTokenValue] = useState('');

  // Hooks
  const {
    introspectedTokens,
    addTokenIntrospection,
    removeTokenIntrospection,
    clearAllIntrospections,
    isIntrospecting,
    introspectionError,
  } = useTokenIntrospectionManager();

  const revokeTokenMutation = useRevokeOAuth2Token();
  const { data: tokenStats } = useOAuth2TokenStats(introspectedTokens);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleIntrospectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateIntrospectTokenForm(introspectFormData);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await addTokenIntrospection(introspectFormData);
      setIntrospectFormData(getDefaultIntrospectTokenFormData());
    } catch (error) {
      console.error('Failed to introspect token:', error);
    }
  };

  const handleViewToken = (token: any) => {
    setSelectedToken(enhanceTokenDetails(token));
    setViewDialogOpen(true);
  };

  const handleRevokeClick = (token: any) => {
    setRevokeTokenValue(token.tokenPreview || '');
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTokenValue) return;

    try {
      await revokeTokenMutation.mutateAsync({ token: revokeTokenValue });
      setRevokeDialogOpen(false);
      setRevokeTokenValue('');
      // Optionally remove from introspected tokens
      const tokenToRemove = introspectedTokens.find(t => t.tokenPreview === revokeTokenValue);
      if (tokenToRemove) {
        removeTokenIntrospection(tokenToRemove.key);
      }
    } catch (error) {
      console.error('Failed to revoke token:', error);
    }
  };

  // Token table columns
  const tokenColumns: GridColDef[] = [
    {
      field: 'tokenPreview',
      headerName: 'Token',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'sub',
      headerName: 'Subject',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'client_id',
      headerName: 'Client ID',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'scope',
      headerName: 'Scopes',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return null;
        const scopes = params.value.split(' ').slice(0, 2);
        const remainingCount = params.value.split(' ').length - 2;

        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {scopes.map((scope: string) => (
              <Chip
                key={scope}
                label={scope}
                variant="tag"
                size="small"
              />
            ))}
            {remainingCount > 0 && (
              <Chip
                label={`+${remainingCount}`}
                variant="tag"
                size="small"
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const statusInfo = getTokenStatusInfo(params.row);
        const IconComponent = statusInfo.status === 'active' ? CheckCircleIcon : CancelIcon;

        return (
          <Chip
            label={statusInfo.displayName}
            variant="status"
            size="small"
          />
        );
      },
    },
    {
      field: 'exp',
      headerName: 'Expires',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return 'Never';
        const expiryDate = new Date(params.value * 1000);
        const now = new Date();
        const isExpired = expiryDate < now;

        return (
          <Typography
            variant="caption"
            color={isExpired ? 'error' : 'text.secondary'}
          >
            {expiryDate.toLocaleDateString()}
          </Typography>
        );
      },
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
            onClick={() => handleViewToken(params.row)}
            title="View Details"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleRevokeClick(params.row)}
            title="Revoke Token"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TokenIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="heading" level="h1">
              OAuth2 Tokens
            </Typography>
            <Typography variant="body" color="secondary">
              Introspect, validate, and manage OAuth2 tokens
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          onClick={clearAllIntrospections}
          disabled={introspectedTokens.length === 0}
        >
          Clear All
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Introspected Tokens"
            value={tokenStats?.totalTokens || 0}
            icon={ReceiptIcon}
            color="#667eea"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Active Tokens"
            value={tokenStats?.activeTokens || 0}
            icon={CheckCircle}
            color="#00b894"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Expired Tokens"
            value={tokenStats?.expiredTokens || 0}
            icon={ErrorIcon}
            color="#e17055"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Expiring in 24h"
            value={tokenStats?.tokensExpiringIn24h || 0}
            icon={ScheduleIcon}
            color="#fdcb6e"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`Introspect Token`} />
            <Tab label={`Token List (${introspectedTokens.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleIntrospectSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Access Token"
                  value={introspectFormData.token}
                  onChange={(e) => setIntrospectFormData(prev => ({ ...prev, token: e.target.value }))}
                  error={!!formErrors.token}
                  helperText={formErrors.token || 'Paste the token you want to introspect'}
                  multiline
                  rows={4}
                  placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Scope (Optional)"
                  value={introspectFormData.scope}
                  onChange={(e) => setIntrospectFormData(prev => ({ ...prev, scope: e.target.value }))}
                  helperText="Optional scope to check against the token"
                  placeholder="openid profile email"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isIntrospecting}
                    style={{ minWidth: '150px' }}
                  >
                    <SearchIcon style={{ marginRight: '0.5rem' }} />
                    {isIntrospecting ? 'Introspecting...' : 'Introspect Token'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIntrospectFormData(getDefaultIntrospectTokenFormData())}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Error Display */}
          {introspectionError && (
            <Alert severity="error" style={{ marginTop: '1rem' }}>
              Failed to introspect token: {introspectionError.message}
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {introspectedTokens.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TokenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="heading" level="h2" color="secondary">
                No tokens introspected yet
              </Typography>
              <Typography variant="body" color="secondary">
                Use the &quot;Introspect Token&quot; tab to analyze OAuth2 tokens
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={introspectedTokens}
              columns={tokenColumns}
              autoHeight
              disableRowSelectionOnClick
              getRowId={(row) => row.key}
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

      {/* Token Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} title="Token Details" maxWidth="md">
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SecurityIcon />
            <Typography variant="heading" level="h2">Token Details</Typography>
          </Box>
          {selectedToken && (
            <Box>
              {/* Status Banner */}
              <Alert
                severity={selectedToken.statusInfo?.isActive ? 'success' : 'error'}
                style={{ marginBottom: '1.5rem' }}
              >
                {selectedToken.statusInfo?.isActive ? <CheckCircleIcon style={{ marginRight: '0.5rem' }} /> : <WarningIcon style={{ marginRight: '0.5rem' }} />}
                <Typography variant="body">
                  Token is {selectedToken.statusInfo?.isActive ? 'active' : 'inactive/expired'}
                  {selectedToken.statusInfo?.timeToExpiry && (
                    <> • Expires in {selectedToken.statusInfo.timeToExpiry}</>
                  )}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid size={{ xs: 12 }}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="heading" level="h3">Basic Information</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body" color="secondary">
                            Subject
                          </Typography>
                          <Typography variant="body">
                            {selectedToken.sub || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body" color="secondary">
                            Client ID
                          </Typography>
                          <Typography variant="body">
                            {selectedToken.client_id || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body" color="secondary">
                            Token Type
                          </Typography>
                          <Typography variant="body">
                            {selectedToken.tokenTypeFormatted || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body" color="secondary">
                            Token Use
                          </Typography>
                          <Typography variant="body">
                            {selectedToken.token_use || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Timestamps */}
                <Grid size={{ xs: 12 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Timestamps</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Issued At
                          </Typography>
                          <Typography variant="body1">
                            {selectedToken.issuedAtFormatted || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Expires At
                          </Typography>
                          <Typography variant="body1">
                            {selectedToken.expiresAtFormatted || 'Never'}
                          </Typography>
                        </Grid>
                        {selectedToken.nbf && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Not Before
                            </Typography>
                            <Typography variant="body1">
                              {new Date(selectedToken.nbf * 1000).toLocaleString()}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Scopes and Audience */}
                <Grid size={{ xs: 12 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Scopes & Audience</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Scopes
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedToken.formattedScopes?.map((scope: string) => (
                            <Chip
                              key={scope}
                              label={scope}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )) || <Typography variant="body2">None</Typography>}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Audience
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedToken.formattedAudience?.map((aud: string) => (
                            <Chip
                              key={aud}
                              label={aud}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )) || <Typography variant="body2">None</Typography>}
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Token Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        title="Revoke Token"
        actions={
          <>
            <Button onClick={() => setRevokeDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button
              onClick={handleRevokeConfirm}
              variant="danger"
              disabled={revokeTokenMutation.isPending}
            >
              {revokeTokenMutation.isPending ? 'Revoking...' : 'Revoke Token'}
            </Button>
          </>
        }
      >
        <Typography variant="body" style={{ marginBottom: '1rem' }}>
          Are you sure you want to revoke this token? This action cannot be undone
          and will immediately invalidate the token.
        </Typography>
        <Typography variant="code" color="secondary">
          {revokeTokenValue}
        </Typography>
      </Dialog>

      {/* Revoke Error Display */}
      {revokeTokenMutation.error && (
        <Alert severity="error" style={{ marginTop: '1rem' }}>
          Failed to revoke token: {revokeTokenMutation.error.message}
        </Alert>
      )}
      </Box>
    </AdminLayout>
  );
}