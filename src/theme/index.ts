import { useTheme as useMuiTheme } from "@mui/material/styles";

// Gradient colors
export const gradientColors = {
	primary: "#667eea",
	secondary: "#764ba2",
};

// Additional theme colors for UI components
export const themeColors = {
	success: "#00b894",
	warning: "#fdcb6e",
	error: "#e17055",
	info: "#0984e3",
	purple: "#a29bfe",
	orange: "#ff9800",
	blue: "#74b9ff",
};

// Gradient utilities
export const gradients = {
	normal: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`,
	reversed: `linear-gradient(135deg, ${gradientColors.secondary} 0%, ${gradientColors.primary} 100%)`,
	subtle: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)`,
	text: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`,
};

// Alpha variants
export const alpha = {
	primary: {
		10: "rgba(102, 126, 234, 0.1)",
		20: "rgba(102, 126, 234, 0.2)",
		30: "rgba(102, 126, 234, 0.3)",
		40: "rgba(102, 126, 234, 0.4)",
		95: "rgba(102, 126, 234, 0.95)",
	},
	secondary: {
		10: "rgba(118, 75, 162, 0.1)",
		20: "rgba(118, 75, 162, 0.2)",
		30: "rgba(118, 75, 162, 0.3)",
	},
};

// Shadows
export const shadows = {
	sm: "0 2px 8px rgba(102, 126, 234, 0.15)",
	md: "0 4px 15px rgba(102, 126, 234, 0.3)",
	lg: "0 6px 20px rgba(102, 126, 234, 0.4)",
};

// Custom hook that combines MUI theme with our extensions
export const useExtendedTheme = () => {
	const muiTheme = useMuiTheme();

	return {
		...muiTheme,
		gradient: {
			colors: gradientColors,
			gradients,
			alpha,
			shadows,
		},
		colors: themeColors,
	};
};
