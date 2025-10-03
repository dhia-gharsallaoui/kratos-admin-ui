import React from 'react';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface SwitchProps extends MuiSwitchProps {}

const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  // Add gradient color theming if desired
}));

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (props, ref) => {
    return <StyledSwitch ref={ref} {...props} />;
  }
);

Switch.displayName = 'Switch';
