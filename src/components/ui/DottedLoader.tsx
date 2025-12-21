import { Box, type BoxProps } from "@mui/material";
import type React from "react";
import { useExtendedTheme } from "@/theme";

type LoaderVariant = "inline" | "page";

interface DottedLoaderProps extends BoxProps {
	size?: number;
	variant?: LoaderVariant;
}

// CSS classes for different variants - clean purple theme
const getLoaderStyles = (primaryColor: string, secondaryColor: string) => ({
	inline: {
		// Small loader for inline use (metrics, counts, etc.)
		outerBorderColor: primaryColor,
		innerBorderColor: secondaryColor,
		outerBorderWidth: "2px",
		innerBorderWidth: "2px",
		animationDuration: "1.2s",
		innerAnimationDuration: "0.9s",
	},
	page: {
		// Larger loader for page-level loading
		outerBorderColor: primaryColor,
		innerBorderColor: secondaryColor,
		outerBorderWidth: "3px",
		innerBorderWidth: "3px",
		animationDuration: "1.5s",
		innerAnimationDuration: "1.1s",
	},
});

export const DottedLoader: React.FC<DottedLoaderProps> = ({ size, variant = "page", sx = {}, ...props }) => {
	const theme = useExtendedTheme();
	// Default sizes based on variant
	const defaultSize = variant === "inline" ? 24 : 60;
	const loaderSize = size || defaultSize;
	const innerSize = loaderSize * 0.6;
	const offsetSize = loaderSize / 2;

	const loaderStyles = getLoaderStyles(theme.gradient.colors.primary, theme.gradient.colors.secondary);
	const styles = loaderStyles[variant];

	return (
		<Box
			sx={{
				position: "relative",
				width: loaderSize,
				height: loaderSize,
				...sx,
			}}
			{...props}
		>
			<Box
				sx={{
					width: loaderSize,
					height: loaderSize,
					borderWidth: styles.outerBorderWidth,
					borderColor: styles.outerBorderColor,
					borderStyle: "solid solid dotted dotted",
					borderRadius: "50%",
					position: "absolute",
					top: "50%",
					left: "50%",
					marginTop: `-${offsetSize}px`,
					marginLeft: `-${offsetSize}px`,
					animation: `rotate-right ${styles.animationDuration} linear infinite`,
					"&::before": {
						content: '""',
						position: "absolute",
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						margin: "auto",
						borderWidth: styles.innerBorderWidth,
						borderColor: styles.innerBorderColor,
						borderStyle: "solid dotted solid dotted",
						borderRadius: "50%",
						width: innerSize,
						height: innerSize,
						animation: `rotate-left ${styles.innerAnimationDuration} linear infinite`,
					},
					"@keyframes rotate-right": {
						from: {
							transform: "rotate(0deg)",
						},
						to: {
							transform: "rotate(360deg)",
						},
					},
					"@keyframes rotate-left": {
						from: {
							transform: "rotate(0deg)",
						},
						to: {
							transform: "rotate(-360deg)",
						},
					},
				}}
			/>
		</Box>
	);
};

export default DottedLoader;
