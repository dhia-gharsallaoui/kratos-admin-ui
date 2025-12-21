"use client";

import React from "react";
import { Box, type BoxProps } from "@/components/ui";

export interface SectionProps extends Omit<BoxProps, "ref"> {
	spacing?: number;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(({ spacing = 3, sx, ...rest }, ref) => {
	return (
		<Box
			ref={ref}
			{...rest}
			sx={{
				mb: spacing,
				...sx,
			}}
		/>
	);
});

Section.displayName = "Section";
