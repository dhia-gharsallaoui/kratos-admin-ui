import React from 'react';
import {
  List as MuiList,
  ListProps as MuiListProps,
  ListItem as MuiListItem,
  ListItemProps as MuiListItemProps,
  ListItemButton as MuiListItemButton,
  ListItemButtonProps as MuiListItemButtonProps,
  ListItemText as MuiListItemText,
  ListItemTextProps as MuiListItemTextProps,
  ListItemIcon as MuiListItemIcon,
  ListItemIconProps as MuiListItemIconProps,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface ListProps extends MuiListProps {}
export interface ListItemProps extends MuiListItemProps {}
export interface ListItemButtonProps extends Omit<MuiListItemButtonProps, 'component'> {
  component?: React.ElementType;
  href?: string;
}
export interface ListItemTextProps extends MuiListItemTextProps {}
export interface ListItemIconProps extends MuiListItemIconProps {}

const StyledList = styled(MuiList)(({ theme }) => ({
  padding: 0,
}));

const StyledListItem = styled(MuiListItem)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const StyledListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
}));

const StyledListItemText = styled(MuiListItemText)(({ theme }) => ({}));

const StyledListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.text.secondary,
}));

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  (props, ref) => {
    return <StyledList ref={ref} {...props} />;
  }
);

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (props, ref) => {
    return <StyledListItem ref={ref} {...props} />;
  }
);

export const ListItemButton = React.forwardRef<HTMLDivElement, ListItemButtonProps>(
  (props, ref) => {
    return <StyledListItemButton ref={ref} {...props} />;
  }
);

export const ListItemText = React.forwardRef<HTMLDivElement, ListItemTextProps>(
  (props, ref) => {
    return <StyledListItemText ref={ref} {...props} />;
  }
);

export const ListItemIcon = React.forwardRef<HTMLDivElement, ListItemIconProps>(
  (props, ref) => {
    return <StyledListItemIcon ref={ref} {...props} />;
  }
);

List.displayName = 'List';
ListItem.displayName = 'ListItem';
ListItemButton.displayName = 'ListItemButton';
ListItemText.displayName = 'ListItemText';
ListItemIcon.displayName = 'ListItemIcon';
