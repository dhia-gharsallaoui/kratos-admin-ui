import { Container as MuiContainer, type ContainerProps as MuiContainerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface ContainerProps extends MuiContainerProps {}

const StyledContainer = styled(MuiContainer)(({ theme: _theme }) => ({
	// Keep MUI defaults, optionally add custom styling
}));

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
	return <StyledContainer ref={ref} {...props} />;
});

Container.displayName = "Container";
