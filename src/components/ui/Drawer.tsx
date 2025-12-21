import { Drawer as MuiDrawer, type DrawerProps as MuiDrawerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface DrawerProps extends MuiDrawerProps {}

const StyledDrawer = styled(MuiDrawer)(({ theme: _theme }) => ({
	"& .MuiDrawer-paper": {
		transition: "all 0.3s ease",
	},
}));

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
	return <StyledDrawer ref={ref} {...props} />;
});

Drawer.displayName = "Drawer";
