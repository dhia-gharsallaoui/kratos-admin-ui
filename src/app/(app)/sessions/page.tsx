'use client';

import { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Card, CardContent, IconButton, Tooltip, TextField, InputAdornment, Paper } from '@mui/material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { listSessions } from '@/services/kratos';
import { Search, Refresh, Close, Person, AccessTime, Warning } from '@mui/icons-material';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';

// Define interfaces for type safety
interface Session {
  id: string;
  active: boolean;
  authenticated_at: string;
  expires_at: string;
  identity: {
    id: string;
    traits?: {
      email?: string;
      username?: string;
      [key: string]: any;
    };
  };
  issued_at: string;
}

export default function SessionsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all sessions directly using the listSessions method
  const { data: sessionsData, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const response = await listSessions();
        return response.data;
      } catch (err) {
        console.error('Error fetching sessions:', err);
        throw err;
      }
    },
  });

  const sessions = sessionsData || [];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Helper to get identity display name
  const getIdentityDisplay = (session: any) => {
    if (!session.identity) return 'Unknown';
    
    const traits = session.identity.traits;
    if (!traits) return session.identity.id;
    
    return traits.email || traits.username || session.identity.id;
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    const identityDisplay = getIdentityDisplay(session).toLowerCase();
    const id = session.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return identityDisplay.includes(query) || id.includes(query);
  });

  // Calculate time remaining for session
  const getTimeRemaining = (expiresAt: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Active Sessions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor and manage user sessions across your system
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={() => refetch()} 
                sx={{ 
                  borderRadius: 'var(--radius)',
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  '&:hover': {
                    background: 'var(--accent)',
                    opacity: 0.9,
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Card 
            elevation={0} 
            sx={{ 
              mb: 4, 
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  All Sessions
                </Typography>
                <TextField
                  placeholder="Search sessions..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
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
                    }
                  }}
                  sx={{ width: { xs: '100%', sm: '300px' } }}
                />
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Typography color="error">Error loading sessions. Please try again later.</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)'
                  }}>
                    <Table sx={{ minWidth: 650 }} aria-label="sessions table">
                      <TableHead sx={{ backgroundColor: 'var(--table-header)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Session ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Identity</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Authenticated At</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ fontSize: 40, color: 'var(--muted-foreground)', opacity: 0.5 }} />
                                <Typography variant="h6">No active sessions found</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {searchQuery ? 'Try a different search term' : 'Sessions will appear here when users log in'}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSessions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((session) => {
                              const timeRemaining = getTimeRemaining(session.expires_at || '');
                              const isExpiringSoon = timeRemaining && timeRemaining.includes('m remaining');
                              
                              return (
                                <TableRow 
                                  key={session.id}
                                  sx={{ 
                                    '&:hover': { 
                                      backgroundColor: 'var(--table-row-hover)' 
                                    },
                                    borderBottom: '1px solid var(--table-border)'
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
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {session.id}
                                  </TableCell>
                                  <TableCell 
                                    sx={{ 
                                      maxWidth: 200, 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis',
                                      fontWeight: 500
                                    }}
                                  >
                                    {getIdentityDisplay(session)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={session.active ? 'Active' : 'Inactive'} 
                                      color={session.active ? 'success' : 'default'} 
                                      size="small" 
                                      sx={{ 
                                        borderRadius: 'var(--radius)',
                                        fontWeight: 500,
                                        background: session.active ? '#10b981' : 'var(--muted)',
                                        color: session.active ? 'white' : 'var(--muted-foreground)'
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {session.authenticated_at ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTime fontSize="small" color="action" />
                                        <Typography variant="body2">
                                          {new Date(session.authenticated_at).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    ) : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {session.expires_at ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {isExpiringSoon && <Warning fontSize="small" color="warning" />}
                                        <Typography 
                                          variant="body2"
                                          color={isExpiringSoon ? 'warning.main' : 'text.primary'}
                                          fontWeight={isExpiringSoon ? 500 : 400}
                                        >
                                          {timeRemaining}
                                        </Typography>
                                      </Box>
                                    ) : 'N/A'}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSessions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        margin: 0,
                      }
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>About Sessions</Typography>
              <Typography variant="body2" color="text.secondary">
                This page shows all active sessions across all identities in the system. Sessions are automatically created when users authenticate and expire based on your Kratos configuration. Use this page to monitor user activity and troubleshoot authentication issues.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
