import { Divider as MuiDivider, type DividerProps as MuiDividerProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

export interface DividerProps extends MuiDividerProps {}

const StyledDivider = styled(MuiDivider)(({ theme }) => ({
	borderColor: alpha(theme.palette.divider, 0.12),
}));

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>((props, ref) => {
	return <StyledDivider ref={ref} {...props} />;
});

Divider.displayName = "Divider";
