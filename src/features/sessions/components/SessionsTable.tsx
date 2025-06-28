import React, { useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Chip } from '@mui/material';
import { Person, AccessTime, Warning } from '@mui/icons-material';
import { SessionsLoadingSkeleton } from './SessionsLoadingSkeleton';

interface SessionsTableProps {
  sessions: any[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  searchQuery: string;
  onSessionClick?: (sessionId: string) => void;
}

// Internal helper functions that don't depend on props
const getIdentityDisplayInternal = (session: any): string => {
  if (!session.identity) return 'Unknown';
  const traits = session.identity.traits;
  if (!traits) return session.identity.id;
  return traits.email || traits.username || session.identity.id;
};

const getTimeRemainingInternal = (expiresAt: string): string | null => {
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

// Session row component with its own memoization
const SessionRow = React.memo(
  ({ session, onSessionClick }: { session: any; onSessionClick?: (sessionId: string) => void }) => {
    const timeRemaining = getTimeRemainingInternal(session.expires_at || '');
    const isExpiringSoon = timeRemaining && timeRemaining.includes('m remaining');

    return (
      <TableRow
        key={session.id}
        onClick={() => onSessionClick?.(session.id)}
        sx={{
          '&:hover': {
            backgroundColor: 'var(--table-row-hover)',
            cursor: onSessionClick ? 'pointer' : 'default',
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
          {session.id}
        </TableCell>
        <TableCell
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
          }}
        >
          {getIdentityDisplayInternal(session)}
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
              color: session.active ? 'white' : 'var(--muted-foreground)',
            }}
          />
        </TableCell>
        <TableCell>
          {session.authenticated_at ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">{new Date(session.authenticated_at).toLocaleString()}</Typography>
            </Box>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>
          {session.expires_at ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {isExpiringSoon && <Warning fontSize="small" color="warning" />}
              <Typography variant="body2" color={isExpiringSoon ? 'warning.main' : 'text.primary'} fontWeight={isExpiringSoon ? 500 : 400}>
                {timeRemaining}
              </Typography>
            </Box>
          ) : (
            'N/A'
          )}
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the session ID changed
    return prevProps.session.id === nextProps.session.id;
  }
);

SessionRow.displayName = 'SessionRow';

// Main table component with ultimate stability
const SessionsTableComponent = ({ sessions, isLoading, isFetchingNextPage, searchQuery, onSessionClick }: SessionsTableProps) => {
  // Use refs to maintain stable state
  const stableSessionsRef = useRef<any[]>([]);
  const lastSessionIdsRef = useRef<string>('');

  // Get current session IDs
  const currentSessionIds = sessions
    .map((s) => s.id)
    .sort()
    .join(',');

  // Only update stable sessions when IDs actually change
  if (currentSessionIds !== lastSessionIdsRef.current) {
    stableSessionsRef.current = sessions;
    lastSessionIdsRef.current = currentSessionIds;
  }

  const stableSessions = stableSessionsRef.current;

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
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
          {isLoading ? (
            <SessionsLoadingSkeleton rows={10} />
          ) : stableSessions.length === 0 ? (
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
                  <Person
                    sx={{
                      fontSize: 40,
                      color: 'var(--muted-foreground)',
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6">No active sessions found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Try a different search term' : 'Sessions will appear here when users log in'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            stableSessions.map((session) => <SessionRow key={session.id} session={session} onSessionClick={onSessionClick} />)
          )}
          {isFetchingNextPage && <SessionsLoadingSkeleton rows={5} />}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Custom comparison function
const arePropsEqual = (prevProps: SessionsTableProps, nextProps: SessionsTableProps) => {
  // Compare session IDs only
  const prevIds = prevProps.sessions
    .map((s) => s.id)
    .sort()
    .join(',');
  const nextIds = nextProps.sessions
    .map((s) => s.id)
    .sort()
    .join(',');

  const sessionsChanged = prevIds !== nextIds;
  const loadingChanged = prevProps.isLoading !== nextProps.isLoading;
  const fetchingChanged = prevProps.isFetchingNextPage !== nextProps.isFetchingNextPage;
  const searchChanged = prevProps.searchQuery !== nextProps.searchQuery;
  const clickHandlerChanged = prevProps.onSessionClick !== nextProps.onSessionClick;

  // Simple re-render logic:
  // - Re-render if sessions, loading, search, or click handler changed
  // - Ignore fetchingChanged when sessions are stable (let CSS handle loading state)
  const shouldRerender = sessionsChanged || loadingChanged || searchChanged || clickHandlerChanged;

  // Return true if props are equal (should NOT re-render)
  return !shouldRerender;
};

export const SessionsTable = React.memo(SessionsTableComponent, arePropsEqual);

SessionsTable.displayName = 'SessionsTable';
