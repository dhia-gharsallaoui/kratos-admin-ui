import { create } from 'zustand';
import { useEffect, useState } from 'react';

export interface KratosEndpoints {
  publicUrl: string;
  adminUrl: string;
  apiKey?: string;
}

export interface HydraEndpoints {
  publicUrl: string;
  adminUrl: string;
  apiKey?: string;
}

export interface SettingsStoreState {
  kratosEndpoints: KratosEndpoints;
  hydraEndpoints: HydraEndpoints;
  isOryNetwork: boolean;
  isReady: boolean;
  setKratosEndpoints: (endpoints: KratosEndpoints) => Promise<void>;
  setHydraEndpoints: (endpoints: HydraEndpoints) => Promise<void>;
  setIsOryNetwork: (value: boolean) => void;
  resetToDefaults: () => Promise<void>;
  isValidUrl: (url: string) => boolean;
  initialize: () => Promise<void>;
}

// Cookie helpers - single source of truth
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
}

// Helper function to encrypt API key via server
async function encryptApiKey(apiKey: string | undefined): Promise<string> {
  if (!apiKey) return '';
  const response = await fetch('/api/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: apiKey }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Encryption failed: ${errorData.error || response.statusText}`);
  }
  const data = await response.json();
  if (!data.encrypted) {
    throw new Error('Encryption failed: no encrypted value returned');
  }
  return data.encrypted;
}

async function fetchServerDefaults(): Promise<{ kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean }> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      return {
        kratos: {
          publicUrl: config.kratosPublicUrl,
          adminUrl: config.kratosAdminUrl,
          apiKey: config.kratosApiKey || undefined,
        },
        hydra: {
          publicUrl: config.hydraPublicUrl || 'http://localhost:4444',
          adminUrl: config.hydraAdminUrl || 'http://localhost:4445',
          apiKey: config.hydraApiKey || undefined,
        },
        isOryNetwork: config.isOryNetwork || false,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch server config:', error);
  }

  // Fallback to localhost
  return {
    kratos: {
      publicUrl: 'http://localhost:4433',
      adminUrl: 'http://localhost:4434',
    },
    hydra: {
      publicUrl: 'http://localhost:4444',
      adminUrl: 'http://localhost:4445',
    },
    isOryNetwork: false,
  };
}

// Read all settings from cookies
function readSettingsFromCookies(): { kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean } | null {
  const kratosPublicUrl = getCookie('kratos-public-url');
  const kratosAdminUrl = getCookie('kratos-admin-url');
  const hydraPublicUrl = getCookie('hydra-public-url');
  const hydraAdminUrl = getCookie('hydra-admin-url');

  // If we don't have the essential URLs, return null
  if (!kratosPublicUrl || !kratosAdminUrl) {
    return null;
  }

  return {
    kratos: {
      publicUrl: kratosPublicUrl,
      adminUrl: kratosAdminUrl,
      apiKey: getCookie('kratos-api-key') || undefined,
    },
    hydra: {
      publicUrl: hydraPublicUrl || 'http://localhost:4444',
      adminUrl: hydraAdminUrl || 'http://localhost:4445',
      apiKey: getCookie('hydra-api-key') || undefined,
    },
    isOryNetwork: getCookie('is-ory-network') === 'true',
  };
}

// Write all settings to cookies
function writeSettingsToCookies(settings: { kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean }) {
  setCookie('kratos-public-url', settings.kratos.publicUrl);
  setCookie('kratos-admin-url', settings.kratos.adminUrl);
  setCookie('kratos-api-key', settings.kratos.apiKey || '');
  setCookie('hydra-public-url', settings.hydra.publicUrl);
  setCookie('hydra-admin-url', settings.hydra.adminUrl);
  setCookie('hydra-api-key', settings.hydra.apiKey || '');
  setCookie('is-ory-network', settings.isOryNetwork ? 'true' : 'false');
}

// Initial state - empty until initialized
const INITIAL_KRATOS_ENDPOINTS: KratosEndpoints = {
  publicUrl: '',
  adminUrl: '',
};

const INITIAL_HYDRA_ENDPOINTS: HydraEndpoints = {
  publicUrl: '',
  adminUrl: '',
};

export const useSettingsStore = create<SettingsStoreState>()((set, get) => ({
  kratosEndpoints: INITIAL_KRATOS_ENDPOINTS,
  hydraEndpoints: INITIAL_HYDRA_ENDPOINTS,
  isOryNetwork: false,
  isReady: false,

  initialize: async () => {
    // Already initialized
    if (get().isReady) return;

    // Try to read from cookies first (synchronous)
    const cookieSettings = readSettingsFromCookies();

    if (cookieSettings) {
      // Cookies exist - use them and mark ready immediately
      set({
        kratosEndpoints: cookieSettings.kratos,
        hydraEndpoints: cookieSettings.hydra,
        isOryNetwork: cookieSettings.isOryNetwork,
        isReady: true,
      });
      return;
    }

    // No cookies - fetch defaults from server
    const defaults = await fetchServerDefaults();

    // Write to cookies FIRST
    writeSettingsToCookies(defaults);

    // Then update state
    set({
      kratosEndpoints: defaults.kratos,
      hydraEndpoints: defaults.hydra,
      isOryNetwork: defaults.isOryNetwork,
      isReady: true,
    });
  },

  setKratosEndpoints: async (endpoints: KratosEndpoints) => {
    const encryptedApiKey = endpoints.apiKey ? await encryptApiKey(endpoints.apiKey) : '';
    const storedEndpoints = {
      publicUrl: endpoints.publicUrl,
      adminUrl: endpoints.adminUrl,
      apiKey: encryptedApiKey || undefined,
    };

    // Write to cookies
    setCookie('kratos-public-url', endpoints.publicUrl);
    setCookie('kratos-admin-url', endpoints.adminUrl);
    setCookie('kratos-api-key', encryptedApiKey);

    // Update state
    set({ kratosEndpoints: storedEndpoints });
  },

  setHydraEndpoints: async (endpoints: HydraEndpoints) => {
    const encryptedApiKey = endpoints.apiKey ? await encryptApiKey(endpoints.apiKey) : '';
    const storedEndpoints = {
      publicUrl: endpoints.publicUrl,
      adminUrl: endpoints.adminUrl,
      apiKey: encryptedApiKey || undefined,
    };

    // Write to cookies
    setCookie('hydra-public-url', endpoints.publicUrl);
    setCookie('hydra-admin-url', endpoints.adminUrl);
    setCookie('hydra-api-key', encryptedApiKey);

    // Update state
    set({ hydraEndpoints: storedEndpoints });
  },

  setIsOryNetwork: (value: boolean) => {
    setCookie('is-ory-network', value ? 'true' : 'false');
    set({ isOryNetwork: value });
  },

  resetToDefaults: async () => {
    const defaults = await fetchServerDefaults();

    // Write to cookies
    writeSettingsToCookies(defaults);

    // Update state
    set({
      kratosEndpoints: defaults.kratos,
      hydraEndpoints: defaults.hydra,
      isOryNetwork: defaults.isOryNetwork,
    });
  },

  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
}));

// Hook to initialize settings and wait until ready
export const useSettingsReady = () => {
  const [isReady, setIsReady] = useState(false);
  const storeReady = useSettingsStore((state) => state.isReady);
  const initialize = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    if (!storeReady) {
      initialize();
    } else {
      setIsReady(true);
    }
  }, [storeReady, initialize]);

  return isReady;
};

// Convenience hooks
export const useKratosEndpoints = () => useSettingsStore((state) => state.kratosEndpoints);
export const useHydraEndpoints = () => useSettingsStore((state) => state.hydraEndpoints);
export const useIsOryNetwork = () => useSettingsStore((state) => state.isOryNetwork);
export const useSetKratosEndpoints = () => useSettingsStore((state) => state.setKratosEndpoints);
export const useSetHydraEndpoints = () => useSettingsStore((state) => state.setHydraEndpoints);
export const useSetIsOryNetwork = () => useSettingsStore((state) => state.setIsOryNetwork);
export const useResetSettings = () => useSettingsStore((state) => state.resetToDefaults);
export const useIsValidUrl = () => useSettingsStore((state) => state.isValidUrl);

// Backwards compatibility - useSettingsLoaded now uses the same logic as isReady
export const useSettingsLoaded = () => useSettingsStore((state) => state.isReady);
