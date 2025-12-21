'use client';

import React, { useState } from 'react';
import { Container, Grid, Snackbar } from '@/components/ui';
import { Alert } from '@/components/ui';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { PageHeader, ProtectedPage } from '@/components/layout';
import {
  useKratosEndpoints,
  useHydraEndpoints,
  useSetKratosEndpoints,
  useSetHydraEndpoints,
  useIsOryNetwork,
  useSetIsOryNetwork,
  useResetSettings,
  useIsValidUrl,
} from '@/features/settings/hooks/useSettings';
import { useTheme } from '@/providers/ThemeProvider';
import { useServiceSettingsForm } from './hooks';
import { AppearanceSection, ConnectionModeSection, ServiceConfigSection, ResetSection } from './components';

export default function SettingsPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { theme: currentTheme, toggleTheme } = useTheme();

  // Settings store hooks
  const isOryNetwork = useIsOryNetwork();
  const setIsOryNetwork = useSetIsOryNetwork();
  const kratosEndpoints = useKratosEndpoints();
  const setKratosEndpoints = useSetKratosEndpoints();
  const hydraEndpoints = useHydraEndpoints();
  const setHydraEndpoints = useSetHydraEndpoints();
  const resetSettings = useResetSettings();
  const isValidUrl = useIsValidUrl();

  // Success callback for all save operations
  const showSuccess = () => setShowSuccessMessage(true);

  // Form hooks for Kratos and Hydra
  const kratosForm = useServiceSettingsForm({
    endpoints: kratosEndpoints,
    setEndpoints: setKratosEndpoints,
    onSuccess: showSuccess,
  });

  const hydraForm = useServiceSettingsForm({
    endpoints: hydraEndpoints,
    setEndpoints: setHydraEndpoints,
    onSuccess: showSuccess,
  });

  // URL validation
  const validateUrl = (value: string) => {
    if (!value.trim()) return 'URL is required';
    if (!isValidUrl(value.trim())) return 'Please enter a valid URL';
    return true;
  };

  // Event handlers
  const handleThemeChange = () => {
    toggleTheme();
    showSuccess();
  };

  const handleOryNetworkChange = (enabled: boolean) => {
    setIsOryNetwork(enabled);
    showSuccess();
  };

  const handleResetAll = async () => {
    await resetSettings();
    showSuccess();
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
          <Grid size={{ xs: 12 }}>
            <AppearanceSection currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ConnectionModeSection isOryNetwork={isOryNetwork} onOryNetworkChange={handleOryNetworkChange} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ServiceConfigSection
              serviceName="Kratos"
              form={kratosForm.form}
              currentEndpoints={kratosEndpoints}
              publicUrlPlaceholder="http://localhost:4433"
              adminUrlPlaceholder="http://localhost:4434"
              publicUrlHelperText="Used for public API calls"
              adminUrlHelperText="Used for admin API calls"
              onSave={kratosForm.handleSave}
              validateUrl={validateUrl}
              isEditingApiKey={kratosForm.isEditingApiKey}
              onApiKeyEditStart={kratosForm.startEditingApiKey}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ServiceConfigSection
              serviceName="Hydra"
              form={hydraForm.form}
              currentEndpoints={hydraEndpoints}
              publicUrlPlaceholder="http://localhost:4444"
              adminUrlPlaceholder="http://localhost:4445"
              publicUrlHelperText="Used for OAuth2/OIDC public endpoints"
              adminUrlHelperText="Used for OAuth2 client and flow management"
              onSave={hydraForm.handleSave}
              validateUrl={validateUrl}
              isEditingApiKey={hydraForm.isEditingApiKey}
              onApiKeyEditStart={hydraForm.startEditingApiKey}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ResetSection onReset={handleResetAll} />
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
