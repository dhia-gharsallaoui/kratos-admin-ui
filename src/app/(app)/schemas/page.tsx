'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { getIdentitySchema } from '@/services/kratos';
import { useSchemas } from '@/features/schemas/hooks';
import { Code, Description, Search, Refresh, MoreVert, Close } from '@mui/icons-material';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '@mui/material/styles';

// Define the schema interface based on the provided example
interface SchemaItem {
  id: string;
  schema: {
    $id?: string;
    title?: string;
    type?: string;
    properties?: any;
    // Add other properties as needed
  };
}

export default function SchemasPage() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  const [schemaContent, setSchemaContent] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [parsedSchemas, setParsedSchemas] = useState<SchemaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: schemasResponse, isLoading, error, refetch } = useSchemas();

  // Use useEffect to parse the schemas when the response changes
  useEffect(() => {
    if (schemasResponse) {
      // Check if the response has a json property
      if ((schemasResponse as any).json && Array.isArray((schemasResponse as any).json)) {
        setParsedSchemas((schemasResponse as any).json);
      } else {
        // If not, try to use the response directly if it's an array
        const mapped = Array.isArray(schemasResponse)
          ? schemasResponse.map((schema) => ({
              id: schema.id || '',
              schema: schema.schema || {},
            }))
          : [];
        setParsedSchemas(mapped);
      }
    }
  }, [schemasResponse]);

  // Use inert attribute to properly hide background content when dialog is open
  useEffect(() => {
    // Target the main layout container, not the dialog
    const layoutContainer = document.querySelector('main');
    const appBar = document.querySelector('header');
    const drawer = document.querySelector('.MuiDrawer-root');
    
    if (schemaDialogOpen) {
      if (layoutContainer) layoutContainer.setAttribute('inert', '');
      if (appBar) appBar.setAttribute('inert', '');
      if (drawer) drawer.setAttribute('inert', '');
    } else {
      if (layoutContainer) layoutContainer.removeAttribute('inert');
      if (appBar) appBar.removeAttribute('inert');
      if (drawer) drawer.removeAttribute('inert');
    }
    
    return () => {
      if (layoutContainer) layoutContainer.removeAttribute('inert');
      if (appBar) appBar.removeAttribute('inert');
      if (drawer) drawer.removeAttribute('inert');
    };
  }, [schemaDialogOpen]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewSchema = async (id: string) => {
    setSelectedSchemaId(id);
    setSchemaLoading(true);
    setSchemaDialogOpen(true);

    try {
      // First try to find the schema in the already loaded data
      const existingSchema = parsedSchemas.find((schema) => schema.id === id);

      if (existingSchema) {
        setSchemaContent(existingSchema.schema);
        setSchemaLoading(false);
        return;
      }

      // If not found, fetch it from the API
      const response = await getIdentitySchema({ id });
      setSchemaContent(response.data);
    } catch (err) {
      console.error('Error fetching schema:', err);
      setSchemaContent(null);
    } finally {
      setSchemaLoading(false);
    }
  };

  const handleCloseSchemaDialog = () => {
    setSchemaDialogOpen(false);
    setSelectedSchemaId(null);
    setSchemaContent(null);
  };

  // Extract schema title or use ID if title is not available
  const getSchemaTitle = (schema: SchemaItem) => {
    return schema.schema.title || 'Unnamed Schema';
  };

  // Get schema properties count
  const getPropertiesCount = (schema: SchemaItem) => {
    const traits = schema.schema.properties?.traits?.properties;
    return traits ? Object.keys(traits).length : 0;
  };

  // Filter schemas based on search query
  const filteredSchemas = parsedSchemas.filter((schema) => {
    const title = getSchemaTitle(schema).toLowerCase();
    const id = schema.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || id.includes(query);
  });

  return (
    <ProtectedRoute requiredRole={UserRole.VIEWER}>
      <AdminLayout>
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Identity Schemas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and inspect your identity schemas and their properties
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                variant="action"
                onClick={() => refetch()}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          <Card
            elevation={0}
            sx={{
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  All Schemas
                </Typography>
                <TextField
                  placeholder="Search schemas..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                      sx: {
                        borderRadius: 'var(--radius)',
                      },
                    },
                  }}
                  sx={{ width: { xs: '100%', sm: '300px' } }}
                />
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <ErrorDisplay
                  variant="card"
                  title="Failed to Load Schemas"
                  message="Unable to fetch identity schemas. Please check your connection and try again."
                  onRetry={refetch}
                />
              ) : (
                <>
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Table sx={{ minWidth: 650 }} aria-label="schemas table">
                      <TableHead sx={{ backgroundColor: 'var(--table-header)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Properties</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSchemas.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Description
                                  sx={{
                                    fontSize: 40,
                                    color: 'var(--muted-foreground)',
                                    opacity: 0.5,
                                  }}
                                />
                                <Typography variant="h6">No schemas found</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {searchQuery ? 'Try a different search term' : 'No schemas are currently configured'}
                                </Typography>
                              </Box>
                              {schemasResponse && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption">Debug: Raw Response</Typography>
                                  <pre
                                    style={{
                                      fontSize: '0.7rem',
                                      maxHeight: '100px',
                                      overflow: 'auto',
                                    }}
                                  >
                                    {JSON.stringify(schemasResponse, null, 2)}
                                  </pre>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSchemas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schema) => (
                            <TableRow
                              key={schema.id}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'var(--table-row-hover)',
                                },
                                borderBottom: '1px solid var(--table-border)',
                              }}
                            >
                              <TableCell
                                component="th"
                                scope="row"
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {schema.id}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{getSchemaTitle(schema)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={schema.schema.type || 'unknown'}
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                  sx={{
                                    borderRadius: 'var(--radius)',
                                    fontWeight: 500,
                                    background: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={`${getPropertiesCount(schema)} trait(s)`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 'var(--radius)',
                                    fontWeight: 500,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Code />}
                                  onClick={() => handleViewSchema(schema.id)}
                                  sx={{
                                    mr: 1,
                                    borderRadius: 'var(--radius)',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  View Schema
                                </Button>
                                <IconButton size="small">
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSchemas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        margin: 0,
                      },
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                About Identity Schemas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Identity schemas define the structure of identity data in Ory Kratos. They determine what fields are available for registration,
                login, and profile management. Use schemas to customize the user experience and data collection for your application.
              </Typography>
            </CardContent>
          </Card>

          {/* Schema Dialog */}
          <Dialog
            open={schemaDialogOpen}
            onClose={handleCloseSchemaDialog}
            aria-labelledby="schema-dialog-title"
            maxWidth="md"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 'var(--radius)',
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                },
              },
            }}
          >
            <DialogTitle
              id="schema-dialog-title"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                px: 3,
                py: 2,
              }}
            >
              <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                Schema Details{' '}
                {selectedSchemaId && (
                  <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    (ID: {selectedSchemaId})
                  </Typography>
                )}
              </Typography>
              <IconButton onClick={handleCloseSchemaDialog} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {schemaLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : schemaContent ? (
                <Box
                  sx={{
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '60vh',
                    background: theme.palette.background.default,
                  }}
                >
                  <SyntaxHighlighter
                    language="json"
                    style={theme.palette.mode === 'dark' ? vs2015 : github}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      borderRadius: 'var(--radius)',
                      lineHeight: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{
                      color: theme.palette.text.secondary,
                      paddingRight: '1rem',
                      minWidth: '2rem',
                      userSelect: 'none',
                    }}
                    wrapLongLines={true}
                  >
                    {JSON.stringify(schemaContent, null, 2)}
                  </SyntaxHighlighter>
                </Box>
              ) : (
                <Typography color="error" sx={{ p: 3 }}>
                  Failed to load schema content. Please try again.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid var(--border)' }}>
              <Button
                onClick={handleCloseSchemaDialog}
                variant="outlined"
                sx={{
                  borderRadius: 'var(--radius)',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
