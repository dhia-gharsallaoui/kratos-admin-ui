import type { Identity } from "@ory/kratos-client";
import type React from "react";
import { ActionBar } from "@/components/layout";
import { Alert, Box, Chip, FormDialog, Typography } from "@/components/ui";
import { uiLogger } from "@/lib/logger";
import { useDeleteIdentity } from "../hooks/useIdentities";

interface IdentityDeleteDialogProps {
	open: boolean;
	onClose: () => void;
	identity: Identity | null;
	onSuccess?: () => void;
}

export const IdentityDeleteDialog: React.FC<IdentityDeleteDialogProps> = ({ open, onClose, identity, onSuccess }) => {
	const deleteIdentityMutation = useDeleteIdentity();

	const handleDelete = async () => {
		if (!identity) return;

		try {
			await deleteIdentityMutation.mutateAsync(identity.id);
			onSuccess?.();
			onClose();
		} catch (error) {
			uiLogger.logError(error, "Failed to delete identity");
		}
	};

	if (!identity) return null;

	const traits = identity.traits as any;
	const displayName =
		traits?.name?.first && traits?.name?.last ? `${traits.name.first} ${traits.name.last}` : traits?.username || traits?.email || "Unknown User";

	return (
		<FormDialog open={open} onClose={onClose} title="Delete Identity" titleColor="error.main" disableBackdropClick={deleteIdentityMutation.isPending}>
			<Box sx={{ mb: 3 }}>
				<Typography variant="body" gutterBottom>
					Are you sure you want to delete this identity? This action cannot be undone.
				</Typography>
			</Box>

			{/* Identity Information */}
			<Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: 1,
					}}
				>
					<Typography variant="heading" size="lg">
						{displayName}
					</Typography>
					<Chip label={identity.schema_id} variant="tag" />
				</Box>

				<Typography variant="code" sx={{ mb: 1 }}>
					ID: {identity.id}
				</Typography>

				{traits?.email && <Typography variant="label">Email: {traits.email}</Typography>}

				{traits?.username && <Typography variant="label">Username: {traits.username}</Typography>}
			</Box>

			<Alert variant="inline" severity="warning" sx={{ mt: 2 }}>
				<Typography variant="body">
					<strong>Warning:</strong> Deleting this identity will:
				</Typography>
				<Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
					<li>Permanently remove all identity data</li>
					<li>Revoke all active sessions</li>
					<li>Remove all verifiable addresses</li>
					<li>Delete all recovery addresses</li>
				</Box>
			</Alert>

			{deleteIdentityMutation.isError && (
				<Alert variant="inline" severity="error" sx={{ mt: 2 }}>
					Failed to delete identity: {(deleteIdentityMutation.error as any)?.message || "Unknown error"}
				</Alert>
			)}

			<Box sx={{ mt: 3 }}>
				<ActionBar
					align="right"
					primaryAction={{
						label: deleteIdentityMutation.isPending ? "Deleting..." : "Delete Identity",
						onClick: handleDelete,
						disabled: deleteIdentityMutation.isPending,
					}}
					secondaryActions={[
						{
							label: "Cancel",
							onClick: onClose,
							disabled: deleteIdentityMutation.isPending,
						},
					]}
				/>
			</Box>
		</FormDialog>
	);
};

export default IdentityDeleteDialog;
