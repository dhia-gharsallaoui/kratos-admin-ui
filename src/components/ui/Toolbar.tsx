import React from 'react';
import { Toolbar as MuiToolbar, ToolbarProps as MuiToolbarProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ToolbarProps extends MuiToolbarProps {}

const StyledToolbar = styled(MuiToolbar)(({ theme }) => ({
  // Keep MUI Toolbar styling
}));

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
  return <StyledToolbar ref={ref} {...props} />;
});

Toolbar.displayName = 'Toolbar';
