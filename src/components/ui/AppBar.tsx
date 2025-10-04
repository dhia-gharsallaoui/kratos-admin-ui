import React from 'react';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface AppBarProps extends MuiAppBarProps {}

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  // Keep MUI AppBar styling
}));

export const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
  return <StyledAppBar ref={ref} {...props} />;
});

AppBar.displayName = 'AppBar';
