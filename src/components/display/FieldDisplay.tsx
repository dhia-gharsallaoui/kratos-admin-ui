"use client";

import { Check as CheckIcon, ContentCopy as CopyIcon } from "@mui/icons-material";
import type React from "react";
import { useState } from "react";
import { Box, Chip, type ChipProps, IconButton, Tooltip, Typography } from "@/components/ui";

export interface FieldDisplayProps {
	label: string;
	value: React.ReactNode;
	valueType?: "text" | "code" | "chip" | "chips" | "custom";
	chipVariant?: ChipProps["variant"];
	chipStatus?: "active" | "inactive" | "pending" | "error";
	copyable?: boolean;
	emptyText?: string;
	orientation?: "horizontal" | "vertical";
}

export function FieldDisplay({
	label,
	value,
	valueType = "text",
	chipVariant = "status",
	chipStatus: _chipStatus,
	copyable = false,
	emptyText = "N/A",
	orientation = "vertical",
}: FieldDisplayProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (!value || typeof value !== "string") return;

		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text:", err);
		}
	};

	const renderValue = () => {
		if (!value && value !== 0 && value !== false) {
			return (
				<Typography variant="body" color="secondary">
					{emptyText}
				</Typography>
			);
		}

		switch (valueType) {
			case "code":
				return (
					<Typography variant="code" sx={{ wordBreak: "break-all" }}>
						{String(value)}
					</Typography>
				);

			case "chip":
				return <Chip variant={chipVariant} label={String(value)} size="small" />;

			case "chips":
				if (Array.isArray(value)) {
					return (
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
							{value.map((item, index) => (
								<Chip key={index} variant={chipVariant} label={String(item)} size="small" />
							))}
						</Box>
					);
				}
				return null;

			case "custom":
				return value;
			default:
				return (
					<Typography variant="body" sx={{ wordBreak: "break-word" }}>
						{String(value)}
					</Typography>
				);
		}
	};

	const isHorizontal = orientation === "horizontal";

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: isHorizontal ? "row" : "column",
				gap: isHorizontal ? 2 : 0.5,
				alignItems: isHorizontal ? "center" : "flex-start",
			}}
		>
			<Typography
				variant="label"
				sx={{
					minWidth: isHorizontal ? 120 : undefined,
					flexShrink: 0,
				}}
			>
				{label}
			</Typography>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					flex: 1,
				}}
			>
				{renderValue()}
				{copyable && value && typeof value === "string" && (
					<Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
						<IconButton
							size="small"
							onClick={handleCopy}
							sx={{
								opacity: 0.6,
								transition: "opacity 0.2s",
								"&:hover": { opacity: 1 },
							}}
						>
							{copied ? <CheckIcon sx={{ fontSize: 16, color: "success.main" }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
						</IconButton>
					</Tooltip>
				)}
			</Box>
		</Box>
	);
}

FieldDisplay.displayName = "FieldDisplay";
