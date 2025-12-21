"use client";

import { Apps as AppsIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Box, IconButton, Typography } from "@/components/ui";
import type { OAuth2ClientFormData } from "@/features/oauth2-clients";
import { getDefaultOAuth2ClientFormData, OAuth2ClientForm, transformFormDataToCreateRequest, useCreateOAuth2Client } from "@/features/oauth2-clients";

export default function CreateOAuth2ClientPage() {
	const router = useRouter();
	const createClientMutation = useCreateOAuth2Client();

	const handleSubmit = async (formData: OAuth2ClientFormData) => {
		const requestData = transformFormDataToCreateRequest(formData);
		const result = await createClientMutation.mutateAsync(requestData);

		if (result.data.client_id) {
			router.push(`/clients/${result.data.client_id}`);
		}
	};

	return (
		<AdminLayout>
			<Box sx={{ p: 3 }}>
				{/* Header */}
				<Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
					<IconButton onClick={() => router.back()}>
						<ArrowBackIcon />
					</IconButton>
					<AppsIcon sx={{ fontSize: 32, color: "primary.main" }} />
					<Box>
						<Typography variant="h4" component="h1" fontWeight="bold">
							Create OAuth2 Client
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Configure a new OAuth2 client application
						</Typography>
					</Box>
				</Box>

				<OAuth2ClientForm
					initialData={getDefaultOAuth2ClientFormData()}
					onSubmit={handleSubmit}
					submitButtonLabel="Create Client"
					isSubmitting={createClientMutation.isPending}
					error={createClientMutation.error}
					onCancel={() => router.back()}
				/>
			</Box>
		</AdminLayout>
	);
}
