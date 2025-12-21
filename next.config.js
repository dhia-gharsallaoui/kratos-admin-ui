/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	images: {
		domains: ["localhost", "kratos.local"],
	},
	experimental: {
		optimizePackageImports: ["@mui/material", "@mui/icons-material", "@mui/x-data-grid", "@mui/x-charts"],
	},
};

module.exports = nextConfig;
