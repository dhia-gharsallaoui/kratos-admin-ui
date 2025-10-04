import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Identity } from '@ory/kratos-client';
import { ActionBar, Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DottedLoader, Grid, TextField, Typography } from '@/components/ui';
import { useUpdateIdentity } from '../hooks/useIdentities';
import { formatDate } from '@/lib/date-utils';
import { uiLogger } from '@/lib/logger';

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
      uiLogger.debug('Current identity traits structure:', traits);
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
      uiLogger.debug('Submitting identity update:', {
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

      uiLogger.debug('Transformed traits:', traits);

      // Only update traits, not state
      await updateIdentityMutation.mutateAsync({
        id: identity.id,
        schemaId: identity.schema_id,
        traits,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      uiLogger.logError(error, 'Failed to update identity');
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
      title={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="heading" size="lg">Edit Identity</Typography>
            <Chip label={identity.schema_id} variant="tag" />
          </Box>
          <Typography variant="code" sx={{ mt: 1 }}>
            {identity.id}
          </Typography>
        </Box>
      }
      slotProps={{
        paper: {
          sx: { minHeight: '500px' },
        },
      }}
    >

      <DialogContent>
        {updateIdentityMutation.isError && (
          <Alert variant="inline" severity="error" sx={{ mb: 2 }}>
            Failed to update identity: {(updateIdentityMutation.error as any)?.message || 'Unknown error'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="heading" size="lg" gutterBottom>
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
              <Typography variant="heading" size="lg" gutterBottom sx={{ mt: 2 }}>
                Read-only Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Created At" value={formatDate(identity.created_at)} fullWidth disabled variant="readonly" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Updated At" value={formatDate(identity.updated_at)} fullWidth disabled variant="readonly" />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <ActionBar
          primaryAction={{
            label: 'Save Changes',
            onClick: handleSubmit(onSubmit),
            loading: updateIdentityMutation.isPending,
            disabled: !isDirty,
          }}
          secondaryActions={[
            {
              label: 'Cancel',
              onClick: handleClose,
              variant: 'outlined',
              disabled: updateIdentityMutation.isPending,
            },
          ]}
        />
      </DialogActions>
    </Dialog>
  );
};

export default IdentityEditModal;
