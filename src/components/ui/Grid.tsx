import React from 'react';
import { Grid as MuiGrid, GridProps as MuiGridProps } from '@mui/material';

export interface GridProps extends MuiGridProps {}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  return <MuiGrid ref={ref} {...props} />;
});

Grid.displayName = 'Grid';
