import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
}

interface StyledButtonProps extends Omit<MuiButtonProps, 'variant'> {
  $variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<StyledButtonProps>(({ theme, $variant = 'primary' }) => {
  const baseStyles = {
    textTransform: 'none' as const,
    fontWeight: 500,
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.9375rem',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--background-secondary)',
      color: 'var(--text-tertiary)',
      border: '1px solid var(--border)',
    },
  };

  if ($variant === 'primary') {
    return {
      ...baseStyles,
      backgroundColor: 'var(--text-primary)',
      color: 'var(--background-primary)',
      border: '1px solid var(--text-primary)',
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: 'var(--text-secondary)',
        borderColor: 'var(--text-secondary)',
      },
    };
  }

  if ($variant === 'secondary') {
    return {
      ...baseStyles,
      backgroundColor: 'var(--background-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: 'var(--background-tertiary)',
        borderColor: 'var(--text-tertiary)',
      },
    };
  }

  if ($variant === 'outlined') {
    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: 'var(--background-secondary)',
        borderColor: 'var(--text-secondary)',
      },
    };
  }

  if ($variant === 'danger') {
    return {
      ...baseStyles,
      backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
      color: '#ffffff',
      border: theme.palette.mode === 'dark' ? '1px solid #dc2626' : '1px solid #ef4444',
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
        borderColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
      },
    };
  }

  // text variant
  return {
    ...baseStyles,
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    '&:hover': {
      ...baseStyles['&:hover'],
      backgroundColor: 'var(--background-secondary)',
      color: 'var(--text-primary)',
    },
  };
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    return (
      <StyledButton ref={ref} $variant={variant} disableRipple {...props}>
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
