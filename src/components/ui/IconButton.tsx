import React from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface IconButtonProps extends Omit<MuiIconButtonProps, 'variant'> {
  variant?: 'action' | 'default';
}

interface StyledIconButtonProps extends Omit<MuiIconButtonProps, 'variant'> {
  $variant?: 'action' | 'default';
}

const StyledIconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<StyledIconButtonProps>(({ theme, $variant = 'default' }) => {
  const baseStyles = {
    transition: 'all 0.3s ease',
  };

  if ($variant === 'action') {
    return {
      ...baseStyles,
      background: 'rgba(102, 126, 234, 0.1)',
      '&:hover': {
        background: 'rgba(102, 126, 234, 0.2)',
        transform: 'scale(1.05)',
      },
      '& .MuiSvgIcon-root': {
        color: '#667eea',
      },
    };
  }

  // default variant
  return {
    ...baseStyles,
  };
});

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', children, ...props }, ref) => {
    return (
      <StyledIconButton ref={ref} $variant={variant} {...props}>
        {children}
      </StyledIconButton>
    );
  }
);

IconButton.displayName = 'IconButton';
