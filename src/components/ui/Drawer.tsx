import React from 'react';
import { Drawer as MuiDrawer, DrawerProps as MuiDrawerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface DrawerProps extends MuiDrawerProps {}

const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    transition: 'all 0.3s ease',
  },
}));

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (props, ref) => {
    return <StyledDrawer ref={ref} {...props} />;
  }
);

Drawer.displayName = 'Drawer';
