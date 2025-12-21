import {
	List as MuiList,
	ListItem as MuiListItem,
	ListItemButton as MuiListItemButton,
	type ListItemButtonProps as MuiListItemButtonProps,
	ListItemIcon as MuiListItemIcon,
	type ListItemIconProps as MuiListItemIconProps,
	type ListItemProps as MuiListItemProps,
	ListItemText as MuiListItemText,
	type ListItemTextProps as MuiListItemTextProps,
	type ListProps as MuiListProps,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

export interface ListProps extends MuiListProps {}
export interface ListItemProps extends MuiListItemProps {}
export interface ListItemButtonProps extends Omit<MuiListItemButtonProps, "component"> {
	component?: React.ElementType;
	href?: string;
}
export interface ListItemTextProps extends MuiListItemTextProps {}
export interface ListItemIconProps extends MuiListItemIconProps {}

const StyledList = styled(MuiList)(({ theme: _theme }) => ({
	padding: 0,
}));

const StyledListItem = styled(MuiListItem)(({ theme }) => ({
	borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	"&:last-child": {
		borderBottom: "none",
	},
}));

const StyledListItemButton = styled(MuiListItemButton)(({ theme }) => ({
	transition: "all 0.2s ease",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.05),
	},
	"&.Mui-selected": {
		backgroundColor: alpha(theme.palette.primary.main, 0.08),
		borderLeft: `3px solid ${theme.palette.primary.main}`,
		"&:hover": {
			backgroundColor: alpha(theme.palette.primary.main, 0.12),
		},
	},
}));

const StyledListItemText = styled(MuiListItemText)(({ theme: _theme }) => ({}));

const StyledListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({
	minWidth: 40,
	color: theme.palette.text.secondary,
}));

export const List = React.forwardRef<HTMLUListElement, ListProps>((props, ref) => {
	return <StyledList ref={ref} {...props} />;
});

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>((props, ref) => {
	return <StyledListItem ref={ref} {...props} />;
});

export const ListItemButton = React.forwardRef<HTMLDivElement, ListItemButtonProps>((props, ref) => {
	return <StyledListItemButton ref={ref} {...props} />;
});

export const ListItemText = React.forwardRef<HTMLDivElement, ListItemTextProps>((props, ref) => {
	return <StyledListItemText ref={ref} {...props} />;
});

export const ListItemIcon = React.forwardRef<HTMLDivElement, ListItemIconProps>((props, ref) => {
	return <StyledListItemIcon ref={ref} {...props} />;
});

List.displayName = "List";
ListItem.displayName = "ListItem";
ListItemButton.displayName = "ListItemButton";
ListItemText.displayName = "ListItemText";
ListItemIcon.displayName = "ListItemIcon";
