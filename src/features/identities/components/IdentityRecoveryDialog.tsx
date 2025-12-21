import { ContentCopy, Link as LinkIcon } from "@mui/icons-material";
import type { Identity } from "@ory/kratos-client";
import type React from "react";
import { useState } from "react";
import {
	ActionBar,
	Alert,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DottedLoader,
	IconButton,
	InputAdornment,
	Snackbar,
	TextField,
	Typography,
} from "@/components/ui";
import { createRecoveryLink } from "@/services/kratos";

interface IdentityRecoveryDialogProps {
	open: boolean;
	onClose: () => void;
	identity: Identity | null;
}

export const IdentityRecoveryDialog: React.FC<IdentityRecoveryDialogProps> = ({ open, onClose, identity }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
	const [showCopySuccess, setShowCopySuccess] = useState(false);

	const handleGenerateRecoveryLink = async () => {
		if (!identity?.id) return;

		setLoading(true);
		setError(null);
		setRecoveryLink(null);

		try {
			const response = await createRecoveryLink(identity.id);

			setRecoveryLink(response.data.recovery_link);
		} catch (err: any) {
			console.error("Error generating recovery link:", err);
			setError(err.response?.data?.error?.message || "Failed to generate recovery link. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCopyToClipboard = async () => {
		if (!recoveryLink) return;

		try {
			await navigator.clipboard.writeText(recoveryLink);
			setShowCopySuccess(true);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	const handleClose = () => {
		setRecoveryLink(null);
		setError(null);
		setLoading(false);
		onClose();
	};

	if (!identity) return null;

	const traits = identity.traits as any;
	const email = traits?.email || "N/A";

	return (
		<>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				title={
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<LinkIcon color="primary" />
						<Typography variant="heading" size="lg">
							Generate Recovery Link
						</Typography>
					</Box>
				}
				slotProps={{
					paper: {
						sx: {
							borderRadius: "var(--radius)",
						},
					},
				}}
			>
				<DialogContent sx={{ p: 3 }}>
					<Box sx={{ mb: 3 }}>
						<Typography variant="body" gutterBottom>
							Generate a recovery link for this identity that can be used to reset their password or recover their account.
						</Typography>
						<Typography variant="label">
							<strong>Identity:</strong> {email} ({identity.id.substring(0, 8)}
							...)
						</Typography>
					</Box>

					{error && (
						<Alert variant="inline" severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					)}

					{loading && (
						<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
							<DottedLoader variant="inline" />
						</Box>
					)}

					{recoveryLink && (
						<Box sx={{ mb: 3 }}>
							<Alert variant="inline" severity="success" sx={{ mb: 2 }}>
								Recovery link generated successfully! The link is valid for a limited time.
							</Alert>

							<TextField
								fullWidth
								label="Recovery Link"
								value={recoveryLink}
								multiline
								rows={3}
								variant="readonly"
								slotProps={{
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton onClick={handleCopyToClipboard} variant="action" size="small" title="Copy to clipboard">
													<ContentCopy />
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								sx={{
									"& .MuiInputBase-input": {
										fontFamily: "monospace",
										fontSize: "0.875rem",
									},
								}}
							/>

							<Typography variant="label" sx={{ mt: 1, display: "block", opacity: 0.7 }}>
								Send this link to the user via a secure channel. The link will expire after a short period for security.
							</Typography>
						</Box>
					)}
				</DialogContent>

				<DialogActions sx={{ p: 3, borderTop: "1px solid var(--border)" }}>
					<ActionBar
						primaryAction={
							!recoveryLink
								? {
										label: "Generate Recovery Link",
										onClick: handleGenerateRecoveryLink,
										icon: <LinkIcon />,
										loading: loading,
									}
								: undefined
						}
						secondaryActions={[
							{
								label: "Close",
								onClick: handleClose,
								variant: "outlined",
							},
						]}
					/>
				</DialogActions>
			</Dialog>

			{/* Copy success snackbar */}
			<Snackbar
				open={showCopySuccess}
				autoHideDuration={2000}
				onClose={() => setShowCopySuccess(false)}
				message="Recovery link copied to clipboard"
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>
		</>
	);
};

export default IdentityRecoveryDialog;
