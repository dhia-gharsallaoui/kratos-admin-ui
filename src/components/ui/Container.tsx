import React from 'react';
import { Container as MuiContainer, ContainerProps as MuiContainerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ContainerProps extends MuiContainerProps {}

const StyledContainer = styled(MuiContainer)(({ theme }) => ({
  // Keep MUI defaults, optionally add custom styling
}));

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    return <StyledContainer ref={ref} {...props} />;
  }
);

Container.displayName = 'Container';
