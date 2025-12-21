import { Alert as MuiAlert, type AlertProps as MuiAlertProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

type CustomAlertVariant = "inline" | "banner" | "toast";

export interface AlertProps extends Omit<MuiAlertProps, "variant"> {
	variant?: CustomAlertVariant;
	muiVariant?: MuiAlertProps["variant"];
}

interface StyledAlertProps extends Omit<MuiAlertProps, "variant"> {
	$variant?: CustomAlertVariant;
}

const StyledAlert = styled(MuiAlert, {
	shouldForwardProp: (prop) => prop !== "$variant",
})<StyledAlertProps>(({ theme, $variant = "inline" }) => {
	const baseStyles = {
		borderRadius: "8px",
		fontWeight: 500,
	};

	if ($variant === "inline") {
		return {
			...baseStyles,
			marginBottom: theme.spacing(2),
		};
	}

	if ($variant === "banner") {
		return {
			...baseStyles,
			borderRadius: 0,
			marginBottom: theme.spacing(3),
			width: "100%",
		};
	}

	// toast variant
	return {
		...baseStyles,
		width: "100%",
	};
});

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ variant = "inline", muiVariant, severity, ...props }, ref) => {
	return <StyledAlert ref={ref} severity={severity} variant={muiVariant} $variant={variant} {...props} />;
});

Alert.displayName = "Alert";
