import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Close, Person, Security, Devices, ExpandMore, Delete, Update, Info } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession, disableSession, extendSession } from '../../../services/kratos/endpoints/sessions';

interface SessionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onSessionUpdated?: () => void;
}

export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({ open, onClose, sessionId, onSessionUpdated }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch detailed session information
  const {
    data: sessionData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId, ['identity', 'devices']),
    enabled: open && !!sessionId,
    retry: 2,
  });

  const session = sessionData?.data;

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: () => disableSession(sessionId),
    onSuccess: () => {
      // Call the parent refetch function directly
      onSessionUpdated?.();
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error?.message || 'Failed to revoke session');
    },
    onSettled: () => {
      setActionLoading(null);
    },
  });

  // Extend session mutation
  const extendMutation = useMutation({
    mutationFn: () => extendSession(sessionId),
    onSuccess: () => {
      // Invalidate current session details and call parent refetch
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      onSessionUpdated?.();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error?.message || 'Failed to extend session');
    },
    onSettled: () => {
      setActionLoading(null);
    },
  });

  const handleRevokeSession = () => {
    setActionLoading('delete');
    setError(null);
    deleteMutation.mutate();
  };

  const handleExtendSession = () => {
    setActionLoading('extend');
    setError(null);
    extendMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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

  const getIdentityDisplay = (identity: any) => {
    if (!identity) return 'Unknown';
    const traits = identity.traits;
    if (!traits) return identity.id;
    return traits.email || traits.username || identity.id;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (fetchError || !session) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Session Details</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">Failed to load session details: {fetchError?.message || 'Unknown error'}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const timeRemaining = session.expires_at ? getTimeRemaining(session.expires_at) : null;
  const isExpired = timeRemaining === 'Expired';
  const isExpiringSoon = timeRemaining && timeRemaining.includes('m remaining');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Session Details</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Session Info */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Info color="primary" />
                  <Typography variant="h6">Basic Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Session ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                      {session.id}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip label={session.active ? 'Active' : 'Inactive'} color={session.active ? 'success' : 'default'} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Authenticated At
                    </Typography>
                    <Typography variant="body2">{session.authenticated_at ? formatDate(session.authenticated_at) : 'N/A'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Issued At
                    </Typography>
                    <Typography variant="body2">{session.issued_at ? formatDate(session.issued_at) : 'N/A'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expires At
                    </Typography>
                    <Typography variant="body2" color={isExpired ? 'error.main' : isExpiringSoon ? 'warning.main' : 'text.primary'}>
                      {session.expires_at ? formatDate(session.expires_at) : 'N/A'}
                    </Typography>
                    {timeRemaining && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {timeRemaining}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assurance Level
                    </Typography>
                    <Typography variant="body2">{session.authenticator_assurance_level || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Identity Information */}
          {session.identity && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Person color="primary" />
                    <Typography variant="h6">Identity Information</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Identity ID
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                        {session.identity.id}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Display Name
                      </Typography>
                      <Typography variant="body2">{getIdentityDisplay(session.identity)}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        State
                      </Typography>
                      <Chip label={session.identity.state} size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Schema ID
                      </Typography>
                      <Typography variant="body2">{session.identity.schema_id || 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  {session.identity.traits && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">Identity Traits</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(session.identity.traits, null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Authentication Methods */}
          {session.authentication_methods && session.authentication_methods.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Security color="primary" />
                    <Typography variant="h6">Authentication Methods</Typography>
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">{session.authentication_methods.length} method(s) used</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(session.authentication_methods, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Devices */}
          {session.devices && session.devices.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Devices color="primary" />
                    <Typography variant="h6">Devices</Typography>
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">{session.devices.length} device(s) registered</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(session.devices, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>

        {session.active && !isExpired && (
          <Button
            onClick={handleExtendSession}
            disabled={actionLoading === 'extend'}
            startIcon={actionLoading === 'extend' ? <CircularProgress size={16} /> : <Update />}
            variant="outlined"
          >
            Extend Session
          </Button>
        )}

        <Button
          onClick={handleRevokeSession}
          disabled={actionLoading === 'delete'}
          startIcon={actionLoading === 'delete' ? <CircularProgress size={16} /> : <Delete />}
          color="error"
          variant="contained"
        >
          Revoke Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};
