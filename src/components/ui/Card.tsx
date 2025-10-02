import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent as MuiCardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'bordered' | 'gradient' | 'metric' | 'outlined';
}

interface StyledCardProps extends Omit<MuiCardProps, 'variant'> {
  $variant?: 'bordered' | 'gradient' | 'metric' | 'outlined';
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<StyledCardProps>(({ theme, $variant = 'bordered' }) => {
  const baseStyles = {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  };

  if ($variant === 'bordered') {
    return {
      ...baseStyles,
      border: '1px solid',
      borderColor: theme.palette.divider,
      boxShadow: 'none',
    };
  }

  if ($variant === 'gradient') {
    return {
      ...baseStyles,
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: '2px solid',
      borderColor: 'rgba(102, 126, 234, 0.3)',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
    };
  }

  if ($variant === 'metric') {
    return {
      ...baseStyles,
      border: '1px solid',
      borderColor: theme.palette.divider,
      boxShadow: 'none',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
      },
    };
  }

  // outlined variant
  return {
    ...baseStyles,
  };
});

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'bordered', ...props }, ref) => {
    return (
      <StyledCard
        ref={ref}
        $variant={variant}
        elevation={variant === 'outlined' ? 1 : 0}
        variant={variant === 'outlined' ? 'outlined' : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Export CardContent for convenience
export { MuiCardContent as CardContent };
