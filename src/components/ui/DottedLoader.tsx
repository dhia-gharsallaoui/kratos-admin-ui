import React from 'react';
import { Box, BoxProps } from '@mui/material';

type LoaderVariant = 'inline' | 'page';

interface DottedLoaderProps extends BoxProps {
  size?: number;
  variant?: LoaderVariant;
}

// CSS classes for different variants - easy to modify later
const loaderStyles = {
  inline: {
    // Small loader for inline use (metrics, counts, etc.)
    outerBorderColor: '#0075ff',
    innerBorderColor: '#009688',
    outerBorderWidth: '2px',
    innerBorderWidth: '2px',
    animationDuration: '1.5s',
    innerAnimationDuration: '0.8s',
  },
  page: {
    // Larger loader for page-level loading
    outerBorderColor: '#0075ff',
    innerBorderColor: '#009688',
    outerBorderWidth: '4px',
    innerBorderWidth: '4px',
    animationDuration: '2s',
    innerAnimationDuration: '1s',
  },
};

export const DottedLoader: React.FC<DottedLoaderProps> = ({ size, variant = 'page', sx = {}, ...props }) => {
  // Default sizes based on variant
  const defaultSize = variant === 'inline' ? 24 : 60;
  const loaderSize = size || defaultSize;
  const innerSize = loaderSize * 0.6;
  const offsetSize = loaderSize / 2;

  const styles = loaderStyles[variant];

  return (
    <Box
      sx={{
        position: 'relative',
        width: loaderSize,
        height: loaderSize,
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          width: loaderSize,
          height: loaderSize,
          borderWidth: styles.outerBorderWidth,
          borderColor: styles.outerBorderColor,
          borderStyle: 'solid solid dotted dotted',
          borderRadius: '50%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: `-${offsetSize}px`,
          marginLeft: `-${offsetSize}px`,
          animation: `rotate-right ${styles.animationDuration} linear infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            borderWidth: styles.innerBorderWidth,
            borderColor: styles.innerBorderColor,
            borderStyle: 'solid dotted solid dotted',
            borderRadius: '50%',
            width: innerSize,
            height: innerSize,
            animation: `rotate-left ${styles.innerAnimationDuration} linear infinite`,
          },
          '@keyframes rotate-right': {
            from: {
              transform: 'rotate(0deg)',
            },
            to: {
              transform: 'rotate(360deg)',
            },
          },
          '@keyframes rotate-left': {
            from: {
              transform: 'rotate(0deg)',
            },
            to: {
              transform: 'rotate(-360deg)',
            },
          },
        }}
      />
    </Box>
  );
};

export default DottedLoader;
