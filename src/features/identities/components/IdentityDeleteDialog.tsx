import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, Chip } from '@mui/material';
import { Identity } from '@ory/kratos-client';
import { useDeleteIdentity } from '../hooks/useIdentities';
import { DottedLoader } from '@/components/ui/DottedLoader';

interface IdentityDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  identity: Identity | null;
  onSuccess?: () => void;
}

export const IdentityDeleteDialog: React.FC<IdentityDeleteDialogProps> = ({ open, onClose, identity, onSuccess }) => {
  const deleteIdentityMutation = useDeleteIdentity();

  const handleDelete = async () => {
    if (!identity) return;

    try {
      await deleteIdentityMutation.mutateAsync(identity.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete identity:', error);
    }
  };

  const handleClose = () => {
    if (!deleteIdentityMutation.isPending) {
      onClose();
    }
  };

  if (!identity) return null;

  const traits = identity.traits as any;
  const displayName =
    traits?.name?.first && traits?.name?.last ? `${traits.name.first} ${traits.name.last}` : traits?.username || traits?.email || 'Unknown User';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="error">
          Delete Identity
        </Typography>
      </DialogTitle>

      <DialogContent>
        {deleteIdentityMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to delete identity: {(deleteIdentityMutation.error as any)?.message || 'Unknown error'}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this identity? This action cannot be undone.
          </Typography>
        </Box>

        {/* Identity Information */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="h6">{displayName}</Typography>
            <Chip label={identity.schema_id} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 1 }}>
            ID: {identity.id}
          </Typography>

          {traits?.email && (
            <Typography variant="body2" color="text.secondary">
              Email: {traits.email}
            </Typography>
          )}

          {traits?.username && (
            <Typography variant="body2" color="text.secondary">
              Username: {traits.username}
            </Typography>
          )}
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Deleting this identity will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li>Permanently remove all identity data</li>
            <li>Revoke all active sessions</li>
            <li>Remove all verifiable addresses</li>
            <li>Delete all recovery addresses</li>
          </Box>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={deleteIdentityMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteIdentityMutation.isPending}
          startIcon={deleteIdentityMutation.isPending ? <DottedLoader variant="inline" size={16} /> : undefined}
        >
          {deleteIdentityMutation.isPending ? 'Deleting...' : 'Delete Identity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdentityDeleteDialog;
