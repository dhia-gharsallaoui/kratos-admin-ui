import { OutlinedInput as MuiOutlinedInput, type OutlinedInputProps as MuiOutlinedInputProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

export interface OutlinedInputProps extends MuiOutlinedInputProps {}

const StyledOutlinedInput = styled(MuiOutlinedInput)(({ theme }) => ({
	borderRadius: 8,
	transition: "all 0.2s ease",
	"& .MuiOutlinedInput-notchedOutline": {
		borderColor: alpha(theme.palette.divider, 0.2),
	},
	"&:hover .MuiOutlinedInput-notchedOutline": {
		borderColor: alpha(theme.palette.primary.main, 0.5),
	},
	"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
		borderColor: theme.palette.primary.main,
		borderWidth: 2,
	},
}));

export const OutlinedInput = React.forwardRef<HTMLDivElement, OutlinedInputProps>((props, ref) => {
	return <StyledOutlinedInput ref={ref} {...props} />;
});

OutlinedInput.displayName = "OutlinedInput";
