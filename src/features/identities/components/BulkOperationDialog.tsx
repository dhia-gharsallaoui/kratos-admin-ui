import { LinearProgress } from "@mui/material";
import type { Identity } from "@ory/kratos-client";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useCallback, useState } from "react";
import { ActionBar } from "@/components/layout";
import { Alert, Box, FormDialog, Typography } from "@/components/ui";
import { deleteIdentity, patchIdentity } from "@/services/kratos/endpoints/identities";
import { deleteIdentitySessions } from "@/services/kratos/endpoints/sessions";

type BulkOperationType = "delete" | "deleteSessions" | "activate" | "deactivate";

interface BulkOperationDialogProps {
	open: boolean;
	onClose: () => void;
	operationType: BulkOperationType;
	identityIds: string[];
	identities: Identity[];
	onSuccess: () => void;
}

const OPERATION_CONFIG: Record<BulkOperationType, { title: string; warning: string; confirmLabel: string; processingLabel: string }> = {
	delete: {
		title: "Delete Identities",
		warning:
			"This will permanently delete the selected identities, including all their sessions, credentials, and recovery addresses. This action cannot be undone.",
		confirmLabel: "Delete",
		processingLabel: "Deleting",
	},
	deleteSessions: {
		title: "Delete Sessions",
		warning: "This will revoke all active sessions for the selected identities. Users will be logged out immediately.",
		confirmLabel: "Delete Sessions",
		processingLabel: "Deleting sessions for",
	},
	activate: {
		title: "Activate Identities",
		warning: "This will set the selected identities to the active state, allowing them to sign in.",
		confirmLabel: "Activate",
		processingLabel: "Activating",
	},
	deactivate: {
		title: "Deactivate Identities",
		warning: "This will set the selected identities to the inactive state. They will no longer be able to sign in.",
		confirmLabel: "Deactivate",
		processingLabel: "Deactivating",
	},
};

function getDisplayName(identity: Identity): string {
	const traits = identity.traits as any;
	return (
		(traits?.name?.first && traits?.name?.last ? `${traits.name.first} ${traits.name.last}` : null) ||
		traits?.email ||
		traits?.username ||
		`${identity.id.substring(0, 8)}...`
	);
}

async function executeOperation(type: BulkOperationType, identityId: string): Promise<void> {
	switch (type) {
		case "delete":
			await deleteIdentity({ id: identityId });
			break;
		case "deleteSessions":
			await deleteIdentitySessions(identityId);
			break;
		case "activate":
			await patchIdentity({
				id: identityId,
				jsonPatch: [{ op: "replace", path: "/state", value: "active" }],
			});
			break;
		case "deactivate":
			await patchIdentity({
				id: identityId,
				jsonPatch: [{ op: "replace", path: "/state", value: "inactive" }],
			});
			break;
	}
}

const INVALIDATION_KEYS: Record<BulkOperationType, string[][]> = {
	delete: [["identities"], ["identities-search"]],
	deleteSessions: [["identity-sessions"], ["sessions"]],
	activate: [["identities"], ["identities-search"]],
	deactivate: [["identities"], ["identities-search"]],
};

type Phase = "confirm" | "processing" | "complete";

export const BulkOperationDialog: React.FC<BulkOperationDialogProps> = ({ open, onClose, operationType, identityIds, identities, onSuccess }) => {
	const queryClient = useQueryClient();
	const [phase, setPhase] = useState<Phase>("confirm");
	const [progress, setProgress] = useState(0);
	const [succeeded, setSucceeded] = useState(0);
	const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);
	const [showErrors, setShowErrors] = useState(false);

	const config = OPERATION_CONFIG[operationType];
	const displayIdentities = identities.filter((i) => identityIds.includes(i.id));
	const shown = displayIdentities.slice(0, 5);
	const remaining = displayIdentities.length - shown.length;

	const resetState = useCallback(() => {
		setPhase("confirm");
		setProgress(0);
		setSucceeded(0);
		setErrors([]);
		setShowErrors(false);
	}, []);

	const handleClose = useCallback(() => {
		if (phase === "processing") return;
		resetState();
		onClose();
	}, [phase, resetState, onClose]);

	const handleConfirm = useCallback(async () => {
		setPhase("processing");
		setProgress(0);
		setSucceeded(0);
		setErrors([]);

		const total = identityIds.length;
		let successCount = 0;
		const errorList: Array<{ id: string; message: string }> = [];

		for (let i = 0; i < total; i++) {
			const id = identityIds[i];
			try {
				await executeOperation(operationType, id);
				successCount++;
			} catch (err: any) {
				errorList.push({
					id,
					message: err?.message || "Unknown error",
				});
			}
			setProgress(((i + 1) / total) * 100);
			setSucceeded(successCount);
			setErrors([...errorList]);
		}

		// Invalidate relevant queries
		const keys = INVALIDATION_KEYS[operationType];
		for (const key of keys) {
			queryClient.invalidateQueries({ queryKey: key });
		}

		setPhase("complete");

		if (errorList.length === 0) {
			onSuccess();
		}
	}, [identityIds, operationType, queryClient, onSuccess]);

	const handleDone = useCallback(() => {
		resetState();
		onClose();
	}, [resetState, onClose]);

	return (
		<FormDialog
			open={open}
			onClose={handleClose}
			title={config.title}
			titleColor={operationType === "delete" ? "error.main" : undefined}
			disableBackdropClick={phase === "processing"}
		>
			{phase === "confirm" && (
				<>
					<Alert variant="inline" severity={operationType === "activate" ? "info" : "warning"} sx={{ mb: 2 }}>
						{config.warning}
					</Alert>

					<Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 2 }}>
						<Typography variant="label" gutterBottom>
							{identityIds.length} {identityIds.length === 1 ? "identity" : "identities"} selected:
						</Typography>
						<Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
							{shown.map((identity) => (
								<li key={identity.id}>
									<Typography variant="body">
										{getDisplayName(identity)}{" "}
										<Typography component="span" variant="code">
											{identity.id.substring(0, 8)}...
										</Typography>
									</Typography>
								</li>
							))}
							{remaining > 0 && (
								<li>
									<Typography variant="body" color="text.secondary">
										+{remaining} more
									</Typography>
								</li>
							)}
						</Box>
					</Box>

					<Box sx={{ mt: 3 }}>
						<ActionBar
							align="right"
							primaryAction={{
								label: config.confirmLabel,
								onClick: handleConfirm,
							}}
							secondaryActions={[
								{
									label: "Cancel",
									onClick: handleClose,
								},
							]}
						/>
					</Box>
				</>
			)}

			{phase === "processing" && (
				<Box sx={{ py: 2 }}>
					<Typography variant="body" gutterBottom>
						{config.processingLabel}{" "}
						{progress < 100
							? `${Math.round(progress / (100 / identityIds.length))} of ${identityIds.length}`
							: `${identityIds.length} of ${identityIds.length}`}
						...
					</Typography>
					<LinearProgress variant="determinate" value={progress} sx={{ mt: 2, mb: 1 }} />
					<Typography variant="subheading" color="text.secondary">
						{Math.round(progress)}% complete
					</Typography>
				</Box>
			)}

			{phase === "complete" && (
				<>
					{errors.length === 0 ? (
						<Alert variant="inline" severity="success" sx={{ mb: 2 }}>
							Successfully processed {succeeded} {succeeded === 1 ? "identity" : "identities"}.
						</Alert>
					) : (
						<>
							<Alert variant="inline" severity="warning" sx={{ mb: 2 }}>
								{succeeded} succeeded, {errors.length} failed.
							</Alert>
							<Box sx={{ mt: 1 }}>
								<Typography
									variant="body"
									sx={{ cursor: "pointer", textDecoration: "underline", color: "primary.main" }}
									onClick={() => setShowErrors((v) => !v)}
								>
									{showErrors ? "Hide errors" : "Show errors"}
								</Typography>
								{showErrors && (
									<Box sx={{ mt: 1, p: 2, bgcolor: "grey.50", borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
										{errors.map((err) => (
											<Typography key={err.id} variant="body" sx={{ mb: 0.5 }}>
												<Typography component="span" variant="code">
													{err.id.substring(0, 8)}...
												</Typography>{" "}
												— {err.message}
											</Typography>
										))}
									</Box>
								)}
							</Box>
						</>
					)}

					<Box sx={{ mt: 3 }}>
						<ActionBar
							align="right"
							primaryAction={{
								label: "Close",
								onClick: handleDone,
							}}
						/>
					</Box>
				</>
			)}
		</FormDialog>
	);
};

export default BulkOperationDialog;
