import { Close } from "@mui/icons-material";
import {
	Box,
	IconButton,
	Dialog as MuiDialog,
	DialogActions as MuiDialogActions,
	DialogContent as MuiDialogContent,
	type DialogProps as MuiDialogProps,
	DialogTitle as MuiDialogTitle,
	Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { gradients } from "@/theme";

export interface DialogProps extends Omit<MuiDialogProps, "title"> {
	variant?: "default" | "form" | "confirm" | "detail";
	gradient?: boolean;
	onClose?: () => void;
	title?: React.ReactNode;
	actions?: React.ReactNode;
}

const StyledDialog = styled(MuiDialog)(({ theme: _theme }) => ({
	"& .MuiDialog-paper": {
		borderRadius: "12px",
		boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
	},
}));

const StyledDialogTitle = styled(MuiDialogTitle)<{ $gradient?: boolean }>(({ theme, $gradient }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: theme.spacing(2, 3),
	borderBottom: `1px solid ${theme.palette.divider}`,
	...($gradient && {
		background: gradients.normal,
		color: "#ffffff",
	}),
}));

const StyledDialogContent = styled(MuiDialogContent)(({ theme }) => ({
	padding: theme.spacing(3),
}));

const StyledDialogActions = styled(MuiDialogActions)(({ theme }) => ({
	padding: theme.spacing(2, 3),
	borderTop: `1px solid ${theme.palette.divider}`,
	gap: theme.spacing(1),
}));

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
	({ variant = "default", gradient = false, title, onClose, actions, children, ...props }, ref) => {
		return (
			<StyledDialog ref={ref} onClose={onClose} {...props}>
				{title && (
					<StyledDialogTitle $gradient={gradient || undefined}>
						{typeof title === "string" ? (
							<Typography variant="h6" component="span" fontWeight={600}>
								{title}
							</Typography>
						) : (
							<Box component="span">{title}</Box>
						)}
						{onClose && (
							<IconButton
								onClick={onClose}
								size="small"
								sx={{
									color: gradient ? "#ffffff" : "inherit",
								}}
							>
								<Close />
							</IconButton>
						)}
					</StyledDialogTitle>
				)}
				{children}
				{actions && <StyledDialogActions>{actions}</StyledDialogActions>}
			</StyledDialog>
		);
	},
);

Dialog.displayName = "Dialog";

// Export sub-components with custom styling
export const DialogTitle = StyledDialogTitle;
export const DialogContent = StyledDialogContent;
export const DialogActions = StyledDialogActions;
