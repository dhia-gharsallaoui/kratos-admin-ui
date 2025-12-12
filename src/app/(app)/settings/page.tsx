'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Snackbar, Switch, Button } from '@/components/ui';
import { ActionBar, Alert, TextField, Typography } from '@/components/ui';
import { Settings as SettingsIcon, RestartAlt as ResetIcon, Save as SaveIcon, Palette as PaletteIcon, Cloud as CloudIcon } from '@mui/icons-material';
import { PageHeader, ProtectedPage, SectionCard, FlexBox } from '@/components/layout';
import { useForm, Controller } from 'react-hook-form';
import {
  useKratosEndpoints,
  useHydraEndpoints,
  useSetKratosEndpoints,
  useSetHydraEndpoints,
  useResetSettings,
  useIsValidUrl,
} from '@/features/settings/hooks/useSettings';
import { useTheme } from '@/providers/ThemeProvider';

interface KratosSettingsForm {
  publicUrl: string;
  adminUrl: string;
  apiKey?: string;
}

interface HydraSettingsForm {
  publicUrl: string;
  adminUrl: string;
  apiKey?: string;
}

export default function SettingsPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { theme: currentTheme, toggleTheme } = useTheme();

  // Kratos settings
  const kratosEndpoints = useKratosEndpoints();
  const setKratosEndpoints = useSetKratosEndpoints();

  // Hydra settings
  const hydraEndpoints = useHydraEndpoints();
  const setHydraEndpoints = useSetHydraEndpoints();

  const resetSettings = useResetSettings();
  const isValidUrl = useIsValidUrl();

  const kratosForm = useForm<KratosSettingsForm>({
    defaultValues: {
      publicUrl: kratosEndpoints.publicUrl,
      adminUrl: kratosEndpoints.adminUrl,
    },
  });

  const hydraForm = useForm<HydraSettingsForm>({
    defaultValues: {
      publicUrl: hydraEndpoints.publicUrl,
      adminUrl: hydraEndpoints.adminUrl,
    },
  });

  const {
    handleSubmit: handleKratosSubmit,
    control: kratosControl,
    formState: { errors: kratosErrors, isDirty: kratosIsDirty },
  } = kratosForm;

  const {
    handleSubmit: handleHydraSubmit,
    control: hydraControl,
    formState: { errors: hydraErrors, isDirty: hydraIsDirty },
  } = hydraForm;

  useEffect(() => {
    kratosForm.reset({
      publicUrl: kratosEndpoints.publicUrl,
      adminUrl: kratosEndpoints.adminUrl,
      apiKey: kratosEndpoints.apiKey,
    });
  }, [kratosEndpoints, kratosForm]);

  useEffect(() => {
    hydraForm.reset({
      publicUrl: hydraEndpoints.publicUrl,
      adminUrl: hydraEndpoints.adminUrl,
      apiKey: hydraEndpoints.apiKey,
    });
  }, [hydraEndpoints, hydraForm]);

  const handleKratosSave = async (data: KratosSettingsForm) => {
    try {
      setKratosEndpoints({
        publicUrl: data.publicUrl.trim(),
        adminUrl: data.adminUrl.trim(),
        apiKey: data.apiKey?.trim(),
      });
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to save Kratos settings:', error);
    }
  };

  const handleHydraSave = async (data: HydraSettingsForm) => {
    try {
      setHydraEndpoints({
        publicUrl: data.publicUrl.trim(),
        adminUrl: data.adminUrl.trim(),
        apiKey: data.apiKey?.trim(),
      });
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to save Hydra settings:', error);
    }
  };

  const handleResetAll = async () => {
    await resetSettings();
    setShowSuccessMessage(true);
  };

  const validateUrl = (value: string) => {
    if (!value.trim()) return 'URL is required';
    if (!isValidUrl(value.trim())) return 'Please enter a valid URL';
    return true;
  };

  const handleThemeChange = () => {
    toggleTheme();
    setShowSuccessMessage(true);
  };

  return (
    <ProtectedPage>
      <PageHeader
        title="Settings"
        subtitle="Configure application preferences and API endpoints"
        icon={<SettingsIcon sx={{ fontSize: 32, color: 'white' }} />}
      />

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Appearance Settings */}
          <Grid size={{ xs: 12 }}>
            <SectionCard
              title={
                <FlexBox align="center" gap={1}>
                  <PaletteIcon />
                  <Typography variant="heading" size="lg">
                    Appearance
                  </Typography>
                </FlexBox>
              }
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FlexBox align="center" gap={2}>
                    <Typography variant="label">Theme Preference</Typography>
                    <FlexBox align="center" gap={1}>
                      <Typography variant="body" color="secondary">
                        Light
                      </Typography>
                      <Switch checked={currentTheme === 'dark'} onChange={handleThemeChange} color="primary" />
                      <Typography variant="body" color="secondary">
                        Dark
                      </Typography>
                    </FlexBox>
                  </FlexBox>
                  <Typography variant="body" color="secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
                    Choose between light and dark theme. Your preference will be saved automatically.
                  </Typography>
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          {/* Kratos Configuration */}
          <Grid size={{ xs: 12 }}>
            <SectionCard
              title={
                <FlexBox align="center" gap={1}>
                  <CloudIcon />
                  <Typography variant="heading" size="lg">
                    Ory Kratos Configuration
                  </Typography>
                </FlexBox>
              }
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body">
                  <strong>Note:</strong> These are the Kratos endpoint URLs that the application will use. Settings are stored in your browser&apos;s
                  local storage and take effect immediately.
                </Typography>
              </Alert>

              <Box component="form" onSubmit={handleKratosSubmit(handleKratosSave)}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="publicUrl"
                      control={kratosControl}
                      rules={{ validate: validateUrl }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Kratos Public URL"
                          placeholder="http://localhost:4433"
                          fullWidth
                          error={!!kratosErrors.publicUrl}
                          helperText={kratosErrors.publicUrl?.message || 'Used for public API calls'}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="adminUrl"
                      control={kratosControl}
                      rules={{ validate: validateUrl }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Kratos Admin URL"
                          placeholder="http://localhost:4434"
                          fullWidth
                          error={!!kratosErrors.adminUrl}
                          helperText={kratosErrors.adminUrl?.message || 'Used for admin API calls'}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="apiKey"
                      control={kratosControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Kratos API Key"
                          placeholder="ory_pat_xxx"
                          fullWidth
                          helperText={kratosErrors.apiKey?.message || 'Used to access Ory Network for instance'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <ActionBar
                  primaryAction={{
                    label: 'Save Kratos Settings',
                    onClick: handleKratosSubmit(handleKratosSave),
                    icon: <SaveIcon />,
                    disabled: !kratosIsDirty,
                  }}
                />
              </Box>
            </SectionCard>
          </Grid>

          {/* Hydra Configuration */}
          <Grid size={{ xs: 12 }}>
            <SectionCard
              title={
                <FlexBox align="center" gap={1}>
                  <CloudIcon />
                  <Typography variant="heading" size="lg">
                    Ory Hydra Configuration
                  </Typography>
                </FlexBox>
              }
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body">
                  <strong>Note:</strong> These are the Hydra endpoint URLs that the application will use. Settings are stored in your browser&apos;s
                  local storage and take effect immediately.
                </Typography>
              </Alert>

              <Box component="form" onSubmit={handleHydraSubmit(handleHydraSave)}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="publicUrl"
                      control={hydraControl}
                      rules={{ validate: validateUrl }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hydra Public URL"
                          placeholder="http://localhost:4444"
                          fullWidth
                          error={!!hydraErrors.publicUrl}
                          helperText={hydraErrors.publicUrl?.message || 'Used for OAuth2/OIDC public endpoints'}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="adminUrl"
                      control={hydraControl}
                      rules={{ validate: validateUrl }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hydra Admin URL"
                          placeholder="http://localhost:4445"
                          fullWidth
                          error={!!hydraErrors.adminUrl}
                          helperText={hydraErrors.adminUrl?.message || 'Used for OAuth2 client and flow management'}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="apiKey"
                      control={hydraControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hydra API Key"
                          placeholder="ory_pat_xxx"
                          fullWidth
                          helperText={hydraErrors.apiKey?.message || 'Used to access Ory Network for instance'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <ActionBar
                  primaryAction={{
                    label: 'Save Hydra Settings',
                    onClick: handleHydraSubmit(handleHydraSave),
                    icon: <SaveIcon />,
                    disabled: !hydraIsDirty,
                  }}
                />
              </Box>
            </SectionCard>
          </Grid>

          {/* Reset All Settings */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'error.main',
                bgcolor: 'error.lighter',
                borderRadius: 2,
              }}
            >
              <FlexBox justify="space-between" align="center">
                <Box>
                  <Typography variant="heading" size="md" sx={{ mb: 0.5 }}>
                    Reset All Settings
                  </Typography>
                  <Typography variant="body" color="secondary">
                    Reset all settings to their default values. This will clear all custom endpoint configurations.
                  </Typography>
                </Box>
                <Button variant="outlined" color="error" onClick={handleResetAll} startIcon={<ResetIcon />}>
                  Reset to Defaults
                </Button>
              </FlexBox>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert variant="toast" onClose={() => setShowSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </ProtectedPage>
  );
}
