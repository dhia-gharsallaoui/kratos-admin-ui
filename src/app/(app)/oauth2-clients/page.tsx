'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
} from '@/components/ui';
import { Alert, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, TextField, Typography } from '@/components/ui';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAllOAuth2Clients, useDeleteOAuth2Client } from '@/features/oauth2-clients';
import { transformOAuth2ClientForTable, formatClientId, getClientType } from '@/features/oauth2-clients';
import { OAuth2Client } from '@/services/hydra';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  Group,
  Public as PublicIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';

export default function OAuth2ClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Hooks
  const { data: clientsData, isLoading, error } = useAllOAuth2Clients();
  const deleteClientMutation = useDeleteOAuth2Client();

  // Transform data for display
  const clients = clientsData?.clients || [];
  const tableRows = clients.map(transformOAuth2ClientForTable);

  // Filter clients based on search
  const filteredRows = tableRows.filter(row =>
    row.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, clientId: string) => {
    event.stopPropagation();
    setSelectedClient(clientId);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedClient(null);
  };

  const handleView = (clientId: string) => {
    router.push(`/oauth2-clients/${clientId}`);
    handleMenuClose();
  };

  const handleEdit = (clientId: string) => {
    router.push(`/oauth2-clients/${clientId}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClientMutation.mutateAsync(clientToDelete);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: 'displayName',
      headerName: 'Client Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="code" sx={{ fontSize: '0.75rem' }}>
            {formatClientId(params.row.id)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'grantTypesList',
      headerName: 'Grant Types',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value?.slice(0, 2).map((grantType: string) => (
            <Chip
              key={grantType}
              variant="tag"
              label={grantType.replace('_', ' ')}
            />
          ))}
          {params.value?.length > 2 && (
            <Chip
              variant="gradient"
              label={`+${params.value.length - 2}`}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'scopeList',
      headerName: 'Scopes',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value?.slice(0, 3).map((scope: string) => (
            <Chip
              key={scope}
              variant="role"
              label={scope}
            />
          ))}
          {params.value?.length > 3 && (
            <Chip
              variant="gradient"
              label={`+${params.value.length - 3}`}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'client_secret',
      headerName: 'Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const clientType = getClientType(params.row as OAuth2Client);
        return (
          <Chip
            variant={clientType === 'confidential' ? 'gradient' : 'tag'}
            label={clientType}
          />
        );
      },
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="label">
          {params.value || 'Unknown'}
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
          onClick={(event) => handleMenuClick(event, params.row.id)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppsIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="gradient" size="3xl">
              OAuth2 Clients
            </Typography>
            <Typography variant="subheading">
              Manage OAuth2 client applications and their configurations
            </Typography>
          </Box>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push('/oauth2-clients/create')}
        >
          Create Client
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Clients"
            value={clientsData?.totalCount || 0}
            icon={Group}
            color="#667eea"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Public Clients"
            value={clients.filter(c => !c.client_secret).length}
            icon={PublicIcon}
            color="#74b9ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Confidential Clients"
            value={clients.filter(c => !!c.client_secret).length}
            icon={LockIcon}
            color="#a29bfe"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Auth Code Flow"
            value={clients.filter(c => c.grant_types?.includes('authorization_code')).length}
            icon={VpnKeyIcon}
            color="#00b894"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <Card variant="bordered" sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            variant="search"
            fullWidth
            placeholder="Search clients by name, ID, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="inline" severity="error" sx={{ mb: 3 }}>
          Failed to load OAuth2 clients: {error.message}
        </Alert>
      )}

      {/* Data Grid */}
      <Card variant="bordered">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(params) => router.push(`/oauth2-clients/${params.row.id}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row': {
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                cursor: 'pointer',
                transform: 'scale(1.001)',
              },
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem icon={<ViewIcon fontSize="small" />} onClick={() => selectedClient && handleView(selectedClient)}>
          View Details
        </MenuItem>
        <MenuItem icon={<EditIcon fontSize="small" />} onClick={() => selectedClient && handleEdit(selectedClient)}>
          Edit Client
        </MenuItem>
        <MenuItem icon={<DeleteIcon fontSize="small" />} onClick={() => selectedClient && handleDeleteClick(selectedClient)}>
          Delete Client
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        title="Delete OAuth2 Client"
      >
        <DialogContent>
          <Typography variant="body">
            Are you sure you want to delete this OAuth2 client? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="danger"
            disabled={deleteClientMutation.isPending}
          >
            {deleteClientMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminLayout>
  );
}
