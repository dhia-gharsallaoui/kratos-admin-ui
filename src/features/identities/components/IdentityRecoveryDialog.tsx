import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { Close, ContentCopy, Link as LinkIcon } from '@mui/icons-material';
import { Identity } from '@ory/kratos-client';
import { createRecoveryLink } from '@/services/kratos';
import { DottedLoader } from '@/components/ui/DottedLoader';

interface IdentityRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
  identity: Identity | null;
}

export const IdentityRecoveryDialog: React.FC<IdentityRecoveryDialogProps> = ({
  open,
  onClose,
  identity,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleGenerateRecoveryLink = async () => {
    if (!identity?.id) return;

    setLoading(true);
    setError(null);
    setRecoveryLink(null);

    try {
      const response = await createRecoveryLink(identity.id);
      
      setRecoveryLink(response.data.recovery_link);
    } catch (err: any) {
      console.error('Error generating recovery link:', err);
      setError(
        err.response?.data?.error?.message || 
        'Failed to generate recovery link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!recoveryLink) return;

    try {
      await navigator.clipboard.writeText(recoveryLink);
      setShowCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleClose = () => {
    setRecoveryLink(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!identity) return null;

  const traits = identity.traits as any;
  const email = traits?.email || 'N/A';

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            <Typography variant="h6">
              Generate Recovery Link
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Generate a recovery link for this identity that can be used to reset their password or recover their account.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Identity:</strong> {email} ({identity.id.substring(0, 8)}...)
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <DottedLoader variant="inline" />
            </Box>
          )}

          {recoveryLink && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Recovery link generated successfully! The link is valid for a limited time.
              </Alert>
              
              <TextField
                fullWidth
                label="Recovery Link"
                value={recoveryLink}
                multiline
                rows={3}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyToClipboard}
                        edge="end"
                        title="Copy to clipboard"
                      >
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }
                }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Send this link to the user via a secure channel. The link will expire after a short period for security.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid var(--border)' }}>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
          {!recoveryLink && (
            <Button
              onClick={handleGenerateRecoveryLink}
              variant="contained"
              disabled={loading}
              startIcon={<LinkIcon />}
            >
              {loading ? 'Generating...' : 'Generate Recovery Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Copy success snackbar */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="Recovery link copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default IdentityRecoveryDialog;