import React from 'react';
import { FormControlLabel as MuiFormControlLabel, FormControlLabelProps as MuiFormControlLabelProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface FormControlLabelProps extends MuiFormControlLabelProps {}

const StyledFormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  // Keep MUI defaults
}));

export const FormControlLabel = React.forwardRef<HTMLLabelElement, FormControlLabelProps>((props, ref) => {
  return <StyledFormControlLabel ref={ref} {...props} />;
});

FormControlLabel.displayName = 'FormControlLabel';
