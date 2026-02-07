import type React from "react";
import { ActionBar } from "@/components/layout";
import { Alert, Box, Chip, FormDialog, Typography } from "@/components/ui";
import { uiLogger } from "@/lib/logger";
import { useDeleteIdentityCredentials } from "../hooks/useIdentities";

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
	password: "Password",
	oidc: "Social Sign-In (OIDC)",
	totp: "TOTP (Authenticator App)",
	lookup_secret: "Lookup Secrets (Backup Codes)",
	webauthn: "WebAuthn (Security Key)",
	passkey: "Passkey",
	code: "Code",
	profile: "Profile",
	saml: "SAML",
	link_recovery: "Recovery Link",
	code_recovery: "Recovery Code",
};

const TYPES_REQUIRING_IDENTIFIER = new Set(["oidc", "saml"]);

interface CredentialDeleteDialogProps {
	open: boolean;
	onClose: () => void;
	identityId: string;
	credentialType: string;
	identifier?: string;
	onSuccess?: () => void;
}

export const CredentialDeleteDialog: React.FC<CredentialDeleteDialogProps> = ({
	open,
	onClose,
	identityId,
	credentialType,
	identifier,
	onSuccess,
}) => {
	const deleteCredentialMutation = useDeleteIdentityCredentials();

	const handleDelete = async () => {
		try {
			await deleteCredentialMutation.mutateAsync({
				id: identityId,
				type: credentialType as any,
				...(TYPES_REQUIRING_IDENTIFIER.has(credentialType) && identifier ? { identifier } : {}),
			});
			onSuccess?.();
			onClose();
		} catch (error) {
			uiLogger.logError(error, "Failed to delete credential");
		}
	};

	const typeLabel = CREDENTIAL_TYPE_LABELS[credentialType] || credentialType;

	return (
		<FormDialog
			open={open}
			onClose={onClose}
			title="Delete Credential"
			titleColor="error.main"
			disableBackdropClick={deleteCredentialMutation.isPending}
		>
			<Box sx={{ mb: 3 }}>
				<Typography variant="body" gutterBottom>
					Are you sure you want to delete this credential? This action cannot be undone.
				</Typography>
			</Box>

			{/* Credential Information */}
			<Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
					<Typography variant="heading" size="lg">
						Credential
					</Typography>
					<Chip label={typeLabel} variant="tag" />
				</Box>

				{identifier && (
					<Box sx={{ mt: 1 }}>
						<Typography variant="label" gutterBottom>
							Identifier:
						</Typography>
						<Typography variant="code" sx={{ display: "block", mt: 0.5 }}>
							{identifier}
						</Typography>
					</Box>
				)}
			</Box>

			<Alert variant="inline" severity="warning" sx={{ mt: 2 }}>
				<Typography variant="body">
					<strong>Warning:</strong> Deleting this credential will:
				</Typography>
				<Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
					<li>Permanently remove this {typeLabel.toLowerCase()} credential</li>
					<li>Prevent the user from authenticating with this method</li>
					{credentialType === "oidc" && <li>Disconnect the linked social sign-in provider</li>}
					{credentialType === "totp" && <li>Disable two-factor authentication via authenticator app</li>}
					{credentialType === "webauthn" && <li>Remove the registered security key</li>}
					{credentialType === "lookup_secret" && <li>Invalidate all backup codes</li>}
				</Box>
			</Alert>

			{deleteCredentialMutation.isError && (
				<Alert variant="inline" severity="error" sx={{ mt: 2 }}>
					Failed to delete credential: {(deleteCredentialMutation.error as any)?.message || "Unknown error"}
				</Alert>
			)}

			<Box sx={{ mt: 3 }}>
				<ActionBar
					align="right"
					primaryAction={{
						label: deleteCredentialMutation.isPending ? "Deleting..." : "Delete Credential",
						onClick: handleDelete,
						disabled: deleteCredentialMutation.isPending,
					}}
					secondaryActions={[
						{
							label: "Cancel",
							onClick: onClose,
							disabled: deleteCredentialMutation.isPending,
						},
					]}
				/>
			</Box>
		</FormDialog>
	);
};

export default CredentialDeleteDialog;
