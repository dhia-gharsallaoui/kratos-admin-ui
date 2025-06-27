'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { CustomMuiThemeProvider } from './MuiThemeProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combines all application providers in the correct order
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <CustomMuiThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </CustomMuiThemeProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
