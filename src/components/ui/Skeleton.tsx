import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface SkeletonProps extends MuiSkeletonProps {}

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
}));

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (props, ref) => {
    return <StyledSkeleton ref={ref} {...props} />;
  }
);

Skeleton.displayName = 'Skeleton';
