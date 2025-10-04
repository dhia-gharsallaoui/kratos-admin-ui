import React from 'react';
import { DialogTitle as MuiDialogTitle, DialogTitleProps as MuiDialogTitleProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface DialogTitleProps extends MuiDialogTitleProps {}

const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  fontWeight: 600,
}));

export const DialogTitle = React.forwardRef<HTMLDivElement, DialogTitleProps>((props, ref) => {
  return <StyledDialogTitle ref={ref} {...props} />;
});

DialogTitle.displayName = 'DialogTitle';
