import { AppBar as MuiAppBar, type AppBarProps as MuiAppBarProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface AppBarProps extends MuiAppBarProps {}

const StyledAppBar = styled(MuiAppBar)(({ theme: _theme }) => ({
	// Keep MUI AppBar styling
}));

export const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
	return <StyledAppBar ref={ref} {...props} />;
});

AppBar.displayName = "AppBar";
