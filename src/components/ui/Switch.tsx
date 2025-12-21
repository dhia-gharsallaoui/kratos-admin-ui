import { Switch as MuiSwitch, type SwitchProps as MuiSwitchProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface SwitchProps extends MuiSwitchProps {}

const StyledSwitch = styled(MuiSwitch)(({ theme: _theme }) => ({
	// Add gradient color theming if desired
}));

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>((props, ref) => {
	return <StyledSwitch ref={ref} {...props} />;
});

Switch.displayName = "Switch";
