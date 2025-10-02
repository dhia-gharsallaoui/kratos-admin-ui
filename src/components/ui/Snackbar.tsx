import React from 'react';
import { Snackbar as MuiSnackbar, SnackbarProps as MuiSnackbarProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface SnackbarProps extends MuiSnackbarProps {}

const StyledSnackbar = styled(MuiSnackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[900],
    color: theme.palette.common.white,
    borderRadius: 'var(--radius)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

export const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (props, ref) => {
    return <StyledSnackbar ref={ref} {...props} />;
  }
);

Snackbar.displayName = 'Snackbar';
