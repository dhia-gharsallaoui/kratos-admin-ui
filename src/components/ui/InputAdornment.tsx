import { InputAdornment as MuiInputAdornment, type InputAdornmentProps as MuiInputAdornmentProps } from "@mui/material";
import React from "react";

export interface InputAdornmentProps extends MuiInputAdornmentProps {}

export const InputAdornment = React.forwardRef<HTMLDivElement, InputAdornmentProps>((props, ref) => {
	return <MuiInputAdornment ref={ref} {...props} />;
});

InputAdornment.displayName = "InputAdornment";
