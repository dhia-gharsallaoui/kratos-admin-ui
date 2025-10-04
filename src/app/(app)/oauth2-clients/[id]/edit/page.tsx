'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@/components/ui';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon, Apps as AppsIcon } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useOAuth2Client, useUpdateOAuth2Client } from '@/features/oauth2-clients';
import {
  transformOAuth2ClientToFormData,
  validateOAuth2ClientForm,
  transformFormDataToCreateRequest,
  OAUTH2_GRANT_TYPES,
  OAUTH2_RESPONSE_TYPES,
  OAUTH2_SUBJECT_TYPES,
  OAUTH2_TOKEN_ENDPOINT_AUTH_METHODS,
} from '@/features/oauth2-clients';
import type { OAuth2ClientFormData, OAuth2ClientFormErrors } from '@/features/oauth2-clients';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditOAuth2ClientPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<OAuth2ClientFormData | null>(null);
  const [errors, setErrors] = useState<OAuth2ClientFormErrors>({});
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newAudience, setNewAudience] = useState('');

  const { data: clientResponse, isLoading, error } = useOAuth2Client(resolvedParams.id);
  const updateClientMutation = useUpdateOAuth2Client();

  const client = clientResponse?.data;

  // Initialize form data when client is loaded
  useEffect(() => {
    if (client && !formData) {
      setFormData(transformOAuth2ClientToFormData(client));
    }
  }, [client, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    // Validate form
    const validationErrors = validateOAuth2ClientForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const requestData = {
        ...transformFormDataToCreateRequest(formData),
        client_id: resolvedParams.id,
      };
      await updateClientMutation.mutateAsync({
        clientId: resolvedParams.id,
        clientData: requestData,
      });

      router.push(`/oauth2-clients/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleChange = (field: keyof OAuth2ClientFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    if (!formData) return;

    const value = event.target ? event.target.value : event;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));

    // Clear error for this field
    if (errors[field as keyof OAuth2ClientFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayChange = (field: keyof OAuth2ClientFormData, newValue: string[]) => {
    if (!formData) return;

    setFormData((prev) => (prev ? { ...prev, [field]: newValue } : null));
    if (errors[field as keyof OAuth2ClientFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addRedirectUri = () => {
    if (!formData || !newRedirectUri.trim()) return;

    handleArrayChange('redirect_uris', [...formData.redirect_uris, newRedirectUri.trim()]);
    setNewRedirectUri('');
  };

  const removeRedirectUri = (index: number) => {
    if (!formData) return;

    const updated = formData.redirect_uris.filter((_, i) => i !== index);
    handleArrayChange('redirect_uris', updated);
  };

  const addContact = () => {
    if (!formData || !newContact.trim()) return;

    handleArrayChange('contacts', [...(formData.contacts || []), newContact.trim()]);
    setNewContact('');
  };

  const removeContact = (index: number) => {
    if (!formData) return;

    const updated = (formData.contacts || []).filter((_, i) => i !== index);
    handleArrayChange('contacts', updated);
  };

  const addAudience = () => {
    if (!formData || !newAudience.trim()) return;

    handleArrayChange('audience', [...(formData.audience || []), newAudience.trim()]);
    setNewAudience('');
  };

  const removeAudience = (index: number) => {
    if (!formData) return;

    const updated = (formData.audience || []).filter((_, i) => i !== index);
    handleArrayChange('audience', updated);
  };

  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <ErrorState message={`Failed to load client: ${error.message}`} variant="page" />
        </Box>
      </AdminLayout>
    );
  }

  if (isLoading || !formData) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <LoadingState variant="page" />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <AppsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Edit OAuth2 Client
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update client configuration
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Client Name"
                        value={formData.client_name}
                        onChange={handleChange('client_name')}
                        error={!!errors.client_name}
                        helperText={errors.client_name}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Owner"
                        value={formData.owner}
                        onChange={handleChange('owner')}
                        helperText="Optional: Organization or user that owns this client"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Client URI"
                        value={formData.client_uri}
                        onChange={handleChange('client_uri')}
                        error={!!errors.client_uri}
                        helperText={errors.client_uri || "URL of the client's homepage"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Logo URI"
                        value={formData.logo_uri}
                        onChange={handleChange('logo_uri')}
                        error={!!errors.logo_uri}
                        helperText={errors.logo_uri || "URL of the client's logo image"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* OAuth2 Configuration */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    OAuth2 Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={!!errors.grant_types}>
                        <InputLabel>Grant Types</InputLabel>
                        <Select
                          multiple
                          value={formData.grant_types}
                          onChange={(e) => handleArrayChange('grant_types', e.target.value as string[])}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value: string) => (
                                <Chip key={value} label={value.replace('_', ' ')} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {OAUTH2_GRANT_TYPES.map((grantType) => (
                            <MenuItem key={grantType} value={grantType}>
                              {grantType.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.grant_types && (
                          <Typography variant="caption" color="error">
                            {errors.grant_types}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={!!errors.response_types}>
                        <InputLabel>Response Types</InputLabel>
                        <Select
                          multiple
                          value={formData.response_types}
                          onChange={(e) => handleArrayChange('response_types', e.target.value as string[])}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value: string) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {OAUTH2_RESPONSE_TYPES.map((responseType) => (
                            <MenuItem key={responseType} value={responseType}>
                              {responseType}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.response_types && (
                          <Typography variant="caption" color="error">
                            {errors.response_types}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Scope"
                        value={formData.scope}
                        onChange={handleChange('scope')}
                        helperText="Space-separated list of scopes"
                        placeholder="openid profile email"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Subject Type</InputLabel>
                        <Select value={formData.subject_type} onChange={handleChange('subject_type')}>
                          {OAUTH2_SUBJECT_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Redirect URIs */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Redirect URIs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Redirect URI"
                      value={newRedirectUri}
                      onChange={(e) => setNewRedirectUri(e.target.value)}
                      placeholder="https://example.com/callback"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRedirectUri())}
                    />
                    <Button variant="outlined" onClick={addRedirectUri} startIcon={<AddIcon />}>
                      Add
                    </Button>
                  </Box>
                  {errors.redirect_uris && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.redirect_uris}
                    </Alert>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.redirect_uris.map((uri, index) => (
                      <Chip key={index} label={uri} onDelete={() => removeRedirectUri(index)} deleteIcon={<DeleteIcon />} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Advanced Configuration */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Advanced Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Token Endpoint Auth Method</InputLabel>
                        <Select value={formData.token_endpoint_auth_method} onChange={handleChange('token_endpoint_auth_method')}>
                          {OAUTH2_TOKEN_ENDPOINT_AUTH_METHODS.map((method) => (
                            <MenuItem key={method} value={method}>
                              {method.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="UserInfo Signed Response Algorithm"
                        value={formData.userinfo_signed_response_alg}
                        onChange={handleChange('userinfo_signed_response_alg')}
                        placeholder="RS256"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Policy URI"
                        value={formData.policy_uri}
                        onChange={handleChange('policy_uri')}
                        error={!!errors.policy_uri}
                        helperText={errors.policy_uri || 'URL of privacy policy'}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Terms of Service URI"
                        value={formData.tos_uri}
                        onChange={handleChange('tos_uri')}
                        error={!!errors.tos_uri}
                        helperText={errors.tos_uri || 'URL of terms of service'}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Contacts and Audience */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Contact Email"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      placeholder="admin@example.com"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContact())}
                    />
                    <Button variant="outlined" onClick={addContact} startIcon={<AddIcon />}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(formData.contacts || []).map((contact, index) => (
                      <Chip key={index} label={contact} onDelete={() => removeContact(index)} deleteIcon={<DeleteIcon />} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Audience
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Audience"
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      placeholder="https://api.example.com"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAudience())}
                    />
                    <Button variant="outlined" onClick={addAudience} startIcon={<AddIcon />}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(formData.audience || []).map((aud, index) => (
                      <Chip key={index} label={aud} onDelete={() => removeAudience(index)} deleteIcon={<DeleteIcon />} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Actions */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.back()} disabled={updateClientMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={updateClientMutation.isPending}>
                  {updateClientMutation.isPending ? 'Updating...' : 'Update Client'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Error Display */}
        {updateClientMutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to update client: {updateClientMutation.error.message}
          </Alert>
        )}
      </Box>
    </AdminLayout>
  );
}
