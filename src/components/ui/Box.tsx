import { Box as MuiBox, type BoxProps as MuiBoxProps } from "@mui/material";
import React from "react";

export interface BoxProps extends MuiBoxProps {}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
	return <MuiBox ref={ref} {...props} />;
});

Box.displayName = "Box";
