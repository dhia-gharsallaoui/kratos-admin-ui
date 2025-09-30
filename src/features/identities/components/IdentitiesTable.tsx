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
  Chip,
} from '@mui/material';
import { Add, Search, Refresh, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useIdentities, useIdentitiesSearch } from '@/features/identities/hooks';
import { useSchemas } from '@/features/schemas/hooks';
import { Identity } from '@ory/kratos-client';
import { useRouter } from 'next/navigation';
import { DottedLoader } from '@/components/ui/DottedLoader';
import { formatDate } from '@/lib/date-utils';

const IdentitiesTable: React.FC = React.memo(() => {
  const router = useRouter();
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
    refetch: regularRefetch,
  } = useIdentities({
    pageSize,
    pageToken,
  });

  const { data: searchData, isLoading: searchLoading } = useIdentitiesSearch({
    pageSize,
    searchTerm: debouncedSearchTerm,
  });

  const { data: schemas } = useSchemas();

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

  // Helper function to get schema name
  const getSchemaName = React.useCallback(
    (identity: Identity) => {
      const schema = schemas?.find((s) => s.id === identity.schema_id);
      const schemaObj = schema?.schema as any;
      return schemaObj?.title || `Schema ${identity.schema_id?.substring(0, 8)}...` || 'Unknown';
    },
    [schemas]
  );

  // Helper function to get identifier from identity based on schema
  const getIdentifier = React.useCallback(
    (identity: Identity) => {
      const traits = identity.traits as any;
      const schema = schemas?.find((s) => s.id === identity.schema_id);
      const schemaObj = schema?.schema as any;

      if (!schemaObj?.properties?.traits?.properties) {
        // Fallback if schema not available
        return traits?.email || traits?.username || traits?.phone || 'N/A';
      }

      const traitProperties = schemaObj.properties.traits.properties;
      const identifierFields: string[] = [];

      // Extract fields that are marked as identifiers in the schema
      Object.keys(traitProperties).forEach((fieldName) => {
        const field = traitProperties[fieldName];
        const kratosConfig = field?.['ory.sh/kratos'];

        if (kratosConfig?.credentials) {
          // Check if any credential type has identifier: true
          const credentialTypes = Object.keys(kratosConfig.credentials);
          const hasIdentifier = credentialTypes.some((credType) => kratosConfig.credentials[credType]?.identifier === true);

          if (hasIdentifier) {
            identifierFields.push(fieldName);
          }
        }
      });

      // Get the first non-null identifier value from the identity traits
      for (const fieldName of identifierFields) {
        const value = traits?.[fieldName];
        if (value) {
          return String(value);
        }
      }

      // Fallback if no schema-defined identifiers found
      return traits?.email || traits?.username || traits?.phone || 'N/A';
    },
    [schemas]
  );

  // Apply instant client-side filtering while typing
  const clientFilteredIdentities = React.useMemo(() => {
    if (!searchTerm.trim()) return baseIdentities;

    const searchLower = searchTerm.toLowerCase();
    return baseIdentities.filter((identity: Identity) => {
      const traits = identity.traits as any;
      const email = String(traits?.email || '');
      const firstName = String(traits?.first_name || traits?.firstName || '');
      const lastName = String(traits?.last_name || traits?.lastName || '');
      const name = String(traits?.name || '');
      const id = String(identity.id || '');
      const schemaName = getSchemaName(identity);
      const identifier = getIdentifier(identity);

      return (
        id.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        name.toLowerCase().includes(searchLower) ||
        schemaName.toLowerCase().includes(searchLower) ||
        identifier.toLowerCase().includes(searchLower)
      );
    });
  }, [baseIdentities, searchTerm, getSchemaName, getIdentifier]);

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
      field: 'identifier',
      headerName: 'Identifier',
      flex: 1.5,
      minWidth: 220,
      valueGetter: (_, row) => {
        return getIdentifier(row);
      },
    },
    {
      field: 'schema_name',
      headerName: 'Schema',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const schemaName = getSchemaName(params.row);
        return (
          <Chip
            label={schemaName}
            size="small"
            sx={{
              borderRadius: 'var(--radius)',
              fontWeight: 500,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? 'Active' : 'Inactive'}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
          sx={{
            borderRadius: 'var(--radius)',
            fontWeight: 500,
            background: params.value === 'active' ? '#10b981' : 'var(--muted)',
            color: params.value === 'active' ? 'white' : 'var(--muted-foreground)',
          }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => {
        return formatDate(value as string);
      },
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => {
        return formatDate(value as string);
      },
    },
  ];

  const handleRowClick = (params: any) => {
    router.push(`/identities/${params.row.id}`);
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
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Box mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Identities
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p" sx={{ mb: 2 }}>
          Manage user identities in your Kratos instance.
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Search identities (ID, identifier, schema, name)..."
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
            <IconButton 
              onClick={handleRefresh} 
              sx={{ 
                mr: 1,
                background: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Refresh sx={{ color: '#667eea' }} />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleCreateNew}
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
            Create New
          </Button>
        </Box>
      </Box>

      <Box height={600} width="100%">
        <DataGrid
          rows={displayedIdentities}
          columns={columns}
          onRowClick={handleRowClick}
          hideFooterPagination
          showToolbar
          sx={{
            border: '1px solid rgba(102, 126, 234, 0.1)',
            borderRadius: 2,
            '& .MuiDataGrid-columnHeaders': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                transform: 'scale(1.001)',
              },
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
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
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<NavigateBefore />} 
            onClick={handlePreviousPage} 
            disabled={!canGoPrevious || isLoading}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#764ba2',
                background: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateX(-2px)',
              },
              '&:disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            Previous
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<NavigateNext />} 
            onClick={handleNextPage} 
            disabled={!canGoNext || isLoading}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#764ba2',
                background: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateX(2px)',
              },
              '&:disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Paper>
  );
});

IdentitiesTable.displayName = 'IdentitiesTable';

export default IdentitiesTable;
