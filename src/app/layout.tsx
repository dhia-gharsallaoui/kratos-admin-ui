import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import Providers from "@/providers/Providers";
import ThemeRegistry from "@/providers/ThemeRegistry";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Kratos Admin UI",
	description: "Admin interface for Ory Kratos identity service",
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
		],
		apple: { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
		other: [{ rel: "icon", url: "/favicon.ico" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.className}>
			<body suppressHydrationWarning={true}>
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					<ThemeRegistry>
						<Providers>{children}</Providers>
					</ThemeRegistry>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
