'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
} from '@/components/ui';
import { ActionBar, Alert, Button, IconButton, TextField, Tooltip, Typography } from '@/components/ui';
import {
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  Cloud as CloudIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/layout';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  useKratosEndpoints,
  useHydraEndpoints,
  useSetKratosEndpoints,
  useSetHydraEndpoints,
  useResetSettings,
  useIsValidUrl,
} from '@/features/settings/hooks/useSettings';
import { useTheme } from '@/providers/ThemeProvider';

const DRAWER_WIDTH = 280;

type SettingsSection = 'general' | 'kratos' | 'hydra';

interface KratosSettingsForm {
  publicUrl: string;
  adminUrl: string;
}

interface HydraSettingsForm {
  publicUrl: string;
  adminUrl: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
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
    });
  }, [kratosEndpoints, kratosForm]);

  useEffect(() => {
    hydraForm.reset({
      publicUrl: hydraEndpoints.publicUrl,
      adminUrl: hydraEndpoints.adminUrl,
    });
  }, [hydraEndpoints, hydraForm]);

  const handleKratosSave = async (data: KratosSettingsForm) => {
    try {
      setKratosEndpoints({
        publicUrl: data.publicUrl.trim(),
        adminUrl: data.adminUrl.trim(),
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
      });
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to save Hydra settings:', error);
    }
  };

  const handleResetSettings = async () => {
    await resetSettings();
    setShowSuccessMessage(true);
  };

  const handleKratosReset = async () => {
    await resetSettings();
    setShowSuccessMessage(true);
  };

  const handleHydraReset = async () => {
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

  const settingsMenuItems = [
    {
      id: 'general' as SettingsSection,
      label: 'General',
      icon: <PaletteIcon />,
      description: 'Theme and UI preferences',
    },
    {
      id: 'kratos' as SettingsSection,
      label: 'Kratos',
      icon: <CloudIcon />,
      description: 'Ory Kratos configuration',
    },
    {
      id: 'hydra' as SettingsSection,
      label: 'Hydra',
      icon: <CloudIcon />,
      description: 'Ory Hydra configuration',
    },
  ];

  const renderGeneralSettings = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="heading" level="h2">
        Appearance
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Theme Preference
        </FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body">Light</Typography>
          <Switch checked={currentTheme === 'dark'} onChange={handleThemeChange} color="primary" />
          <Typography variant="body">Dark</Typography>
        </Box>
        <Typography variant="body" color="secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Choose between light and dark theme. Your preference will be saved automatically.
        </Typography>
      </FormControl>
    </Paper>
  );

  const renderKratosSettings = () => (
    <Paper sx={{ p: 4 }}>
      <Alert severity="info" style={{ marginBottom: '1.5rem' }}>
        <Typography variant="body">
          <strong>Note:</strong> These are the real Kratos endpoint URLs that the application will proxy to. Settings are stored in your
          browser&apos;s local storage and take effect immediately.
        </Typography>
      </Alert>

      <Box component="form" onSubmit={handleKratosSubmit(handleKratosSave)}>
        <Typography variant="heading" level="h2">
          Endpoint Configuration
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="publicUrl"
              control={kratosControl}
              rules={{
                validate: validateUrl,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kratos Public URL"
                  placeholder="http://localhost:4433"
                  fullWidth
                  error={!!kratosErrors.publicUrl}
                  helperText={kratosErrors.publicUrl?.message || 'Used for public API calls (registration, login, etc.)'}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="adminUrl"
              control={kratosControl}
              rules={{
                validate: validateUrl,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kratos Admin URL"
                  placeholder="http://localhost:4434"
                  fullWidth
                  error={!!kratosErrors.adminUrl}
                  helperText={kratosErrors.adminUrl?.message || 'Used for admin API calls (identity management, etc.)'}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="heading" level="h2" style={{ marginTop: '1rem' }}>
              Current Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="code" style={{ display: 'block', marginBottom: '0.5rem' }}>
                <strong>Public URL:</strong> {kratosEndpoints.publicUrl}
              </Typography>
              <Typography variant="code" style={{ display: 'block' }}>
                <strong>Admin URL:</strong> {kratosEndpoints.adminUrl}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <ActionBar
          primaryAction={{
            label: 'Save Changes',
            onClick: handleKratosSubmit(handleKratosSave),
            icon: <SaveIcon />,
            disabled: !kratosIsDirty,
          }}
          secondaryActions={[
            {
              label: 'Reset to Defaults',
              onClick: handleKratosReset,
              icon: <ResetIcon />,
              variant: 'outlined',
            },
          ]}
        />
      </Box>
    </Paper>
  );

  const renderHydraSettings = () => (
    <Paper sx={{ p: 4 }}>
      <Alert severity="info" style={{ marginBottom: '1.5rem' }}>
        <Typography variant="body">
          <strong>Note:</strong> These are the real Hydra endpoint URLs that the application will proxy to. Settings are stored in your browser&apos;s
          local storage and take effect immediately.
        </Typography>
      </Alert>

      <Box component="form" onSubmit={handleHydraSubmit(handleHydraSave)}>
        <Typography variant="heading" level="h2">
          Endpoint Configuration
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="publicUrl"
              control={hydraControl}
              rules={{
                validate: validateUrl,
              }}
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

          <Grid size={{ xs: 12 }}>
            <Controller
              name="adminUrl"
              control={hydraControl}
              rules={{
                validate: validateUrl,
              }}
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

          <Grid size={{ xs: 12 }}>
            <Typography variant="heading" level="h2" style={{ marginTop: '1rem' }}>
              Current Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="code" style={{ display: 'block', marginBottom: '0.5rem' }}>
                <strong>Public URL:</strong> {hydraEndpoints.publicUrl}
              </Typography>
              <Typography variant="code" style={{ display: 'block' }}>
                <strong>Admin URL:</strong> {hydraEndpoints.adminUrl}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <ActionBar
          primaryAction={{
            label: 'Save Changes',
            onClick: handleHydraSubmit(handleHydraSave),
            icon: <SaveIcon />,
            disabled: !hydraIsDirty,
          }}
          secondaryActions={[
            {
              label: 'Reset to Defaults',
              onClick: handleHydraReset,
              icon: <ResetIcon />,
              variant: 'outlined',
            },
          ]}
        />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Settings"
        subtitle="Configure your Kratos and Hydra endpoints"
        icon={<SettingsIcon sx={{ fontSize: 32, color: 'white' }} />}
        actions={
          <Tooltip content="Go back">
            <IconButton variant="action" onClick={() => router.back()} aria-label="Go back">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 240px)' }}>
        {/* Settings Menu Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%',
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="heading" level="h3">
              Sections
            </Typography>
            <Typography variant="body" color="secondary">
              Configure application preferences
            </Typography>
          </Box>

          <List sx={{ pt: 0 }}>
            {settingsMenuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    py: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    secondaryTypographyProps={{
                      sx: {
                        color: activeSection === item.id ? 'primary.contrastText' : 'text.secondary',
                        opacity: activeSection === item.id ? 0.8 : 1,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="heading" level="h1">
              {settingsMenuItems.find((item) => item.id === activeSection)?.label}
            </Typography>
            <Typography variant="body" color="secondary" style={{ display: 'block', marginBottom: '2rem' }}>
              {settingsMenuItems.find((item) => item.id === activeSection)?.description}
            </Typography>

            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'kratos' && renderKratosSettings()}
            {activeSection === 'hydra' && renderHydraSettings()}
          </Box>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={3000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setShowSuccessMessage(false)} severity="success" style={{ width: '100%' }}>
            <CheckCircleIcon style={{ marginRight: '0.5rem' }} fontSize="inherit" />
            Settings saved successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
