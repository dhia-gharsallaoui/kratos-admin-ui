'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, IconButton, Tooltip, TextField, InputAdornment, Button } from '@mui/material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Search, Refresh, Close, ExpandMore } from '@mui/icons-material';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { useSessionsPaginated, useSessionsWithSearch } from '@/features/sessions/hooks/useSessions';
import { useStableSessions } from '@/features/sessions/hooks/useStableSessions';
import { SessionsTable } from '@/features/sessions/components/SessionsTable';

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const trimmedSearchQuery = debouncedSearchQuery;

  // Use infinite pagination when not searching
  const paginatedQuery = useSessionsPaginated({ pageSize: 250 });

  // Use search query when there's a search term
  const searchQuery_ = useSessionsWithSearch(trimmedSearchQuery);

  // Choose which query to use based on search state
  const isSearching = !!trimmedSearchQuery;
  const activeQuery = isSearching ? searchQuery_ : paginatedQuery;

  // Get sessions from the appropriate source
  const sessions = useMemo(() => {
    if (isSearching) {
      return searchQuery_.data?.pages.flatMap((page) => page.sessions) || [];
    }
    return paginatedQuery.data?.pages.flatMap((page) => page.sessions) || [];
  }, [isSearching, searchQuery_.data, paginatedQuery.data]);

  // Unified loading and error states
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;

  // Pagination-specific states - works for both modes now
  const fetchNextPage = isSearching ? searchQuery_.fetchNextPage : paginatedQuery.fetchNextPage;
  const hasNextPage = isSearching ? searchQuery_.hasNextPage : paginatedQuery.hasNextPage;
  const isFetchingNextPage = isSearching ? searchQuery_.isFetchingNextPage : paginatedQuery.isFetchingNextPage;

  // Refetch function that works for both modes
  const refetch = () => {
    if (isSearching) {
      searchQuery_.refetch();
    } else {
      paginatedQuery.refetch();
    }
  };

  // Helper to get identity display name - memoized for stability
  const getIdentityDisplay = useCallback((session: any) => {
    if (!session.identity) return 'Unknown';

    const traits = session.identity.traits;
    if (!traits) return session.identity.id;

    return traits.email || traits.username || session.identity.id;
  }, []);

  // Use the stable sessions hook for truly stable references
  const stableSessionsState = useStableSessions({
    sessions,
    searchQuery: trimmedSearchQuery,
    getIdentityDisplay,
  });

  const stableFilteredSessions = stableSessionsState.sessions;

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
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
                  },
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  All Sessions
                </Typography>
                <TextField
                  placeholder="Search sessions..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {isSearching && searchQuery_.isLoading ? <CircularProgress size={16} /> : <Search fontSize="small" />}
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

              {isError ? (
                <Box sx={{ p: 3 }}>
                  <Typography color="error">Error loading sessions: {error?.message || 'Please try again later.'}</Typography>
                </Box>
              ) : (
                <>
                  <SessionsTable
                    sessions={stableFilteredSessions}
                    isLoading={isLoading}
                    isFetchingNextPage={false} // Don't cause re-renders for fetching state
                    searchQuery={searchQuery}
                  />

                  {/* Loading/pagination controls for search mode */}
                  {isSearching && hasNextPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      {searchQuery_.isAutoSearching ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            Searching for more sessions...
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          onClick={() => searchQuery_.loadMoreMatches()}
                          variant="outlined"
                          startIcon={<ExpandMore />}
                          sx={{
                            borderRadius: 'var(--radius)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                            '&:hover': {
                              backgroundColor: 'var(--accent)',
                              borderColor: 'var(--accent)',
                            },
                          }}
                        >
                          Load More Matches
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Manual load more for browsing mode */}
                  {!isSearching && hasNextPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outlined"
                        startIcon={isFetchingNextPage ? <CircularProgress size={16} /> : <ExpandMore />}
                        sx={{
                          borderRadius: 'var(--radius)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                          '&:hover': {
                            backgroundColor: 'var(--accent)',
                            borderColor: 'var(--accent)',
                          },
                        }}
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load More Sessions'}
                      </Button>
                    </Box>
                  )}

                  {/* Sessions count info */}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {isSearching ? (
                        <>
                          Found {stableFilteredSessions.length} sessions matching &ldquo;{trimmedSearchQuery}&rdquo;
                          {(() => {
                            // Use the isAutoSearching state from the hook
                            if (searchQuery_.isAutoSearching) {
                              return ' (auto-searching...)';
                            }
                            // Regular search behavior
                            if (searchQuery_.isFetchingNextPage) {
                              return ' (searching...)';
                            }
                            if (hasNextPage) {
                              return ' (more available)';
                            }
                            return '';
                          })()}
                        </>
                      ) : (
                        <>
                          Showing {stableFilteredSessions.length} sessions
                          {hasNextPage && ' (more available)'}
                        </>
                      )}
                    </Typography>
                  </Box>
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
                About Sessions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This page shows all active sessions across all identities in the system. Sessions are automatically created when users authenticate
                and expire based on your Kratos configuration. Use this page to monitor user activity and troubleshoot authentication issues.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
