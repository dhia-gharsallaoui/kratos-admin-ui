"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	// Check if we're in the browser and get the stored theme or use system preference
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		// Initialize theme based on localStorage or system preference
		const storedTheme = localStorage.getItem("theme") as Theme;
		const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (storedTheme) {
			setTheme(storedTheme);
		} else if (systemPrefersDark) {
			setTheme("dark");
		}
	}, []);

	useEffect(() => {
		// Apply theme to document
		const root = document.documentElement;

		if (theme === "dark") {
			root.classList.add("dark-theme");
		} else {
			root.classList.remove("dark-theme");
		}

		// Save theme preference
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
