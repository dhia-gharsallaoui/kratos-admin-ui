import React from 'react';
import { InputAdornment as MuiInputAdornment, InputAdornmentProps as MuiInputAdornmentProps } from '@mui/material';

export interface InputAdornmentProps extends MuiInputAdornmentProps {}

export const InputAdornment = React.forwardRef<HTMLDivElement, InputAdornmentProps>(
  (props, ref) => {
    return <MuiInputAdornment ref={ref} {...props} />;
  }
);

InputAdornment.displayName = 'InputAdornment';
