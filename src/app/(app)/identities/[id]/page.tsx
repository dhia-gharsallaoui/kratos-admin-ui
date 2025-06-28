'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Refresh, Link as LinkIcon, DeleteSweep, Person } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { useIdentity } from '@/features/identities/hooks';
import { DottedLoader } from '@/components/ui/DottedLoader';
import { IdentityEditModal } from '@/features/identities/components/IdentityEditModal';
import { IdentityDeleteDialog } from '@/features/identities/components/IdentityDeleteDialog';
import { IdentityRecoveryDialog } from '@/features/identities/components/IdentityRecoveryDialog';
import { SessionsTable } from '@/features/sessions/components/SessionsTable';
import { SessionDetailDialog } from '@/features/sessions/components/SessionDetailDialog';
import { useIdentitySessions, useDeleteIdentitySessions } from '@/features/sessions/hooks';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '@mui/material/styles';

export default function IdentityDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const identityId = params.id as string;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [deleteSessionsDialogOpen, setDeleteSessionsDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: identity, isLoading, isError, error: _, refetch } = useIdentity(identityId);

  // Sessions hooks
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useIdentitySessions(identityId);
  const deleteSessionsMutation = useDeleteIdentitySessions();

  const handleBack = () => {
    router.push('/identities');
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch(); // Refresh identity data after successful edit
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    // Navigate back to identities list after successful delete
    router.push('/identities');
  };

  const handleRecover = () => {
    setRecoveryDialogOpen(true);
  };

  const handleDeleteAllSessions = () => {
    setDeleteSessionsDialogOpen(true);
  };

  const handleDeleteAllSessionsConfirm = () => {
    deleteSessionsMutation.mutate(identityId, {
      onSuccess: () => {
        setDeleteSessionsDialogOpen(false);
      },
    });
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleSessionDialogClose = () => {
    setSelectedSessionId(null);
  };

  const handleSessionUpdated = () => {
    refetchSessions();
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <AdminLayout>
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <DottedLoader variant="page" />
          </Box>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (isError || !identity) {
    return (
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <AdminLayout>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Identity Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              The identity with ID &quot;{identityId}&quot; could not be found.
            </Typography>
            <Button variant="contained" onClick={handleBack}>
              Back to Identities
            </Button>
          </Box>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const traits = identity.traits as any;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBack}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Identity Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {identityId}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="outlined" color="info" startIcon={<LinkIcon />} onClick={handleRecover}>
                Recover
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={identity.state || 'active'}
                      color={identity.state === 'active' ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Schema ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {identity.schema_id}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">{formatDate(identity.created_at || '')}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body1">{formatDate(identity.updated_at || '')}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Traits */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Traits
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {traits && Object.keys(traits).length > 0 ? (
                    Object.entries(traits).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No traits available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sessions Section */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" />
                      <Typography variant="h6">Sessions</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Refresh Sessions">
                        <IconButton onClick={() => refetchSessions()} size="small">
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteSweep />}
                        onClick={handleDeleteAllSessions}
                        disabled={deleteSessionsMutation.isPending || sessionsLoading || !sessionsData?.data?.length}
                      >
                        Delete All Sessions
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {sessionsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Failed to load sessions: {sessionsError.message}
                    </Alert>
                  ) : sessionsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <DottedLoader />
                    </Box>
                  ) : !sessionsData?.data?.length ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No active sessions found for this identity
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <SessionsTable
                        key={sessionsData.headers?.etag || 'identity-sessions'} // Force re-render when data updates
                        sessions={sessionsData.data}
                        isLoading={false}
                        isFetchingNextPage={false}
                        searchQuery=""
                        onSessionClick={handleSessionClick}
                      />
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Showing {sessionsData.data.length} session(s) for this identity
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Raw JSON */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Raw Data
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                      {JSON.stringify(identity, null, 2)}
                    </SyntaxHighlighter>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Edit Modal */}
          <IdentityEditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} identity={identity} onSuccess={handleEditSuccess} />

          {/* Recovery Dialog */}
          <IdentityRecoveryDialog open={recoveryDialogOpen} onClose={() => setRecoveryDialogOpen(false)} identity={identity} />

          {/* Delete Dialog */}
          <IdentityDeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            identity={identity}
            onSuccess={handleDeleteSuccess}
          />

          {/* Delete All Sessions Dialog */}
          <Dialog open={deleteSessionsDialogOpen} onClose={() => setDeleteSessionsDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Delete All Sessions</DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action will revoke all active sessions for this identity. The user will be logged out from all devices.
              </Alert>
              <Typography variant="body2">Are you sure you want to delete all sessions for this identity? This action cannot be undone.</Typography>
              {deleteSessionsMutation.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to delete sessions: {deleteSessionsMutation.error.message}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteSessionsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteAllSessionsConfirm} color="error" variant="contained" disabled={deleteSessionsMutation.isPending}>
                {deleteSessionsMutation.isPending ? 'Deleting...' : 'Delete All Sessions'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Session Detail Dialog */}
          {selectedSessionId && (
            <SessionDetailDialog
              open={true}
              onClose={handleSessionDialogClose}
              sessionId={selectedSessionId}
              onSessionUpdated={handleSessionUpdated}
            />
          )}
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
