'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, IconButton, Typography } from '@/components/ui';
import { ArrowBack as ArrowBackIcon, Apps as AppsIcon } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import {
  useOAuth2Client,
  useUpdateOAuth2Client,
  OAuth2ClientForm,
  transformOAuth2ClientToFormData,
  transformFormDataToCreateRequest,
} from '@/features/oauth2-clients';
import type { OAuth2ClientFormData } from '@/features/oauth2-clients';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditOAuth2ClientPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [initialFormData, setInitialFormData] = useState<OAuth2ClientFormData | null>(null);

  const { data: clientResponse, isLoading, error } = useOAuth2Client(resolvedParams.id);
  const updateClientMutation = useUpdateOAuth2Client();

  const client = clientResponse?.data;

  // Initialize form data when client is loaded
  useEffect(() => {
    if (client && !initialFormData) {
      setInitialFormData(transformOAuth2ClientToFormData(client));
    }
  }, [client, initialFormData]);

  const handleSubmit = async (formData: OAuth2ClientFormData) => {
    const requestData = {
      ...transformFormDataToCreateRequest(formData),
      client_id: resolvedParams.id,
    };

    await updateClientMutation.mutateAsync({
      clientId: resolvedParams.id,
      clientData: requestData,
    });

    router.push(`/oauth2-clients/${resolvedParams.id}`);
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

  if (isLoading || !initialFormData) {
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

        <OAuth2ClientForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          submitButtonLabel="Update Client"
          isSubmitting={updateClientMutation.isPending}
          error={updateClientMutation.error}
          onCancel={() => router.back()}
        />
      </Box>
    </AdminLayout>
  );
}
