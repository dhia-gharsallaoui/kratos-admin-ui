import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box, Typography, Alert, Chip } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Identity } from '@ory/kratos-client';
import { useUpdateIdentity } from '../hooks/useIdentities';
import { DottedLoader } from '@/components/ui/DottedLoader';

interface IdentityEditModalProps {
  open: boolean;
  onClose: () => void;
  identity: Identity | null;
  onSuccess?: () => void;
}

interface IdentityEditForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export const IdentityEditModal: React.FC<IdentityEditModalProps> = ({ open, onClose, identity, onSuccess }) => {
  const updateIdentityMutation = useUpdateIdentity();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<IdentityEditForm>({
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
    },
  });

  // Reset form when identity changes
  useEffect(() => {
    if (identity) {
      const traits = identity.traits as any;
      console.log('Current identity traits structure:', traits);
      reset({
        email: traits?.email || '',
        username: traits?.username || '',
        firstName: traits?.name?.first || traits?.firstName || '',
        lastName: traits?.name?.last || traits?.lastName || '',
      });
    }
  }, [identity, reset]);

  const onSubmit = async (data: IdentityEditForm) => {
    if (!identity) return;

    try {
      console.log('Submitting identity update:', {
        originalIdentity: identity,
        formData: data,
      });

      // Transform form data to match Kratos traits structure
      const traits = {
        email: data.email,
        username: data.username,
        name: {
          first: data.firstName,
          last: data.lastName,
        },
      };

      console.log('Transformed traits:', traits);

      // Only update traits, not state
      await updateIdentityMutation.mutateAsync({
        id: identity.id,
        schemaId: identity.schema_id,
        traits,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update identity:', error);
      console.error('Error details:', error);
    }
  };

  const handleClose = () => {
    if (!updateIdentityMutation.isPending) {
      reset();
      onClose();
    }
  };

  if (!identity) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: '500px' },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Edit Identity</Typography>
          <Chip label={identity.schema_id} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'monospace' }}>
          {identity.id}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {updateIdentityMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update identity: {(updateIdentityMutation.error as any)?.message || 'Unknown error'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={updateIdentityMutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    disabled={updateIdentityMutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="firstName"
                control={control}
                rules={{
                  required: 'First name is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={updateIdentityMutation.isPending}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: 'Last name is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={updateIdentityMutation.isPending}
                  />
                )}
              />
            </Grid>

            {/* Read-only Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Read-only Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Created At" value={new Date(identity.created_at || '').toLocaleString()} fullWidth disabled variant="filled" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Updated At" value={new Date(identity.updated_at || '').toLocaleString()} fullWidth disabled variant="filled" />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={updateIdentityMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={updateIdentityMutation.isPending || !isDirty}
          startIcon={updateIdentityMutation.isPending ? <DottedLoader variant="inline" size={16} /> : undefined}
        >
          {updateIdentityMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdentityEditModal;
