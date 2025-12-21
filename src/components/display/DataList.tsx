"use client";

import React from "react";
import { Box, Divider } from "@/components/ui";
import { FieldDisplay, type FieldDisplayProps } from "./FieldDisplay";

export interface DataListProps {
	items: Array<Omit<FieldDisplayProps, "orientation">>;
	orientation?: "horizontal" | "vertical";
	dividers?: boolean;
	spacing?: number;
}

export function DataList({ items, orientation = "vertical", dividers = false, spacing = 2 }: DataListProps) {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: spacing,
			}}
		>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					<FieldDisplay {...item} orientation={orientation} />
					{dividers && index < items.length - 1 && <Divider />}
				</React.Fragment>
			))}
		</Box>
	);
}

DataList.displayName = "DataList";
