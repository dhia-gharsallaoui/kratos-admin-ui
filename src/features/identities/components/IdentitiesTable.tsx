import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Typography, CircularProgress, TextField, InputAdornment, IconButton, Tooltip, Paper, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, Search, Refresh, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useIdentities, useIdentitiesSearch } from '@/hooks/useKratos';
import { Identity } from '@ory/kratos-client';
import { useRouter } from 'next/navigation';

const IdentitiesTable: React.FC = () => {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [pageHistory, setPageHistory] = useState<(string | undefined)[]>([undefined]);
  
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
    refetch: regularRefetch 
  } = useIdentities({
    pageSize,
    pageToken,
  });
  
  const { 
    data: searchData, 
    isLoading: searchLoading, 
    isError: searchError, 
    error: searchErrorDetails, 
    refetch: searchRefetch 
  } = useIdentitiesSearch({
    pageSize,
    searchTerm: debouncedSearchTerm,
  });
  
  // Always use regular data for base identities, never show search loading
  const data = regularData;
  const isLoading = regularLoading;
  const isError = regularError;
  const error = regularErrorDetails;
  const refetch = regularRefetch;

  const baseIdentities = data?.identities || [];
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
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value.substring(0, 8)}...</span>
        </Tooltip>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 250,
      valueGetter: (params) => {
        const traits = (params.row.traits as any);
        return traits?.email || 'N/A';
      }
    },
    { 
      field: 'username', 
      headerName: 'Username', 
      width: 150,
      valueGetter: (params) => {
        const traits = (params.row.traits as any);
        return traits?.username || 'N/A';
      }
    },
    { 
      field: 'state', 
      headerName: 'State', 
      width: 120,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span style={{ 
            color: params.value === 'active' ? 'green' : 
                  params.value === 'inactive' ? 'red' : 'orange'
          }}>
            {params.value}
          </span>
        </Tooltip>
      )
    },
    { 
      field: 'created_at', 
      headerName: 'Created', 
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value as string).toLocaleString();
      }
    },
    { 
      field: 'updated_at', 
      headerName: 'Updated', 
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value as string).toLocaleString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Button 
            variant="text" 
            size="small" 
            color="primary"
            onClick={() => handleViewDetails(params.row.id)}
          >
            View
          </Button>
          <Button 
            variant="text" 
            size="small" 
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
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
    console.log('Delete identity:', id);
    // Implement delete confirmation dialog and API call
  };

  const handleCreateNew = () => {
    console.log('Create new identity');
    // Implement navigation to create identity page
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleNextPage = () => {
    // Disable pagination during search
    if (searchTerm.trim()) return;
    
    if (nextPageToken) {
      setPageHistory(prev => [...prev, pageToken]);
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
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography color="error">
          Error loading identities: {(error as any)?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Identities
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 350 }}
          helperText={
            searchTerm && searchLoading ? "Finding more matches in background..." :
            searchTerm ? `Filtering ${baseIdentities.length} current page identities` : ""
          }
        />
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleCreateNew}
          >
            Create New
          </Button>
        </Box>
      </Box>

      <Box height={600} width="100%">
        <DataGrid
          rows={displayedIdentities}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection as string[]);
          }}
          hideFooterPagination
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>

      {/* Custom Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {searchTerm.trim()
              ? `Found ${displayedIdentities.length} matches${isUsingSearchResults ? ' (from multi-page search)' : ' (from current page)'}`
              : `Showing ${displayedIdentities.length} identities`
            }
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pageSize}
              label="Per page"
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<NavigateBefore />}
            onClick={handlePreviousPage}
            disabled={!canGoPrevious || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<NavigateNext />}
            onClick={handleNextPage}
            disabled={!canGoNext || isLoading}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default IdentitiesTable;
