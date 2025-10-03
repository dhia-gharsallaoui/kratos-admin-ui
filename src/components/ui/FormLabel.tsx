import React from 'react';
import { FormLabel as MuiFormLabel, FormLabelProps as MuiFormLabelProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface FormLabelProps extends MuiFormLabelProps {}

const StyledFormLabel = styled(MuiFormLabel)(({ theme }) => ({
  fontWeight: 500,
}));

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  (props, ref) => {
    return <StyledFormLabel ref={ref} {...props} />;
  }
);

FormLabel.displayName = 'FormLabel';
