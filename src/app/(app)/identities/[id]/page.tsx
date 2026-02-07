"use client";

import { ArrowBack, Block, CheckCircleOutline, Delete, DeleteSweep, Edit, Key, Link as LinkIcon, Lock, Person, Refresh } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github, vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { StatusBadge } from "@/components";
import { FieldDisplay } from "@/components/display";
import { LoadingState } from "@/components/feedback";
import { ActionBar, FlexBox, PageHeader, ProtectedPage, SectionCard } from "@/components/layout";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	Divider,
	DottedLoader,
	Grid,
	IconButton,
	Tooltip,
	Typography,
} from "@/components/ui";
import { UserRole } from "@/features/auth";
import { CredentialDeleteDialog } from "@/features/identities/components/CredentialDeleteDialog";
import { IdentityDeleteDialog } from "@/features/identities/components/IdentityDeleteDialog";
import { IdentityEditModal } from "@/features/identities/components/IdentityEditModal";
import { IdentityRecoveryDialog } from "@/features/identities/components/IdentityRecoveryDialog";
import { useIdentity, usePatchIdentity } from "@/features/identities/hooks";
import { SessionDetailDialog } from "@/features/sessions/components/SessionDetailDialog";
import { SessionsTable } from "@/features/sessions/components/SessionsTable";
import { useDeleteIdentitySessions, useIdentitySessions } from "@/features/sessions/hooks";
import { useDialog } from "@/hooks";
import { formatDate } from "@/lib/date-utils";

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

const NON_DELETABLE_CREDENTIALS = new Set(["password", "passkey", "code"]);

export default function IdentityDetailPage() {
	const theme = useTheme();
	const params = useParams();
	const router = useRouter();
	const identityId = params.id as string;
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
	const [pendingState, setPendingState] = useState<"active" | "inactive">("active");
	const [credentialToDelete, setCredentialToDelete] = useState<{ type: string; identifier?: string } | null>(null);

	const { isOpen: editModalOpen, open: openEditModal, close: closeEditModal } = useDialog();
	const { isOpen: deleteDialogOpen, open: openDeleteDialog, close: closeDeleteDialog } = useDialog();
	const { isOpen: recoveryDialogOpen, open: openRecoveryDialog, close: closeRecoveryDialog } = useDialog();
	const { isOpen: deleteSessionsDialogOpen, open: openDeleteSessionsDialog, close: closeDeleteSessionsDialog } = useDialog();
	const { isOpen: stateDialogOpen, open: openStateDialog, close: closeStateDialog } = useDialog();

	const { data: identity, isLoading, isError, error: _, refetch } = useIdentity(identityId);
	const patchIdentityMutation = usePatchIdentity();

	// Sessions hooks
	const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useIdentitySessions(identityId);
	const deleteSessionsMutation = useDeleteIdentitySessions();

	const handleBack = () => {
		router.push("/identities");
	};

	const handleEdit = () => {
		openEditModal();
	};

	const handleEditSuccess = () => {
		refetch(); // Refresh identity data after successful edit
	};

	const handleDelete = () => {
		openDeleteDialog();
	};

	const handleDeleteSuccess = () => {
		// Navigate back to identities list after successful delete
		router.push("/identities");
	};

	const handleRecover = () => {
		openRecoveryDialog();
	};

	const handleDeleteAllSessions = () => {
		openDeleteSessionsDialog();
	};

	const handleDeleteAllSessionsConfirm = () => {
		deleteSessionsMutation.mutate(identityId, {
			onSuccess: () => {
				closeDeleteSessionsDialog();
			},
		});
	};

	const handleStateToggle = () => {
		const newState = identity?.state === "active" ? "inactive" : "active";
		setPendingState(newState);
		openStateDialog();
	};

	const handleStateToggleConfirm = () => {
		patchIdentityMutation.mutate(
			{ id: identityId, jsonPatch: [{ op: "replace" as const, path: "/state", value: pendingState }] },
			{
				onSuccess: () => {
					closeStateDialog();
					refetch();
				},
			},
		);
	};

	const handleSessionClick = (sessionId: string) => {
		setSelectedSessionId(sessionId);
	};

	const handleSessionDialogClose = () => {
		setSelectedSessionId(null);
	};

	const handleSessionUpdated = () => {
		refetchSessions();
	};

	if (isLoading) {
		return (
			<ProtectedPage requiredRole={UserRole.ADMIN}>
				<LoadingState variant="page" />
			</ProtectedPage>
		);
	}

	if (isError || !identity) {
		return (
			<ProtectedPage requiredRole={UserRole.ADMIN}>
				<Box sx={{ p: 3 }}>
					<Typography variant="heading" level="h1" color="error">
						Identity Not Found
					</Typography>
					<Typography variant="body" style={{ marginBottom: "1.5rem" }}>
						The identity with ID &quot;{identityId}&quot; could not be found.
					</Typography>
					<Button variant="primary" onClick={handleBack}>
						Back to Identities
					</Button>
				</Box>
			</ProtectedPage>
		);
	}

	const traits = identity.traits as Record<string, unknown>;

	return (
		<ProtectedPage requiredRole={UserRole.ADMIN}>
			<Box sx={{ p: 3 }}>
				<PageHeader
					title={
						<FlexBox align="center" gap={2}>
							<IconButton onClick={handleBack} aria-label="Go back">
								<ArrowBack />
							</IconButton>
							<Box>
								<Typography variant="heading" level="h1">
									Identity Details
								</Typography>
								<Typography variant="code" color="secondary">
									{identityId}
								</Typography>
							</Box>
						</FlexBox>
					}
					actions={
						<FlexBox gap={1}>
							<Tooltip content="Refresh">
								<IconButton onClick={() => refetch()} aria-label="Refresh">
									<Refresh />
								</IconButton>
							</Tooltip>
							<Button variant="outlined" onClick={handleEdit}>
								<Edit style={{ marginRight: "0.5rem" }} />
								Edit
							</Button>
							<Button variant="outlined" onClick={handleRecover}>
								<LinkIcon style={{ marginRight: "0.5rem" }} />
								Recover
							</Button>
							<Button
								variant={identity.state === "active" ? "outlined" : "primary"}
								onClick={handleStateToggle}
								disabled={patchIdentityMutation.isPending}
							>
								{identity.state === "active" ? (
									<>
										<Block style={{ marginRight: "0.5rem" }} />
										Deactivate
									</>
								) : (
									<>
										<CheckCircleOutline style={{ marginRight: "0.5rem" }} />
										Activate
									</>
								)}
							</Button>
							<Button variant="danger" onClick={handleDelete}>
								<Delete style={{ marginRight: "0.5rem" }} />
								Delete
							</Button>
						</FlexBox>
					}
				/>

				<Grid container spacing={3}>
					{/* Basic Information */}
					<Grid size={{ xs: 12, md: 6 }}>
						<SectionCard title="Basic Information">
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<Box>
									<Typography variant="subtitle2" color="text.secondary" gutterBottom>
										Status
									</Typography>
									<StatusBadge status={identity.state === "active" ? "active" : "inactive"} label={identity.state || "active"} />
								</Box>
								<FieldDisplay label="Schema ID" value={identity.schema_id} valueType="code" copyable />
								<FieldDisplay label="Created At" value={formatDate(identity.created_at || "")} />
								<FieldDisplay label="Updated At" value={formatDate(identity.updated_at || "")} />
							</Box>
						</SectionCard>
					</Grid>

					{/* Traits */}
					<Grid size={{ xs: 12, md: 6 }}>
						<SectionCard title="Traits" emptyMessage={!traits || Object.keys(traits).length === 0 ? "No traits available" : undefined}>
							{traits && Object.keys(traits).length > 0 && (
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									{Object.entries(traits).map(([key, value]) => (
										<FieldDisplay
											key={key}
											label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
											value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
											valueType={typeof value === "object" ? "code" : "text"}
										/>
									))}
								</Box>
							)}
						</SectionCard>
					</Grid>

					{/* Public Metadata */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Public Metadata
								</Typography>
								<Divider sx={{ mb: 2 }} />

								{identity.metadata_public && Object.keys(identity.metadata_public).length > 0 ? (
									<Box
										sx={{
											borderRadius: 1,
											overflow: "auto",
											maxHeight: "400px",
											background: theme.palette.background.default,
										}}
									>
										<SyntaxHighlighter
											language="json"
											style={theme.palette.mode === "dark" ? vs2015 : github}
											customStyle={{
												margin: 0,
												padding: "1rem",
												fontSize: "0.875rem",
												background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
												borderRadius: "var(--radius)",
												lineHeight: 1.4,
												border: `1px solid ${theme.palette.divider}`,
											}}
											showLineNumbers={false}
											wrapLongLines={true}
										>
											{JSON.stringify(identity.metadata_public, null, 2)}
										</SyntaxHighlighter>
									</Box>
								) : (
									<Typography variant="body2" color="text.secondary">
										No public metadata available
									</Typography>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Admin Metadata */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Admin Metadata
								</Typography>
								<Divider sx={{ mb: 2 }} />

								{identity.metadata_admin && Object.keys(identity.metadata_admin).length > 0 ? (
									<Box
										sx={{
											borderRadius: 1,
											overflow: "auto",
											maxHeight: "400px",
											background: theme.palette.background.default,
										}}
									>
										<SyntaxHighlighter
											language="json"
											style={theme.palette.mode === "dark" ? vs2015 : github}
											customStyle={{
												margin: 0,
												padding: "1rem",
												fontSize: "0.875rem",
												background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
												borderRadius: "var(--radius)",
												lineHeight: 1.4,
												border: `1px solid ${theme.palette.divider}`,
											}}
											showLineNumbers={false}
											wrapLongLines={true}
										>
											{JSON.stringify(identity.metadata_admin, null, 2)}
										</SyntaxHighlighter>
									</Box>
								) : (
									<Typography variant="body2" color="text.secondary">
										No admin metadata available
									</Typography>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Credentials Section */}
					<Grid size={{ xs: 12 }}>
						<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
							<CardContent>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 2,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Key color="primary" />
										<Typography variant="h6">Credentials</Typography>
									</Box>
								</Box>
								<Divider sx={{ mb: 2 }} />

								{identity.credentials && Object.keys(identity.credentials).length > 0 ? (
									<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
										{Object.entries(identity.credentials).flatMap(([type, credential]) => {
											const needsIdentifier = type === "oidc" || type === "saml";
											const identifiers = credential.identifiers || [];

											// For OIDC/SAML, render one row per identifier
											if (needsIdentifier && identifiers.length > 0) {
												return identifiers.map((identifier) => (
													<Box
														key={`${type}-${identifier}`}
														sx={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															p: 1.5,
															border: 1,
															borderColor: "divider",
															borderRadius: 1,
														}}
													>
														<Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flex: 1 }}>
															<Chip label={CREDENTIAL_TYPE_LABELS[type] || type} variant="tag" />
															<Typography
																variant="body2"
																sx={{
																	fontFamily: "monospace",
																	fontSize: "0.8rem",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{identifier}
															</Typography>
															{credential.created_at && (
																<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: "auto" }}>
																	{formatDate(credential.created_at)}
																</Typography>
															)}
														</Box>
														<Tooltip content={`Delete ${CREDENTIAL_TYPE_LABELS[type] || type} credential`}>
															<IconButton
																size="small"
																sx={{ ml: 1, color: "error.main" }}
																onClick={() => setCredentialToDelete({ type, identifier })}
															>
																<Delete fontSize="small" />
															</IconButton>
														</Tooltip>
													</Box>
												));
											}

											// For other types, render one row per credential
											return [
												<Box
													key={type}
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
														p: 1.5,
														border: 1,
														borderColor: "divider",
														borderRadius: 1,
													}}
												>
													<Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flex: 1 }}>
														<Chip label={CREDENTIAL_TYPE_LABELS[type] || type} variant="tag" />
														{identifiers.length > 0 && (
															<Typography
																variant="body2"
																sx={{
																	fontFamily: "monospace",
																	fontSize: "0.8rem",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{identifiers.join(", ")}
															</Typography>
														)}
														{credential.created_at && (
															<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: "auto" }}>
																{formatDate(credential.created_at)}
															</Typography>
														)}
													</Box>
													{NON_DELETABLE_CREDENTIALS.has(type) ? (
														<Tooltip content="Cannot be deleted via API">
															<Lock sx={{ ml: 1, color: "text.disabled", fontSize: "1.2rem" }} />
														</Tooltip>
													) : (
														<Tooltip content={`Delete ${CREDENTIAL_TYPE_LABELS[type] || type} credential`}>
															<IconButton size="small" sx={{ ml: 1, color: "error.main" }} onClick={() => setCredentialToDelete({ type })}>
																<Delete fontSize="small" />
															</IconButton>
														</Tooltip>
													)}
												</Box>,
											];
										})}
									</Box>
								) : (
									<Box sx={{ textAlign: "center", py: 4 }}>
										<Typography variant="body2" color="text.secondary">
											No credentials found for this identity
										</Typography>
									</Box>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Sessions Section */}
					<Grid size={{ xs: 12 }}>
						<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
							<CardContent>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 2,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Person color="primary" />
										<Typography variant="h6">Sessions</Typography>
									</Box>
									<Box sx={{ display: "flex", gap: 1 }}>
										<Tooltip title="Refresh Sessions">
											<IconButton onClick={() => refetchSessions()} size="small">
												<Refresh />
											</IconButton>
										</Tooltip>
										<Button
											variant="danger"
											size="small"
											startIcon={<DeleteSweep />}
											onClick={handleDeleteAllSessions}
											disabled={deleteSessionsMutation.isPending || sessionsLoading || !sessionsData?.data?.length}
										>
											Delete All Sessions
										</Button>
									</Box>
								</Box>
								<Divider sx={{ mb: 2 }} />

								{sessionsError ? (
									<Alert severity="error" sx={{ mb: 2 }}>
										Failed to load sessions: {sessionsError.message}
									</Alert>
								) : sessionsLoading ? (
									<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
										<DottedLoader />
									</Box>
								) : !sessionsData?.data?.length ? (
									<Box sx={{ textAlign: "center", py: 4 }}>
										<Typography variant="body2" color="text.secondary">
											No active sessions found for this identity
										</Typography>
									</Box>
								) : (
									<>
										<SessionsTable
											key={sessionsData.headers?.etag || "identity-sessions"} // Force re-render when data updates
											sessions={sessionsData.data}
											isLoading={false}
											isFetchingNextPage={false}
											searchQuery=""
											onSessionClick={handleSessionClick}
										/>
										<Box sx={{ mt: 2, textAlign: "center" }}>
											<Typography variant="body2" color="text.secondary">
												Showing {sessionsData.data.length} session(s) for this identity
											</Typography>
										</Box>
									</>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Raw JSON */}
					<Grid size={{ xs: 12 }}>
						<Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Raw Data
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Box
									sx={{
										borderRadius: 1,
										overflow: "auto",
										maxHeight: "60vh",
										background: theme.palette.background.default,
									}}
								>
									<SyntaxHighlighter
										language="json"
										style={theme.palette.mode === "dark" ? vs2015 : github}
										customStyle={{
											margin: 0,
											padding: "1.5rem",
											fontSize: "0.875rem",
											background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
											borderRadius: "var(--radius)",
											lineHeight: 1.5,
											border: `1px solid ${theme.palette.divider}`,
										}}
										showLineNumbers={true}
										lineNumberStyle={{
											color: theme.palette.text.secondary,
											paddingRight: "1rem",
											minWidth: "2rem",
											userSelect: "none",
										}}
										wrapLongLines={true}
									>
										{JSON.stringify(identity, null, 2)}
									</SyntaxHighlighter>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Edit Modal */}
				<IdentityEditModal open={editModalOpen} onClose={closeEditModal} identity={identity} onSuccess={handleEditSuccess} />

				{/* Recovery Dialog */}
				<IdentityRecoveryDialog open={recoveryDialogOpen} onClose={closeRecoveryDialog} identity={identity} />

				{/* Delete Dialog */}
				<IdentityDeleteDialog open={deleteDialogOpen} onClose={closeDeleteDialog} identity={identity} onSuccess={handleDeleteSuccess} />

				{/* Credential Delete Dialog */}
				{credentialToDelete && (
					<CredentialDeleteDialog
						open={true}
						onClose={() => setCredentialToDelete(null)}
						identityId={identityId}
						credentialType={credentialToDelete.type}
						identifier={credentialToDelete.identifier}
						onSuccess={() => refetch()}
					/>
				)}

				{/* Delete All Sessions Dialog */}
				<Dialog open={deleteSessionsDialogOpen} onClose={closeDeleteSessionsDialog} title="Delete All Sessions" maxWidth="sm">
					<Alert severity="warning" style={{ marginBottom: "1rem" }}>
						This action will revoke all active sessions for this identity. The user will be logged out from all devices.
					</Alert>
					<Typography variant="body">Are you sure you want to delete all sessions for this identity? This action cannot be undone.</Typography>
					{deleteSessionsMutation.error && (
						<Alert severity="error" style={{ marginTop: "1rem" }}>
							Failed to delete sessions: {deleteSessionsMutation.error.message}
						</Alert>
					)}
					<DialogActions>
						<ActionBar
							align="right"
							primaryAction={{
								label: deleteSessionsMutation.isPending ? "Deleting..." : "Delete All Sessions",
								onClick: handleDeleteAllSessionsConfirm,
								disabled: deleteSessionsMutation.isPending,
							}}
							secondaryActions={[
								{
									label: "Cancel",
									onClick: closeDeleteSessionsDialog,
								},
							]}
						/>
					</DialogActions>
				</Dialog>

				{/* State Toggle Confirmation Dialog */}
				<Dialog
					open={stateDialogOpen}
					onClose={closeStateDialog}
					title={pendingState === "active" ? "Activate Identity" : "Deactivate Identity"}
					maxWidth="sm"
				>
					<Alert severity="warning" style={{ marginBottom: "1rem" }}>
						{pendingState === "inactive"
							? "Deactivating this identity will prevent the user from signing in. All active sessions will remain until they expire."
							: "Activating this identity will allow the user to sign in again."}
					</Alert>
					<Typography variant="body">Are you sure you want to {pendingState === "active" ? "activate" : "deactivate"} this identity?</Typography>
					{patchIdentityMutation.error && (
						<Alert severity="error" style={{ marginTop: "1rem" }}>
							Failed to update identity state: {patchIdentityMutation.error.message}
						</Alert>
					)}
					<DialogActions>
						<ActionBar
							align="right"
							primaryAction={{
								label: patchIdentityMutation.isPending ? "Updating..." : pendingState === "active" ? "Activate" : "Deactivate",
								onClick: handleStateToggleConfirm,
								disabled: patchIdentityMutation.isPending,
							}}
							secondaryActions={[
								{
									label: "Cancel",
									onClick: closeStateDialog,
								},
							]}
						/>
					</DialogActions>
				</Dialog>

				{/* Session Detail Dialog */}
				{selectedSessionId && (
					<SessionDetailDialog open={true} onClose={handleSessionDialogClose} sessionId={selectedSessionId} onSessionUpdated={handleSessionUpdated} />
				)}
			</Box>
		</ProtectedPage>
	);
}
