'use client';

import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Typography, Paper, Grid, Chip, Card, CardContent, Divider, IconButton, Tooltip } from '@mui/material';
import { ArrowBack, Edit, Delete, Refresh, Link as LinkIcon } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '@/features/auth';
import { useIdentity } from '@/features/identities/hooks';
import { DottedLoader } from '@/components/ui/DottedLoader';
import { IdentityEditModal } from '@/features/identities/components/IdentityEditModal';
import { IdentityDeleteDialog } from '@/features/identities/components/IdentityDeleteDialog';
import { IdentityRecoveryDialog } from '@/features/identities/components/IdentityRecoveryDialog';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '@mui/material/styles';

// JSON syntax highlighting function
function syntaxHighlightJson(json: string) {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function(match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
}

export default function IdentityDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const identityId = params.id as string;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);

  const { data: identity, isLoading, isError, error, refetch } = useIdentity(identityId);

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
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
                    <Typography variant="body1">
                      {formatDate(identity.created_at || '')}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(identity.updated_at || '')}
                    </Typography>
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

            {/* Raw JSON */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Raw Data
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '60vh',
                    background: theme.palette.background.default,
                  }}>
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
          <IdentityEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            identity={identity}
            onSuccess={handleEditSuccess}
          />

          {/* Recovery Dialog */}
          <IdentityRecoveryDialog
            open={recoveryDialogOpen}
            onClose={() => setRecoveryDialogOpen(false)}
            identity={identity}
          />

          {/* Delete Dialog */}
          <IdentityDeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            identity={identity}
            onSuccess={handleDeleteSuccess}
          />
        </Box>
      </AdminLayout>
    </ProtectedRoute>
  );
}
