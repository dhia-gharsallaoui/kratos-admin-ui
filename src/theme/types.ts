/**
 * TypeScript declarations for custom theme extensions
 */

import type { PaletteColor, SimplePaletteColorOptions } from "@mui/material/styles";

// Extend palette with gradient color
declare module "@mui/material/styles" {
	interface Palette {
		gradient: PaletteColor & {
			secondary: string;
		};
	}

	interface PaletteOptions {
		gradient?: SimplePaletteColorOptions & {
			secondary?: string;
		};
	}
}
