import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Search, Refresh, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useIdentities, useIdentitiesSearch } from '@/features/identities/hooks';
import { Identity } from '@ory/kratos-client';
import { useRouter } from 'next/navigation';
import { DottedLoader } from '@/components/ui/DottedLoader';
import { IdentityDeleteDialog } from './IdentityDeleteDialog';
import { IdentityRecoveryDialog } from './IdentityRecoveryDialog';

const IdentitiesTable: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [pageHistory, setPageHistory] = useState<(string | undefined)[]>([undefined]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [identityToDelete, setIdentityToDelete] = useState<Identity | null>(null);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [identityToRecover, setIdentityToRecover] = useState<Identity | null>(null);

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use search hook when there's a debounced search term, otherwise use regular pagination
  const isSearching = debouncedSearchTerm.trim().length > 0;

  const {
    data: regularData,
    isLoading: regularLoading,
    isError: regularError,
    error: regularErrorDetails,
    refetch: regularRefetch,
  } = useIdentities({
    pageSize,
    pageToken,
  });

  const { data: searchData, isLoading: searchLoading } = useIdentitiesSearch({
    pageSize,
    searchTerm: debouncedSearchTerm,
  });

  // Always use regular data for base identities, never show search loading
  const data = regularData;
  const isLoading = regularLoading;
  const isError = regularError;
  const error = regularErrorDetails;
  const refetch = regularRefetch;

  // Memoize base identities to avoid useMemo dependency issues
  const baseIdentities = React.useMemo(() => data?.identities || [], [data?.identities]);
  const hasMore = data?.hasMore || false;
  const nextPageToken = data?.nextPageToken;

  // Get search results if available (for background fetching)
  const searchResults = searchData?.identities || [];
  const searchComplete = !searchLoading && isSearching;

  // Apply instant client-side filtering while typing
  const clientFilteredIdentities = React.useMemo(() => {
    if (!searchTerm.trim()) return baseIdentities;

    const searchLower = searchTerm.toLowerCase();
    return baseIdentities.filter((identity: Identity) => {
      const traits = identity.traits as any;
      const email = String(traits?.email || '');
      const username = String(traits?.username || '');
      const firstName = String(traits?.first_name || traits?.firstName || '');
      const lastName = String(traits?.last_name || traits?.lastName || '');
      const name = String(traits?.name || '');
      const id = String(identity.id || '');

      return (
        id.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        username.toLowerCase().includes(searchLower) ||
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        name.toLowerCase().includes(searchLower)
      );
    });
  }, [baseIdentities, searchTerm]);

  // Use search results if search is complete and we have better results
  const shouldUseSearchResults = searchComplete && searchResults.length > clientFilteredIdentities.length;
  const displayedIdentities = shouldUseSearchResults ? searchResults : clientFilteredIdentities;
  const isUsingSearchResults = shouldUseSearchResults;

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 220,
      valueGetter: (_, row) => {
        const traits = row.traits as any;
        return traits?.email || 'N/A';
      },
    },
    {
      field: 'username',
      headerName: 'Username',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => {
        const traits = row.traits as any;
        return traits?.username || 'N/A';
      },
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span
            style={{
              color: params.value === 'active' ? 'green' : params.value === 'inactive' ? 'red' : 'orange',
            }}
          >
            {params.value}
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => {
        return new Date(value as string).toLocaleString();
      },
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => {
        return new Date(value as string).toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button variant="text" size="small" color="primary" onClick={() => handleViewDetails(params.row.id)}>
            View
          </Button>
          <Button variant="text" size="small" color="info" onClick={() => handleRecover(params.row.id)}>
            Recover
          </Button>
          <Button variant="text" size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const handleViewDetails = (id: string) => {
    router.push(`/identities/${id}`);
  };

  const handleDelete = (id: string) => {
    const identity = displayedIdentities.find((identity: Identity) => identity.id === id);
    if (identity) {
      setIdentityToDelete(identity);
      setDeleteDialogOpen(true);
    }
  };

  const handleRecover = (id: string) => {
    const identity = displayedIdentities.find((identity: Identity) => identity.id === id);
    if (identity) {
      setIdentityToRecover(identity);
      setRecoveryDialogOpen(true);
    }
  };

  const handleDeleteSuccess = () => {
    // Refresh the data after successful delete
    refetch();
    setIdentityToDelete(null);
  };

  const handleCreateNew = () => {
    router.push('/identities/create');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleNextPage = () => {
    // Disable pagination during search
    if (searchTerm.trim()) return;

    if (nextPageToken) {
      setPageHistory((prev) => [...prev, pageToken]);
      setPageToken(nextPageToken);
    }
  };

  const handlePreviousPage = () => {
    // Disable pagination during search
    if (searchTerm.trim()) return;

    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousToken = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setPageToken(previousToken);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageToken(undefined);
    setPageHistory([undefined]);
  };

  const canGoPrevious = !searchTerm.trim() && pageHistory.length > 1;
  const canGoNext = !searchTerm.trim() && hasMore;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <DottedLoader variant="page" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography color="error">Error loading identities: {(error as any)?.message || 'Unknown error'}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Identities
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p" sx={{ mb: 2 }}>
          Manage user identities in your Kratos instance.
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Search identities (ID, email, username, name)..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 350 }}
          helperText={
            searchTerm && searchLoading
              ? 'Finding more matches in background...'
              : searchTerm
                ? `Filtering ${baseIdentities.length} current page identities`
                : ''
          }
        />
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleCreateNew}>
            Create New
          </Button>
        </Box>
      </Box>

      <Box height={600} width="100%">
        <DataGrid
          rows={displayedIdentities}
          columns={columns}
          //checkboxSelection
          onRowSelectionModelChange={() => {
            // No row selection logic needed
          }}
          hideFooterPagination
          showToolbar
        />
      </Box>

      {/* Custom Pagination Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {searchTerm.trim()
              ? `Found ${displayedIdentities.length} matches${isUsingSearchResults ? ' (from multi-page search)' : ' (from current page)'}`
              : `Showing ${displayedIdentities.length} identities`}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per page</InputLabel>
            <Select value={pageSize} label="Per page" onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<NavigateBefore />} onClick={handlePreviousPage} disabled={!canGoPrevious || isLoading}>
            Previous
          </Button>
          <Button variant="outlined" size="small" endIcon={<NavigateNext />} onClick={handleNextPage} disabled={!canGoNext || isLoading}>
            Next
          </Button>
        </Box>
      </Box>

      {/* Recovery Dialog */}
      <IdentityRecoveryDialog
        open={recoveryDialogOpen}
        onClose={() => {
          setRecoveryDialogOpen(false);
          setIdentityToRecover(null);
        }}
        identity={identityToRecover}
      />

      {/* Delete Dialog */}
      <IdentityDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setIdentityToDelete(null);
        }}
        identity={identityToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </Paper>
  );
};

export default IdentitiesTable;
