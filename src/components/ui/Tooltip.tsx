import { Tooltip as MuiTooltip, type TooltipProps as MuiTooltipProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { alpha, shadows } from "@/theme";

export interface TooltipProps extends Omit<MuiTooltipProps, "enterDelay" | "title"> {
	variant?: "default" | "info" | "help";
	delay?: "short" | "medium" | "long";
	content?: string;
	title?: string;
}

const StyledTooltip = styled(({ className, ...props }: MuiTooltipProps) => <MuiTooltip {...props} classes={{ popper: className }} />)(
	({ theme }) => ({
		"& .MuiTooltip-tooltip": {
			backgroundColor: theme.palette.mode === "dark" ? "rgba(97, 97, 97, 0.95)" : "rgba(33, 33, 33, 0.95)",
			color: "#ffffff",
			fontSize: "0.875rem",
			padding: "8px 12px",
			borderRadius: "6px",
			maxWidth: 300,
			fontWeight: 500,
		},
		"& .MuiTooltip-arrow": {
			color: theme.palette.mode === "dark" ? "rgba(97, 97, 97, 0.95)" : "rgba(33, 33, 33, 0.95)",
		},
	}),
);

const InfoTooltip = styled(({ className, ...props }: MuiTooltipProps) => <MuiTooltip {...props} classes={{ popper: className }} />)(
	({ theme: _theme }) => ({
		"& .MuiTooltip-tooltip": {
			backgroundColor: alpha.primary[95],
			color: "#ffffff",
			fontSize: "0.875rem",
			padding: "10px 14px",
			borderRadius: "8px",
			maxWidth: 300,
			fontWeight: 500,
			boxShadow: shadows.md,
		},
		"& .MuiTooltip-arrow": {
			color: alpha.primary[95],
		},
	}),
);

const HelpTooltip = styled(({ className, ...props }: MuiTooltipProps) => <MuiTooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
	"& .MuiTooltip-tooltip": {
		backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#ffffff",
		color: theme.palette.text.primary,
		fontSize: "0.875rem",
		padding: "12px 16px",
		borderRadius: "8px",
		maxWidth: 350,
		border: `1px solid ${theme.palette.divider}`,
		boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
	},
	"& .MuiTooltip-arrow": {
		color: theme.palette.mode === "dark" ? "#424242" : "#ffffff",
		"&::before": {
			border: `1px solid ${theme.palette.divider}`,
		},
	},
}));

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
	({ variant = "default", delay = "medium", content, children, ...props }, ref) => {
		const delayMap = {
			short: 200,
			medium: 500,
			long: 800,
		};

		const TooltipComponent = variant === "info" ? InfoTooltip : variant === "help" ? HelpTooltip : StyledTooltip;

		return (
			<TooltipComponent ref={ref} enterDelay={delayMap[delay]} arrow title={content || props.title} {...props}>
				{children}
			</TooltipComponent>
		);
	},
);

Tooltip.displayName = "Tooltip";
