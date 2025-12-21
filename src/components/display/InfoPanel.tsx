"use client";

import type React from "react";
import { Box, Card, CardContent, Typography } from "@/components/ui";
import { DataList } from "./DataList";
import type { FieldDisplayProps } from "./FieldDisplay";

export interface InfoPanelProps {
	title: string;
	items: Array<Omit<FieldDisplayProps, "orientation">>;
	actions?: React.ReactNode;
	variant?: "bordered" | "filled" | "outlined";
	columns?: 1 | 2 | 3;
}

export function InfoPanel({ title, items, actions, variant = "bordered", columns = 1 }: InfoPanelProps) {
	const variantStyles = {
		bordered: {
			border: "1px solid",
			borderColor: "divider",
		},
		filled: {
			backgroundColor: "action.hover",
		},
		outlined: {
			border: "2px solid",
			borderColor: "divider",
		},
	};

	// Split items into columns
	const columnedItems = columns > 1 ? splitIntoColumns(items, columns) : [items];

	return (
		<Card elevation={0} sx={variantStyles[variant]}>
			<CardContent>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						{title}
					</Typography>
					{actions && <Box>{actions}</Box>}
				</Box>

				{columns > 1 ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: `repeat(${columns}, 1fr)`,
							gap: 4,
						}}
					>
						{columnedItems.map((columnItems, index) => (
							<Box key={index}>
								<DataList items={columnItems} dividers={false} spacing={2} />
							</Box>
						))}
					</Box>
				) : (
					<DataList items={items} dividers={false} spacing={2} />
				)}
			</CardContent>
		</Card>
	);
}

function splitIntoColumns<T>(items: T[], columns: number): T[][] {
	const result: T[][] = Array.from({ length: columns }, () => []);
	items.forEach((item, index) => {
		result[index % columns].push(item);
	});
	return result;
}

InfoPanel.displayName = "InfoPanel";
