import { Paper as MuiPaper, type PaperProps as MuiPaperProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface PaperProps extends MuiPaperProps {}

const StyledPaper = styled(MuiPaper)(({ theme: _theme }) => ({
	borderRadius: 12,
	transition: "all 0.3s ease",
}));

export const Paper = React.forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
	return <StyledPaper ref={ref} {...props} />;
});

Paper.displayName = "Paper";
