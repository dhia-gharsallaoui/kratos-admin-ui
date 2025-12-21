"use client";

import React from "react";
import { Box, type BoxProps } from "@/components/ui";

export interface FlexBoxProps extends Omit<BoxProps, "ref"> {
	direction?: "row" | "column";
	align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
	justify?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
	gap?: number | string;
	wrap?: boolean;
}

export const FlexBox = React.forwardRef<HTMLDivElement, FlexBoxProps>(
	({ direction = "row", align = "flex-start", justify = "flex-start", gap, wrap = false, sx, ...rest }, ref) => {
		return (
			<Box
				ref={ref}
				{...rest}
				sx={{
					display: "flex",
					flexDirection: direction,
					alignItems: align,
					justifyContent: justify,
					gap,
					flexWrap: wrap ? "wrap" : "nowrap",
					...sx,
				}}
			/>
		);
	},
);

FlexBox.displayName = "FlexBox";
