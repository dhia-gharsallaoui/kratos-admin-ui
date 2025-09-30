import React from 'react';
import { Box, Typography, Alert, AlertTitle, Paper } from '@mui/material';
import { Error as ErrorIcon, Warning, Info, Refresh } from '@mui/icons-material';
import { Button } from './Button';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryText?: string;
  variant?: 'inline' | 'card' | 'centered';
  showIcon?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  severity = 'error',
  onRetry,
  retryText = 'Try Again',
  variant = 'inline',
  showIcon = true,
  className,
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <Warning sx={{ fontSize: 24 }} />;
      case 'info':
        return <Info sx={{ fontSize: 24 }} />;
      default:
        return <ErrorIcon sx={{ fontSize: 24 }} />;
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'warning':
        return {
          bg: 'rgba(237, 108, 2, 0.08)',
          border: 'rgba(237, 108, 2, 0.3)',
          text: '#ea580c',
          icon: '#ea580c',
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: '#3b82f6',
          icon: '#3b82f6',
        };
      default:
        return {
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#ef4444',
          icon: '#ef4444',
        };
    }
  };

  const colors = getColor();

  if (variant === 'centered') {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 500,
            width: '100%',
            p: 4,
            border: '1px solid var(--border)',
            borderRadius: 2,
            backgroundColor: 'var(--background-primary)',
          }}
        >
          {showIcon && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
                color: colors.icon,
              }}
            >
              {getIcon()}
            </Box>
          )}

          {title && (
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ color: colors.text }}
            >
              {title}
            </Typography>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>

          {onRetry && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRetry}
              fullWidth
            >
              {retryText}
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Paper
        elevation={0}
        className={className}
        sx={{
          p: 3,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          backgroundColor: colors.bg,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {showIcon && (
            <Box sx={{ color: colors.icon, mt: 0.5 }}>{getIcon()}</Box>
          )}

          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ color: colors.text }}
              >
                {title}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>

            {onRetry && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={onRetry}
                >
                  {retryText}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    );
  }

  // inline variant (default)
  return (
    <Box
      className={className}
      sx={{
        p: 2,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        backgroundColor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {showIcon && <Box sx={{ color: colors.icon }}>{getIcon()}</Box>}

      <Box sx={{ flex: 1 }}>
        {title && (
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ color: colors.text, mb: 0.5 }}
          >
            {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>

      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          {retryText}
        </Button>
      )}
    </Box>
  );
};
