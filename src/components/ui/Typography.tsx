import { Typography as MuiTypography, type TypographyProps as MuiTypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { gradients } from "@/theme";

type CustomVariant = "heading" | "subheading" | "body" | "label" | "code" | "gradient";

export interface TypographyProps extends Omit<MuiTypographyProps, "variant"> {
	variant?: MuiTypographyProps["variant"] | CustomVariant;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
	level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface StyledTypographyProps extends Omit<MuiTypographyProps, "variant"> {
	$variant?: "heading" | "subheading" | "body" | "label" | "code" | "gradient";
	$size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const StyledTypography = styled(MuiTypography, {
	shouldForwardProp: (prop) => !["$variant", "$size"].includes(prop as string),
})<StyledTypographyProps>(({ theme, $variant = "body", $size = "md" }) => {
	const sizeMap = {
		xs: "0.75rem",
		sm: "0.875rem",
		md: "1rem",
		lg: "1.125rem",
		xl: "1.25rem",
		"2xl": "1.5rem",
		"3xl": "2rem",
	};

	const baseStyles = {
		fontSize: sizeMap[$size],
	};

	if ($variant === "heading") {
		return {
			...baseStyles,
			fontWeight: 600,
			marginBottom: theme.spacing(1),
		};
	}

	if ($variant === "subheading") {
		return {
			...baseStyles,
			fontWeight: 500,
			color: theme.palette.text.secondary,
		};
	}

	if ($variant === "label") {
		return {
			...baseStyles,
			fontWeight: 500,
			color: theme.palette.text.secondary,
			fontSize: "0.875rem",
		};
	}

	if ($variant === "code") {
		return {
			...baseStyles,
			fontFamily: "monospace",
			wordBreak: "break-all",
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
			padding: "2px 6px",
			borderRadius: "4px",
		};
	}

	if ($variant === "gradient") {
		return {
			...baseStyles,
			fontWeight: 700,
			background: gradients.text,
			backgroundClip: "text",
			WebkitBackgroundClip: "text",
			WebkitTextFillColor: "transparent",
		};
	}

	// body variant (default)
	return baseStyles;
});

const customVariants: CustomVariant[] = ["heading", "subheading", "body", "label", "code", "gradient"];

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(({ variant = "body", size = "md", level, children, ...props }, ref) => {
	const isCustomVariant = customVariants.includes(variant as CustomVariant);

	// Determine styling variant
	const styleVariant: CustomVariant = isCustomVariant ? (variant as CustomVariant) : "body";

	// Determine MUI variant for semantic HTML
	const getMuiVariant = (): MuiTypographyProps["variant"] => {
		// If it's already a MUI variant, use it directly
		if (!isCustomVariant) return variant as MuiTypographyProps["variant"];

		if (variant === "heading" && level) return level;
		if (variant === "heading") return "h6";
		if (variant === "subheading") return "subtitle1";
		if (variant === "label") return "subtitle2";
		if (variant === "code") return "body2";
		return "body1";
	};

	return (
		<StyledTypography ref={ref} variant={getMuiVariant()} $variant={styleVariant} $size={size} {...props}>
			{children}
		</StyledTypography>
	);
});

Typography.displayName = "Typography";
