import React from 'react';
import { Divider as MuiDivider, DividerProps as MuiDividerProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface DividerProps extends MuiDividerProps {}

const StyledDivider = styled(MuiDivider)(({ theme }) => ({
  borderColor: alpha(theme.palette.divider, 0.12),
}));

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (props, ref) => {
    return <StyledDivider ref={ref} {...props} />;
  }
);

Divider.displayName = 'Divider';
