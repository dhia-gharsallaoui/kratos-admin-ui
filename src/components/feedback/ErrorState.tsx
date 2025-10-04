'use client';

import React from 'react';
import { Box, Typography, Button, Alert } from '@/components/ui';
import { ErrorOutline, Refresh } from '@mui/icons-material';

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'page' | 'inline';
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  variant = 'page',
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <Alert
        severity="error"
        action={
          action ? (
            <Button
              size="small"
              onClick={action.onClick}
              startIcon={<Refresh sx={{ fontSize: 16 }} />}
              sx={{
                color: 'error.main',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
                },
              }}
            >
              {action.label}
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: '50%',
          backgroundColor: 'rgba(244, 67, 54, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ErrorOutline
          sx={{
            fontSize: 64,
            color: 'error.main',
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body"
        color="text.secondary"
        sx={{
          mb: 3,
          maxWidth: 400,
        }}
      >
        {message}
      </Typography>

      {action && (
        <Button
          onClick={action.onClick}
          startIcon={<Refresh />}
          variant="outlined"
          color="error"
          sx={{
            fontWeight: 600,
            px: 3,
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}

ErrorState.displayName = 'ErrorState';
