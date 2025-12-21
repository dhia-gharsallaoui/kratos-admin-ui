"use client";

import { Box, Typography } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";

export interface LoadingStateProps {
	message?: string;
	variant?: "page" | "section" | "inline";
	size?: "small" | "medium" | "large";
}

export function LoadingState({ message = "Loading...", variant = "section", size = "medium" }: LoadingStateProps) {
	const paddingMap = {
		page: 12,
		section: 8,
		inline: 2,
	};

	const sizeMap = {
		small: "small" as const,
		medium: "medium" as const,
		large: "large" as const,
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				py: paddingMap[variant],
				width: "100%",
				minHeight: variant === "page" ? "400px" : variant === "section" ? "200px" : "auto",
			}}
		>
			<Spinner variant="ring" size={sizeMap[size]} />
			{message && (
				<Typography
					variant="body"
					color="text.secondary"
					sx={{
						fontSize: size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem",
					}}
				>
					{message}
				</Typography>
			)}
		</Box>
	);
}

LoadingState.displayName = "LoadingState";
