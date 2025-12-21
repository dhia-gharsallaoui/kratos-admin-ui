import { IconButton as MuiIconButton, type IconButtonProps as MuiIconButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { alpha, gradientColors } from "@/theme";

export interface IconButtonProps extends Omit<MuiIconButtonProps, "variant" | "component"> {
	variant?: "action" | "default";
	component?: React.ElementType;
	href?: string;
}

interface StyledIconButtonProps extends Omit<MuiIconButtonProps, "variant"> {
	$variant?: "action" | "default";
}

const StyledIconButton = styled(MuiIconButton, {
	shouldForwardProp: (prop) => prop !== "$variant",
})<StyledIconButtonProps>(({ theme: _theme, $variant = "default" }) => {
	const baseStyles = {
		transition: "all 0.3s ease",
	};

	if ($variant === "action") {
		return {
			...baseStyles,
			background: alpha.primary[10],
			"&:hover": {
				background: alpha.primary[20],
				transform: "scale(1.05)",
			},
			"& .MuiSvgIcon-root": {
				color: gradientColors.primary,
			},
		};
	}

	// default variant
	return {
		...baseStyles,
	};
});

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ variant = "default", children, ...props }, ref) => {
	return (
		<StyledIconButton ref={ref} $variant={variant} {...props}>
			{children}
		</StyledIconButton>
	);
});

IconButton.displayName = "IconButton";
