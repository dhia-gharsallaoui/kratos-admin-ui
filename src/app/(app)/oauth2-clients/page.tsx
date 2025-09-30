'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
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
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
              label={grantType.replace('_', ' ')}
              size="small"
              variant="outlined"
            />
          ))}
          {params.value?.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
              color="primary"
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
              label={scope}
              size="small"
              color="secondary"
              variant="outlined"
            />
          ))}
          {params.value?.length > 3 && (
            <Chip
              label={`+${params.value.length - 3}`}
              size="small"
              color="secondary"
              variant="outlined"
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
            label={clientType}
            size="small"
            color={clientType === 'confidential' ? 'primary' : 'default'}
            variant="filled"
          />
        );
      },
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
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
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              OAuth2 Clients
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage OAuth2 client applications and their configurations
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/oauth2-clients/create')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)',
            },
          }}
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
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search clients by name, ID, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#764ba2',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load OAuth2 clients: {error.message}
        </Alert>
      )}

      {/* Data Grid */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
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
        <MenuItem onClick={() => selectedClient && handleView(selectedClient)}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedClient && handleEdit(selectedClient)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Client
        </MenuItem>
        <MenuItem onClick={() => selectedClient && handleDeleteClick(selectedClient)}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Client
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete OAuth2 Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this OAuth2 client? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
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