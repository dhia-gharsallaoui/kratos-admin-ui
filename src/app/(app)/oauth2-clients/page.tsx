'use client';

import { useState } from 'react';
import { Box, Grid, Card, Chip, Dialog, DialogActions, DialogContent, IconButton, Menu, MenuItem, Typography } from '@/components/ui';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Apps as AppsIcon,
  Group,
  Public as PublicIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedPage, PageHeader, SectionCard, ActionBar } from '@/components/layout';
import { StatCard, ErrorState } from '@/components';
import { SearchBar } from '@/components/forms';
import { useAllOAuth2Clients, useDeleteOAuth2Client } from '@/features/oauth2-clients';
import { transformOAuth2ClientForTable, formatClientId, getClientType } from '@/features/oauth2-clients';
import { OAuth2Client } from '@/services/hydra';

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
    <ProtectedPage>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="OAuth2 Clients"
          subtitle="Manage OAuth2 client applications and their configurations"
          icon={<AppsIcon sx={{ fontSize: 32, color: 'white' }} />}
          actions={
            <ActionBar
              primaryAction={{
                label: 'Create Client',
                icon: <AddIcon />,
                onClick: () => router.push('/oauth2-clients/create'),
              }}
            />
          }
        />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Clients"
            value={clientsData?.totalCount || 0}
            icon={Group}
            colorVariant="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Public Clients"
            value={clients.filter(c => !c.client_secret).length}
            icon={PublicIcon}
            colorVariant="blue"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Confidential Clients"
            value={clients.filter(c => !!c.client_secret).length}
            icon={LockIcon}
            colorVariant="purple"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Auth Code Flow"
            value={clients.filter(c => c.grant_types?.includes('authorization_code')).length}
            icon={VpnKeyIcon}
            colorVariant="success"
          />
        </Grid>
      </Grid>

      {/* Search */}
      <SectionCard sx={{ mb: 3 }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients by name, ID, or owner..."
        />
      </SectionCard>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorState
            variant="inline"
            message={`Failed to load OAuth2 clients: ${error.message}`}
          />
        </Box>
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
          <ActionBar
            align="right"
            primaryAction={{
              label: 'Delete',
              onClick: handleDeleteConfirm,
              loading: deleteClientMutation.isPending,
              disabled: deleteClientMutation.isPending,
            }}
            secondaryActions={[
              {
                label: 'Cancel',
                onClick: handleDeleteCancel,
                variant: 'outlined',
              },
            ]}
          />
        </DialogActions>
      </Dialog>
      </Box>
    </ProtectedPage>
  );
}
