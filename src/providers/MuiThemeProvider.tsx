"use client";

import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { type ReactNode, useMemo } from "react";
import { useTheme } from "./ThemeProvider";

export function CustomMuiThemeProvider({ children }: { children: ReactNode }) {
	const { theme } = useTheme();

	const muiTheme = useMemo(() => {
		return createTheme({
			palette: {
				mode: theme === "dark" ? "dark" : "light",
				...(theme === "dark"
					? {
							// Dark mode
							primary: {
								main: "#2196f3",
							},
							secondary: {
								main: "#ba68c8",
							},
							background: {
								default: "#121212",
								paper: "#1e1e1e",
							},
							text: {
								primary: "#e0e0e0",
								secondary: "#a0a0a0",
							},
						}
					: {
							// Light mode
							primary: {
								main: "#1976d2",
							},
							secondary: {
								main: "#9c27b0",
							},
							background: {
								default: "#ffffff",
								paper: "#ffffff",
							},
							text: {
								primary: "#171717",
								secondary: "#737373",
							},
						}),
			},
			components: {
				MuiCssBaseline: {
					styleOverrides: {
						body: {
							scrollbarWidth: "thin",
							"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
								width: "8px",
								height: "8px",
							},
							"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
								borderRadius: "10px",
								backgroundColor: theme === "dark" ? "#a0a0a0" : "#737373",
							},
							"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
								backgroundColor: theme === "dark" ? "#2196f3" : "#1976d2",
							},
							"&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
								borderRadius: "10px",
								backgroundColor: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
							},
						},
					},
				},
				MuiTableCell: {
					styleOverrides: {
						root: {
							borderColor: theme === "dark" ? "#333333" : "#e5e5e5",
						},
						head: {
							fontWeight: 600,
							backgroundColor: theme === "dark" ? "#1a1a1a" : "#f9fafb",
						},
					},
				},
				MuiTableRow: {
					styleOverrides: {
						root: {
							"&:hover": {
								backgroundColor: theme === "dark" ? "#2a2a2a !important" : "#f5f5f5 !important",
							},
						},
					},
				},
				MuiPaper: {
					styleOverrides: {
						root: {
							backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
							color: theme === "dark" ? "#e0e0e0" : "#171717",
						},
					},
				},
				MuiButton: {
					styleOverrides: {
						root: {
							textTransform: "none",
						},
					},
				},
				MuiDrawer: {
					styleOverrides: {
						paper: {
							backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
							color: theme === "dark" ? "#e0e0e0" : "#171717",
							borderColor: theme === "dark" ? "#404040" : "#e5e5e5",
						},
					},
				},
				MuiAppBar: {
					styleOverrides: {
						root: {
							backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
							color: theme === "dark" ? "#e0e0e0" : "#171717",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						},
					},
				},
				MuiListItemButton: {
					styleOverrides: {
						root: {
							"&.Mui-selected": {
								backgroundColor: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
								borderRight: `3px solid ${theme === "dark" ? "#2196f3" : "#1976d2"}`,
								"&:hover": {
									backgroundColor: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
								},
							},
							"&:hover": {
								backgroundColor: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
							},
						},
					},
				},
			},
		});
	}, [theme]);

	return (
		<MUIThemeProvider theme={muiTheme}>
			<CssBaseline />
			{children}
		</MUIThemeProvider>
	);
}
