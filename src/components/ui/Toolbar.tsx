import { Toolbar as MuiToolbar, type ToolbarProps as MuiToolbarProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface ToolbarProps extends MuiToolbarProps {}

const StyledToolbar = styled(MuiToolbar)(({ theme: _theme }) => ({
	// Keep MUI Toolbar styling
}));

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
	return <StyledToolbar ref={ref} {...props} />;
});

Toolbar.displayName = "Toolbar";
