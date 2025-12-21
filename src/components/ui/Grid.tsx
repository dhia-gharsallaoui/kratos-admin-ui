import { Grid as MuiGrid, type GridProps as MuiGridProps } from "@mui/material";
import React from "react";

export interface GridProps extends MuiGridProps {}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
	return <MuiGrid ref={ref} {...props} />;
});

Grid.displayName = "Grid";
