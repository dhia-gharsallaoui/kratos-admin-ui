import { FormLabel as MuiFormLabel, type FormLabelProps as MuiFormLabelProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface FormLabelProps extends MuiFormLabelProps {}

const StyledFormLabel = styled(MuiFormLabel)(({ theme: _theme }) => ({
	fontWeight: 500,
}));

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>((props, ref) => {
	return <StyledFormLabel ref={ref} {...props} />;
});

FormLabel.displayName = "FormLabel";
