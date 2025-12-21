import { Box, type BoxProps, CircularProgress } from "@mui/material";
import type React from "react";
import { useExtendedTheme } from "@/theme";

type SpinnerVariant = "dots" | "ring" | "pulse" | "page" | "button" | "inline" | "overlay";
type SpinnerSize = "small" | "medium" | "large";

interface SpinnerProps extends Omit<BoxProps, "size"> {
	variant?: SpinnerVariant;
	size?: SpinnerSize;
	color?: string;
}

const sizeMap = {
	small: 32,
	medium: 48,
	large: 64,
};

export const Spinner: React.FC<SpinnerProps> = ({ variant = "ring", size = "medium", color, sx = {}, ...props }) => {
	const theme = useExtendedTheme();
	const defaultColor = color || theme.gradient.colors.primary;
	const spinnerSize = sizeMap[size];

	// Page loading - centered in viewport
	if (variant === "page") {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
					width: "100%",
					...sx,
				}}
				{...props}
			>
				<CircularProgress size={spinnerSize} sx={{ color: defaultColor }} />
			</Box>
		);
	}

	// Button loading - small inline spinner
	if (variant === "button") {
		return <CircularProgress size={16} sx={{ color: color || "inherit", ...sx }} {...props} />;
	}

	// Inline loading - small spinner without container
	if (variant === "inline") {
		return <CircularProgress size={20} sx={{ color: defaultColor, ...sx }} {...props} />;
	}

	// Overlay loading - covers content with backdrop
	if (variant === "overlay") {
		return (
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "rgba(0, 0, 0, 0.3)",
					backdropFilter: "blur(2px)",
					zIndex: 9999,
					...sx,
				}}
				{...props}
			>
				<CircularProgress size={spinnerSize} sx={{ color: "#ffffff" }} />
			</Box>
		);
	}

	if (variant === "dots") {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 1,
					...sx,
				}}
				{...props}
			>
				{[0, 1, 2].map((i) => (
					<Box
						key={i}
						sx={{
							width: spinnerSize / 6,
							height: spinnerSize / 6,
							borderRadius: "50%",
							backgroundColor: defaultColor,
							animation: "bounce 1.4s ease-in-out infinite",
							animationDelay: `${i * 0.16}s`,
							"@keyframes bounce": {
								"0%, 80%, 100%": {
									transform: "scale(0)",
									opacity: 0.5,
								},
								"40%": {
									transform: "scale(1)",
									opacity: 1,
								},
							},
						}}
					/>
				))}
			</Box>
		);
	}

	if (variant === "pulse") {
		return (
			<Box
				sx={{
					position: "relative",
					width: spinnerSize,
					height: spinnerSize,
					...sx,
				}}
				{...props}
			>
				<Box
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						borderRadius: "50%",
						border: `3px solid ${defaultColor}`,
						animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
						"@keyframes pulse": {
							"0%, 100%": {
								opacity: 1,
								transform: "scale(0.8)",
							},
							"50%": {
								opacity: 0.5,
								transform: "scale(1.1)",
							},
						},
					}}
				/>
			</Box>
		);
	}

	// Default: ring variant
	return (
		<Box
			sx={{
				position: "relative",
				width: spinnerSize,
				height: spinnerSize,
				...sx,
			}}
			{...props}
		>
			<Box
				sx={{
					position: "absolute",
					width: "100%",
					height: "100%",
					borderRadius: "50%",
					border: `3px solid transparent`,
					borderTopColor: defaultColor,
					borderRightColor: defaultColor,
					animation: "spin 0.8s linear infinite",
					"@keyframes spin": {
						"0%": {
							transform: "rotate(0deg)",
						},
						"100%": {
							transform: "rotate(360deg)",
						},
					},
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "70%",
					height: "70%",
					borderRadius: "50%",
					border: `2px solid transparent`,
					borderBottomColor: theme.gradient.colors.secondary,
					borderLeftColor: theme.gradient.colors.secondary,
					animation: "spin-reverse 1.2s linear infinite",
					"@keyframes spin-reverse": {
						"0%": {
							transform: "translate(-50%, -50%) rotate(0deg)",
						},
						"100%": {
							transform: "translate(-50%, -50%) rotate(-360deg)",
						},
					},
				}}
			/>
		</Box>
	);
};

export default Spinner;
