import { FormControlLabel as MuiFormControlLabel, type FormControlLabelProps as MuiFormControlLabelProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface FormControlLabelProps extends MuiFormControlLabelProps {}

const StyledFormControlLabel = styled(MuiFormControlLabel)(({ theme: _theme }) => ({
	// Keep MUI defaults
}));

export const FormControlLabel = React.forwardRef<HTMLLabelElement, FormControlLabelProps>((props, ref) => {
	return <StyledFormControlLabel ref={ref} {...props} />;
});

FormControlLabel.displayName = "FormControlLabel";
