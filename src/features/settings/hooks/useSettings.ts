import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setKratosEndpoints: (endpoints: KratosEndpoints) => void;
  setHydraEndpoints: (endpoints: HydraEndpoints) => void;
  resetToDefaults: () => void;
  isValidUrl: (url: string) => boolean;
  isLoaded: boolean;
  loadDefaults: () => Promise<void>;
}

let serverDefaults: { kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean } | null = null;

async function fetchServerDefaults(): Promise<{ kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean }> {
  if (serverDefaults) {
    return serverDefaults;
  }

  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      serverDefaults = {
        kratos: {
          publicUrl: config.kratosPublicUrl,
          adminUrl: config.kratosAdminUrl,
        },
        hydra: {
          publicUrl: config.hydraPublicUrl || 'http://localhost:4444',
          adminUrl: config.hydraAdminUrl || 'http://localhost:4445',
        },
        isOryNetwork: config.isOryNetwork || false,
      };
      return serverDefaults;
    }
  } catch (error) {
    console.warn('Failed to fetch server config:', error);
  }

  // Fallback to localhost
  const fallback = {
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
  serverDefaults = fallback;
  return fallback;
}

// Initial endpoints - will be replaced by server defaults on load
const INITIAL_KRATOS_ENDPOINTS: KratosEndpoints = {
  publicUrl: '',
  adminUrl: '',
};

const INITIAL_HYDRA_ENDPOINTS: HydraEndpoints = {
  publicUrl: '',
  adminUrl: '',
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      kratosEndpoints: INITIAL_KRATOS_ENDPOINTS,
      hydraEndpoints: INITIAL_HYDRA_ENDPOINTS,
      isOryNetwork: false,
      isLoaded: false,

      loadDefaults: async () => {
        const defaults = await fetchServerDefaults();
        set({
          kratosEndpoints: defaults.kratos,
          hydraEndpoints: defaults.hydra,
          isOryNetwork: defaults.isOryNetwork,
          isLoaded: true,
        });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `kratos-public-url=${encodeURIComponent(defaults.kratos.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-admin-url=${encodeURIComponent(defaults.kratos.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-public-url=${encodeURIComponent(defaults.hydra.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-admin-url=${encodeURIComponent(defaults.hydra.adminUrl)}; path=/; SameSite=Strict`;
        }
      },

      setKratosEndpoints: (endpoints: KratosEndpoints) => {
        set({ kratosEndpoints: endpoints });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `kratos-public-url=${encodeURIComponent(endpoints.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-admin-url=${encodeURIComponent(endpoints.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-api-key=${endpoints.apiKey || ''}; path=/; SameSite=Strict`;
        }
      },

      setHydraEndpoints: (endpoints: HydraEndpoints) => {
        set({ hydraEndpoints: endpoints });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `hydra-public-url=${encodeURIComponent(endpoints.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-admin-url=${encodeURIComponent(endpoints.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-api-key=${endpoints.apiKey || ''}; path=/; SameSite=Strict`;
        }
      },

      resetToDefaults: async () => {
        const defaultEndpoints = await fetchServerDefaults();
        set({
          kratosEndpoints: defaultEndpoints.kratos,
          hydraEndpoints: defaultEndpoints.hydra,
        });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `kratos-public-url=${encodeURIComponent(defaultEndpoints.kratos.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-admin-url=${encodeURIComponent(defaultEndpoints.kratos.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-public-url=${encodeURIComponent(defaultEndpoints.hydra.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-admin-url=${encodeURIComponent(defaultEndpoints.hydra.adminUrl)}; path=/; SameSite=Strict`;
        }
      },

      isValidUrl: (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'ory-admin-settings',
      partialize: (state) => ({
        kratosEndpoints: state.kratosEndpoints,
        hydraEndpoints: state.hydraEndpoints,
        isOryNetwork: state.isOryNetwork,
      }),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, check if we have stored endpoints
        if (state?.kratosEndpoints?.publicUrl && state?.hydraEndpoints?.publicUrl) {
          // Mark as loaded since we have valid persisted settings
          useSettingsStore.setState({ isLoaded: true });

          // Set cookies for middleware to read
          if (typeof document !== 'undefined') {
            document.cookie = `kratos-public-url=${encodeURIComponent(state.kratosEndpoints.publicUrl)}; path=/; SameSite=Strict`;
            document.cookie = `kratos-admin-url=${encodeURIComponent(state.kratosEndpoints.adminUrl)}; path=/; SameSite=Strict`;
            document.cookie = `hydra-public-url=${encodeURIComponent(state.hydraEndpoints.publicUrl)}; path=/; SameSite=Strict`;
            document.cookie = `hydra-admin-url=${encodeURIComponent(state.hydraEndpoints.adminUrl)}; path=/; SameSite=Strict`;
          }
        } else {
          // If no stored endpoints, load defaults from server
          state?.loadDefaults();
        }
      },
    }
  )
);

// Convenience hooks
export const useKratosEndpoints = () => useSettingsStore((state) => state.kratosEndpoints);
export const useHydraEndpoints = () => useSettingsStore((state) => state.hydraEndpoints);
export const useIsOryNetwork = () => useSettingsStore((state) => state.isOryNetwork);
export const useSetKratosEndpoints = () => useSettingsStore((state) => state.setKratosEndpoints);
export const useSetHydraEndpoints = () => useSettingsStore((state) => state.setHydraEndpoints);
export const useResetSettings = () => useSettingsStore((state) => state.resetToDefaults);
export const useIsValidUrl = () => useSettingsStore((state) => state.isValidUrl);
export const useLoadDefaults = () => useSettingsStore((state) => state.loadDefaults);
export const useSettingsLoaded = () => useSettingsStore((state) => state.isLoaded);
