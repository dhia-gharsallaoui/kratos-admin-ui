/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#1976d2",
					50: "#f0f7ff",
					100: "#e0eefe",
					200: "#bae0fd",
					300: "#7cc8fc",
					400: "#38acf8",
					500: "#1791ec",
					600: "#0272d1",
					700: "#0259a9",
					800: "#064b8c",
					900: "#0b4074",
					950: "#072a4d",
				},
				secondary: {
					DEFAULT: "#9c27b0",
					50: "#faf5fd",
					100: "#f3e6f9",
					200: "#e5d1f3",
					300: "#d2afe9",
					400: "#be82da",
					500: "#ab58c8",
					600: "#9c3bb6",
					700: "#892d98",
					800: "#70287c",
					900: "#5c2464",
					950: "#3e0f47",
				},
			},
			fontFamily: {
				sans: ["var(--font-roboto)", "sans-serif"],
			},
		},
	},
	plugins: [],
};
