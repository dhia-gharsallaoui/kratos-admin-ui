"use client";

import {
	Apps as AppsIcon,
	ArrowBack as ArrowBackIcon,
	ContentCopy as CopyIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	MoreVert as MoreVertIcon,
	Security as SecurityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { StatusBadge } from "@/components";
import { ErrorState, LoadingState } from "@/components/feedback";
import { ActionBar, ProtectedPage } from "@/components/layout";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Menu,
	MenuItem,
	Skeleton,
	Tooltip,
	Typography,
} from "@/components/ui";
import {
	getClientType,
	getGrantTypeDisplayName,
	getResponseTypeDisplayName,
	useDeleteOAuth2Client,
	useOAuth2Client,
} from "@/features/oauth2-clients";
import { useCopyToClipboard, useDialog, useFormatters } from "@/hooks";

interface Props {
	params: Promise<{ id: string }>;
}

export default function OAuth2ClientDetailPage({ params }: Props) {
	const resolvedParams = use(params);
	const router = useRouter();
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const { copy, copiedField } = useCopyToClipboard();
	const { isOpen: deleteDialogOpen, open: openDeleteDialog, close: closeDeleteDialog } = useDialog();
	const { formatDateTime } = useFormatters();

	const { data: clientResponse, isLoading, error } = useOAuth2Client(resolvedParams.id);
	const deleteClientMutation = useDeleteOAuth2Client();

	const client = clientResponse?.data;
	const clientType = useMemo(() => (client ? getClientType(client) : null), [client]);

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const handleEdit = () => {
		router.push(`/clients/${resolvedParams.id}/edit`);
		handleMenuClose();
	};

	const handleDeleteClick = () => {
		openDeleteDialog();
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			await deleteClientMutation.mutateAsync(resolvedParams.id);
			router.push("/clients");
		} catch (error) {
			console.error("Failed to delete client:", error);
		}
	};

	const copyToClipboard = async (text: string, fieldName: string) => {
		await copy(text, fieldName);
	};

	const formatTimestamp = (timestamp?: string) => {
		if (!timestamp) return "Unknown";
		return formatDateTime(timestamp);
	};

	if (error) {
		return (
			<ProtectedPage>
				<Box sx={{ p: 3 }}>
					<ErrorState message={`Failed to load client: ${error.message}`} variant="page" />
				</Box>
			</ProtectedPage>
		);
	}

	return (
		<ProtectedPage>
			<Box sx={{ p: 3 }}>
				{/* Header */}
				<Box
					sx={{
						mb: 3,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<IconButton onClick={() => router.back()} aria-label="Go back">
							<ArrowBackIcon />
						</IconButton>
						<AppsIcon sx={{ fontSize: 32, color: "primary.main" }} />
						<Box>
							{isLoading ? (
								<LoadingState variant="inline" />
							) : (
								<>
									<Typography variant="heading" level="h1">
										{client?.client_name || "Unnamed Client"}
									</Typography>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mt: 1,
										}}
									>
										<Typography variant="code" color="secondary">
											{client?.client_id}
										</Typography>
										{client?.client_id && (
											<Tooltip content={copiedField === "client_id" ? "Copied!" : "Copy Client ID"}>
												<IconButton size="small" onClick={() => copyToClipboard(client.client_id!, "client_id")} aria-label="Copy client ID">
													<CopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										)}
										{clientType && <StatusBadge status={clientType.toLowerCase() === "public" ? "active" : "inactive"} label={clientType} />}
									</Box>
								</>
							)}
						</Box>
					</Box>

					{!isLoading && client && (
						<Box sx={{ display: "flex", gap: 1 }}>
							<Button variant="outlined" onClick={handleEdit}>
								<EditIcon style={{ marginRight: "0.5rem" }} />
								Edit
							</Button>
							<IconButton onClick={handleMenuClick} aria-label="More options">
								<MoreVertIcon />
							</IconButton>
						</Box>
					)}
				</Box>

				<Grid container spacing={3}>
					{/* Basic Information */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<Card sx={{ mb: 3 }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Basic Information
								</Typography>
								{isLoading ? (
									<Box>
										<Skeleton height={60} sx={{ mb: 1 }} />
										<Skeleton height={40} sx={{ mb: 1 }} />
										<Skeleton height={40} />
									</Box>
								) : (
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Client Name
											</Typography>
											<Typography variant="body1">{client?.client_name || "Not specified"}</Typography>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Owner
											</Typography>
											<Typography variant="body1">{client?.owner || "Not specified"}</Typography>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Client URI
											</Typography>
											<Typography variant="body1">
												{client?.client_uri ? (
													<a href={client.client_uri} target="_blank" rel="noopener noreferrer">
														{client.client_uri}
													</a>
												) : (
													"Not specified"
												)}
											</Typography>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Logo URI
											</Typography>
											<Typography variant="body1">
												{client?.logo_uri ? (
													<a href={client.logo_uri} target="_blank" rel="noopener noreferrer">
														{client.logo_uri}
													</a>
												) : (
													"Not specified"
												)}
											</Typography>
										</Grid>
									</Grid>
								)}
							</CardContent>
						</Card>

						{/* OAuth2 Configuration */}
						<Card sx={{ mb: 3 }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									OAuth2 Configuration
								</Typography>
								{isLoading ? (
									<Box>
										<Skeleton height={80} sx={{ mb: 2 }} />
										<Skeleton height={80} sx={{ mb: 2 }} />
										<Skeleton height={60} />
									</Box>
								) : (
									<Grid container spacing={3}>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary" gutterBottom>
												Grant Types
											</Typography>
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
												{client?.grant_types?.map((grantType) => (
													<Chip key={grantType} label={getGrantTypeDisplayName(grantType)} size="small" variant="outlined" />
												)) || <Typography variant="body2">None specified</Typography>}
											</Box>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="subtitle2" color="text.secondary" gutterBottom>
												Response Types
											</Typography>
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
												{client?.response_types?.map((responseType) => (
													<Chip
														key={responseType}
														label={getResponseTypeDisplayName(responseType)}
														size="small"
														variant="outlined"
														color="secondary"
													/>
												)) || <Typography variant="body2">None specified</Typography>}
											</Box>
										</Grid>
										<Grid size={{ xs: 12 }}>
											<Typography variant="subtitle2" color="text.secondary" gutterBottom>
												Scopes
											</Typography>
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
												{client?.scope ? (
													client.scope
														.split(" ")
														.filter((s) => s.trim())
														.map((scope) => <Chip key={scope} label={scope} size="small" color="primary" variant="outlined" />)
												) : (
													<Typography variant="body2">None specified</Typography>
												)}
											</Box>
										</Grid>
									</Grid>
								)}
							</CardContent>
						</Card>

						{/* Redirect URIs */}
						<Card sx={{ mb: 3 }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Redirect URIs
								</Typography>
								{isLoading ? (
									<Skeleton height={120} />
								) : client?.redirect_uris?.length ? (
									<List dense>
										{client.redirect_uris.map((uri, index) => (
											<ListItem
												key={index}
												secondaryAction={
													<Tooltip title={copiedField === `redirect_${index}` ? "Copied!" : "Copy URI"}>
														<IconButton size="small" onClick={() => copyToClipboard(uri, `redirect_${index}`)}>
															<CopyIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												}
											>
												<ListItemText primary={uri} />
											</ListItem>
										))}
									</List>
								) : (
									<Typography variant="body2" color="text.secondary">
										No redirect URIs configured
									</Typography>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Sidebar */}
					<Grid size={{ xs: 12, lg: 4 }}>
						{/* Client Credentials */}
						{client?.client_secret && (
							<Card sx={{ mb: 3 }}>
								<CardContent>
									<Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<SecurityIcon />
										Client Credentials
									</Typography>
									<Box sx={{ mb: 2 }}>
										<Typography variant="subtitle2" color="text.secondary">
											Client ID
										</Typography>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
												{client.client_id}
											</Typography>
											<Tooltip title={copiedField === "client_id_sidebar" ? "Copied!" : "Copy"}>
												<IconButton size="small" onClick={() => copyToClipboard(client.client_id!, "client_id_sidebar")}>
													<CopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>
									<Box>
										<Typography variant="subtitle2" color="text.secondary">
											Client Secret
										</Typography>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
												{"•".repeat(32)}
											</Typography>
											<Tooltip title="Client secret is hidden for security">
												<IconButton size="small" disabled>
													<CopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
										<Typography variant="caption" color="text.secondary">
											Secret cannot be displayed for security reasons
										</Typography>
									</Box>
								</CardContent>
							</Card>
						)}

						{/* Advanced Settings */}
						<Card sx={{ mb: 3 }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Advanced Settings
								</Typography>
								{isLoading ? (
									<Skeleton height={200} />
								) : (
									<Box>
										<Box sx={{ mb: 2 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Subject Type
											</Typography>
											<Typography variant="body2">{client?.subject_type || "public"}</Typography>
										</Box>
										<Box sx={{ mb: 2 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Token Endpoint Auth Method
											</Typography>
											<Typography variant="body2">{client?.token_endpoint_auth_method || "client_secret_basic"}</Typography>
										</Box>
										{client?.userinfo_signed_response_alg && (
											<Box sx={{ mb: 2 }}>
												<Typography variant="subtitle2" color="text.secondary">
													UserInfo Signed Response Algorithm
												</Typography>
												<Typography variant="body2">{client.userinfo_signed_response_alg}</Typography>
											</Box>
										)}
									</Box>
								)}
							</CardContent>
						</Card>

						{/* Metadata */}
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Metadata
								</Typography>
								{isLoading ? (
									<Skeleton height={120} />
								) : (
									<Box>
										<Box sx={{ mb: 2 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Created
											</Typography>
											<Typography variant="body2">{formatTimestamp(client?.created_at)}</Typography>
										</Box>
										<Box sx={{ mb: 2 }}>
											<Typography variant="subtitle2" color="text.secondary">
												Last Updated
											</Typography>
											<Typography variant="body2">{formatTimestamp(client?.updated_at)}</Typography>
										</Box>
										{client?.audience?.length && (
											<Box>
												<Typography variant="subtitle2" color="text.secondary" gutterBottom>
													Audience
												</Typography>
												<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
													{client.audience.map((aud, index) => (
														<Chip key={index} label={aud} size="small" variant="outlined" />
													))}
												</Box>
											</Box>
										)}
									</Box>
								)}
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Context Menu */}
				<Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
					<MenuItem onClick={handleEdit}>
						<EditIcon sx={{ mr: 1 }} fontSize="small" />
						Edit Client
					</MenuItem>
					<MenuItem onClick={handleDeleteClick}>
						<DeleteIcon sx={{ mr: 1 }} fontSize="small" />
						Delete Client
					</MenuItem>
				</Menu>

				{/* Delete Confirmation Dialog */}
				<Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} title="Delete OAuth2 Client">
					<DialogContent>
						<Typography>
							Are you sure you want to delete the client &quot;
							{client?.client_name || client?.client_id}&quot;? This action cannot be undone and will invalidate all tokens issued to this client.
						</Typography>
					</DialogContent>
					<DialogActions>
						<ActionBar
							align="right"
							primaryAction={{
								label: deleteClientMutation.isPending ? "Deleting..." : "Delete",
								onClick: handleDeleteConfirm,
								disabled: deleteClientMutation.isPending,
							}}
							secondaryActions={[
								{
									label: "Cancel",
									onClick: closeDeleteDialog,
								},
							]}
						/>
					</DialogActions>
				</Dialog>

				{/* Error Display */}
				{deleteClientMutation.error && (
					<Alert severity="error" sx={{ mt: 2 }}>
						Failed to delete client: {deleteClientMutation.error.message}
					</Alert>
				)}
			</Box>
		</ProtectedPage>
	);
}
