"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Inter } from "next/font/google";
import { useState } from "react";
import { gradientColor } from "@/theme/colors";
import "@/theme/types"; // Import types for module augmentation

// Load Inter font
const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
	const [theme] = useState(() =>
		createTheme({
			palette: {
				primary: {
					main: "#3f51b5",
				},
				secondary: {
					main: "#f50057",
				},
				// Add custom gradient color directly
				gradient: gradientColor,
			},
			typography: {
				fontFamily: inter.style.fontFamily,
			},
		}),
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}
