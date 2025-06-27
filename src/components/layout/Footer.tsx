import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Favorite } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        Made with{' '}
        <Favorite
          sx={{
            fontSize: 16,
            color: 'error.main',
            animation: 'heartbeat 1.5s ease-in-out infinite',
            '@keyframes heartbeat': {
              '0%': {
                transform: 'scale(1)',
              },
              '14%': {
                transform: 'scale(1.1)',
              },
              '28%': {
                transform: 'scale(1)',
              },
              '42%': {
                transform: 'scale(1.1)',
              },
              '70%': {
                transform: 'scale(1)',
              },
            },
          }}
        />{' '}
        by{' '}
        <Link
          href="https://github.com/dhia-gharsallaoui"
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          sx={{
            textDecoration: 'none',
            fontWeight: 'medium',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Dhia Gharsallaoui
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
