import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const data = regularData;
  const isLoading = regularLoading;
  const isError = regularError;
  const error = regularErrorDetails;
  const refetch = regularRefetch;

  const baseIdentities = useMemo(() => data?.identities || [], [data?.identities]);
  const hasMore = data?.hasMore || false;
  const nextPageToken = data?.nextPageToken;
  const searchResults = searchData?.identities || [];
  const searchComplete = !searchLoading && isSearching;

  // Helper functions
  const getSchemaName = React.useCallback(
    (identity: Identity) => {
      const schema = schemas?.find((s) => s.id === identity.schema_id);
      const schemaObj = schema?.schema as any;
      return schemaObj?.title || `Schema ${identity.schema_id?.substring(0, 8)}...` || 'Unknown';
    },
    [schemas]
  );

  const getIdentifier = React.useCallback(
    (identity: Identity) => {
      const traits = identity.traits as any;
      const schema = schemas?.find((s) => s.id === identity.schema_id);
      const schemaObj = schema?.schema as any;

      if (!schemaObj?.properties?.traits?.properties) {
        return traits?.email || traits?.username || traits?.phone || 'N/A';
      }

      const traitProperties = schemaObj.properties.traits.properties;
      const identifierFields: string[] = [];

      Object.keys(traitProperties).forEach((fieldName) => {
        const field = traitProperties[fieldName];
        const kratosConfig = field?.['ory.sh/kratos'];

        if (kratosConfig?.credentials) {
          const credentialTypes = Object.keys(kratosConfig.credentials);
          const hasIdentifier = credentialTypes.some((credType) => kratosConfig.credentials[credType]?.identifier === true);

          if (hasIdentifier) {
            identifierFields.push(fieldName);
          }
        }
      });

      for (const fieldName of identifierFields) {
        const value = traits?.[fieldName];
        if (value) {
          return String(value);
        }
      }

      return traits?.email || traits?.username || traits?.phone || 'N/A';
    },
    [schemas]
  );

  // Apply client-side filtering
  const clientFilteredIdentities = useMemo(() => {
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

  const shouldUseSearchResults = searchComplete && searchResults.length > clientFilteredIdentities.length;
  const displayedIdentities = shouldUseSearchResults ? searchResults : clientFilteredIdentities;

  // Define columns
  const columns: DataTableColumn[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 180,
      maxWidth: 200,
      renderCell: (value: string) => (
        <Tooltip title={value}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value.substring(0, 8)}...
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'identifier',
      headerName: 'Identifier',
      minWidth: 220,
      renderCell: (_: any, identity: Identity) => (
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {getIdentifier(identity)}
        </Typography>
      ),
    },
    {
      field: 'schema_id',
      headerName: 'Schema',
      minWidth: 140,
      renderCell: (_: any, identity: Identity) => (
        <Chip
          label={getSchemaName(identity)}
          size="small"
          color="primary"
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      minWidth: 100,
      renderCell: (value: string) => (
        <Chip
          label={value === 'active' ? 'Active' : 'Inactive'}
          color={value === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      minWidth: 180,
      renderCell: (value: string) => (
        <Typography variant="body2">{formatDate(value)}</Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      minWidth: 180,
      renderCell: (value: string) => (
        <Typography variant="body2">{formatDate(value)}</Typography>
      ),
    },
  ], [getSchemaName, getIdentifier]);

  const handleRowClick = (row: any) => {
    router.push(`/identities/${row.id}`);
  };

  const handleCreateNew = () => {
    router.push('/identities/create');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (isLoading && !baseIdentities.length) {
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
    <Box>
      <Box mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          fontWeight={600}
        >
          Identities
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user identities in your Kratos instance.
        </Typography>
      </Box>

      <DataTable
        data={displayedIdentities}
        columns={columns}
        keyField="id"
        loading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search identities (ID, identifier, schema, name)..."
        onRowClick={handleRowClick}
        onRefresh={handleRefresh}
        onAdd={handleCreateNew}
        addButtonText="Create New"
        emptyMessage="No identities found"
        maxHeight={600}
      />

      {/* Pagination info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {searchTerm.trim()
            ? `Found ${displayedIdentities.length} matches${shouldUseSearchResults ? ' (from multi-page search)' : ' (from current page)'}`
            : `Showing ${displayedIdentities.length} identities${hasMore ? ' (more available)' : ''}`}
        </Typography>
      </Box>
    </Box>
  );
});

IdentitiesTable.displayName = 'IdentitiesTable';

export default IdentitiesTable;
