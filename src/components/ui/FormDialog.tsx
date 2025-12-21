import { Close } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import type React from "react";
import type { ReactNode } from "react";

export interface FormDialogAction {
	label: string;
	onClick: () => void;
	variant?: "text" | "outlined" | "contained";
	color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
	disabled?: boolean;
	loading?: boolean;
	startIcon?: ReactNode;
	endIcon?: ReactNode;
}

export interface FormDialogProps {
	// Basic props
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;

	// Dialog configuration
	maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
	fullWidth?: boolean;
	disableBackdropClick?: boolean;
	showCloseIcon?: boolean;

	// Error handling
	error?: string | null;
	errorSeverity?: "error" | "warning" | "info" | "success";

	// Actions
	actions?: FormDialogAction[];
	loading?: boolean;

	// Styling
	titleColor?: string;
	contentPadding?: number;
}

export const FormDialog: React.FC<FormDialogProps> = ({
	open,
	onClose,
	title,
	children,
	maxWidth = "sm",
	fullWidth = true,
	disableBackdropClick = false,
	showCloseIcon = true,
	error,
	errorSeverity = "error",
	actions = [],
	loading = false,
	titleColor,
	contentPadding = 3,
}) => {
	const handleClose = () => {
		if (!loading && !disableBackdropClick) {
			onClose();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth={maxWidth}
			fullWidth={fullWidth}
			slotProps={{
				paper: {
					sx: { minHeight: loading ? "200px" : "auto" },
				},
			}}
		>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography
						variant="h6"
						sx={{
							color: titleColor || "text.primary",
							fontWeight: 600,
						}}
					>
						{title}
					</Typography>
					{showCloseIcon && (
						<IconButton onClick={onClose} disabled={loading} size="small" sx={{ ml: 1 }}>
							<Close />
						</IconButton>
					)}
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: contentPadding }}>
				{error && (
					<Alert severity={errorSeverity} sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: "100px",
						}}
					>
						<CircularProgress />
					</Box>
				) : (
					children
				)}
			</DialogContent>

			{actions.length > 0 && (
				<DialogActions sx={{ p: 3, pt: 1 }}>
					{actions.map((action, index) => (
						<Button
							key={index}
							onClick={action.onClick}
							variant={action.variant || "text"}
							color={action.color || "primary"}
							disabled={action.disabled || loading}
							startIcon={action.loading ? <CircularProgress size={16} /> : action.startIcon}
							endIcon={action.endIcon}
						>
							{action.loading ? "Loading..." : action.label}
						</Button>
					))}
				</DialogActions>
			)}
		</Dialog>
	);
};

// Convenience component for confirmation dialogs
export interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	severity?: "error" | "warning" | "info";
	loading?: boolean;
	error?: string | null;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	severity = "warning",
	loading = false,
	error = null,
}) => {
	const getColor = () => {
		switch (severity) {
			case "error":
				return "error";
			case "warning":
				return "warning";
			default:
				return "primary";
		}
	};

	const getTitleColor = () => {
		switch (severity) {
			case "error":
				return "error.main";
			case "warning":
				return "warning.main";
			default:
				return undefined;
		}
	};

	const actions: FormDialogAction[] = [
		{
			label: cancelLabel,
			onClick: onClose,
			variant: "text",
			disabled: loading,
		},
		{
			label: confirmLabel,
			onClick: onConfirm,
			variant: "contained",
			color: getColor(),
			loading,
		},
	];

	return (
		<FormDialog
			open={open}
			onClose={onClose}
			title={title}
			actions={actions}
			error={error}
			loading={loading}
			titleColor={getTitleColor()}
			disableBackdropClick={loading}
		>
			<Typography variant="body1">{message}</Typography>
		</FormDialog>
	);
};

export default FormDialog;
