import { Clear, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField as MuiTextField, type TextFieldProps as MuiTextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { gradientColors } from "@/theme";

export interface TextFieldProps extends Omit<MuiTextFieldProps, "variant"> {
	variant?: "standard" | "search" | "readonly";
	onClear?: () => void;
}

interface StyledTextFieldProps extends Omit<MuiTextFieldProps, "variant"> {
	$variant?: "standard" | "search" | "readonly";
}

const StyledTextField = styled(MuiTextField, {
	shouldForwardProp: (prop) => prop !== "$variant",
})<StyledTextFieldProps>(({ theme, $variant = "standard" }) => {
	const baseStyles = {
		"& .MuiOutlinedInput-root": {
			borderRadius: "8px",
			transition: "all 0.3s ease",
			"&:hover fieldset": {
				borderColor: gradientColors.primary,
			},
			"&.Mui-focused fieldset": {
				borderColor: gradientColors.secondary,
			},
		},
	};

	if ($variant === "search") {
		return {
			...baseStyles,
			minWidth: "250px",
		};
	}

	if ($variant === "readonly") {
		return {
			...baseStyles,
			"& .MuiFilledInput-root": {
				backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
				"&:hover": {
					backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.09)",
				},
				"&.Mui-disabled": {
					backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
				},
			},
		};
	}

	return baseStyles;
});

export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(({ variant = "standard", onClear, value, ...props }, ref) => {
	const renderInputProps = () => {
		if (variant === "search") {
			return {
				startAdornment: (
					<InputAdornment position="start">
						<Search fontSize="small" />
					</InputAdornment>
				),
				endAdornment:
					value && onClear ? (
						<InputAdornment position="end">
							<IconButton size="small" onClick={onClear}>
								<Clear fontSize="small" />
							</IconButton>
						</InputAdornment>
					) : null,
			};
		}
		return props.InputProps;
	};

	const getVariant = (): "outlined" | "filled" | "standard" => {
		if (variant === "readonly") return "filled";
		return "outlined";
	};

	return (
		<StyledTextField
			ref={ref}
			$variant={variant}
			variant={getVariant()}
			value={value}
			disabled={variant === "readonly"}
			InputProps={renderInputProps()}
			{...props}
		/>
	);
});

TextField.displayName = "TextField";
