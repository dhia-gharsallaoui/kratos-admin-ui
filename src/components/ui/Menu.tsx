import {
	Divider,
	ListItemIcon,
	ListItemText,
	Menu as MuiMenu,
	MenuItem as MuiMenuItem,
	type MenuItemProps as MuiMenuItemProps,
	type MenuProps as MuiMenuProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { alpha } from "@/theme";

export interface MenuProps extends Omit<MuiMenuProps, "variant"> {
	variant?: "dropdown" | "context" | "user";
	muiVariant?: MuiMenuProps["variant"];
}

export interface MenuItemProps extends Omit<MuiMenuItemProps, "component"> {
	icon?: React.ReactNode;
	divider?: boolean;
	component?: React.ElementType;
	href?: string;
}

const StyledMenu = styled(MuiMenu)(({ theme }) => ({
	"& .MuiPaper-root": {
		borderRadius: "8px",
		marginTop: theme.spacing(1),
		minWidth: 180,
		boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
		border: `1px solid ${theme.palette.divider}`,
	},
	"& .MuiList-root": {
		padding: "8px",
	},
}));

const StyledMenuItem = styled(MuiMenuItem)(({ theme: _theme }) => ({
	borderRadius: "6px",
	padding: "10px 12px",
	margin: "2px 0",
	transition: "all 0.2s ease",
	"&:hover": {
		backgroundColor: alpha.primary[10],
	},
	"&.Mui-selected": {
		backgroundColor: "rgba(102, 126, 234, 0.15)",
		"&:hover": {
			backgroundColor: alpha.primary[20],
		},
	},
}));

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(({ variant = "dropdown", muiVariant, children, ...props }, ref) => {
	return (
		<StyledMenu ref={ref} variant={muiVariant} {...props}>
			{children}
		</StyledMenu>
	);
});

Menu.displayName = "Menu";

export const MenuItem = React.forwardRef<HTMLLIElement, MenuItemProps>(({ icon, children, divider = false, ...props }, ref) => {
	return (
		<>
			<StyledMenuItem ref={ref} {...props}>
				{icon && <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>}
				{typeof children === "string" ? <ListItemText primary={children} /> : children}
			</StyledMenuItem>
			{divider && <Divider sx={{ my: 1 }} />}
		</>
	);
});

MenuItem.displayName = "MenuItem";
