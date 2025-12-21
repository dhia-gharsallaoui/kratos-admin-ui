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
  setKratosEndpoints: (endpoints: KratosEndpoints) => Promise<void>;
  setHydraEndpoints: (endpoints: HydraEndpoints) => Promise<void>;
  setIsOryNetwork: (value: boolean) => void;
  resetToDefaults: () => Promise<void>;
  isValidUrl: (url: string) => boolean;
  isLoaded: boolean;
  loadDefaults: () => Promise<void>;
}

let serverDefaults: { kratos: KratosEndpoints; hydra: HydraEndpoints; isOryNetwork: boolean } | null = null;
let rehydrationProcessed = false;

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
          apiKey: config.kratosApiKey || undefined,
        },
        hydra: {
          publicUrl: config.hydraPublicUrl || 'http://localhost:4444',
          adminUrl: config.hydraAdminUrl || 'http://localhost:4445',
          apiKey: config.hydraApiKey || undefined,
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

        // Set cookies FIRST (before isLoaded) to avoid race condition
        // where useAnalytics fires requests before cookies are set
        if (typeof document !== 'undefined') {
          document.cookie = `kratos-public-url=${encodeURIComponent(defaults.kratos.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-admin-url=${encodeURIComponent(defaults.kratos.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-api-key=${defaults.kratos.apiKey || ''}; path=/; SameSite=Strict`;
          document.cookie = `hydra-public-url=${encodeURIComponent(defaults.hydra.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-admin-url=${encodeURIComponent(defaults.hydra.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-api-key=${defaults.hydra.apiKey || ''}; path=/; SameSite=Strict`;
        }

        // THEN update state with isLoaded: true
        set({
          kratosEndpoints: defaults.kratos,
          hydraEndpoints: defaults.hydra,
          isOryNetwork: defaults.isOryNetwork,
          isLoaded: true,
        });
      },

      setKratosEndpoints: async (endpoints: KratosEndpoints) => {
        const encryptedApiKey = endpoints.apiKey ? await encryptApiKey(endpoints.apiKey) : '';
        const storedEndpoints = {
          publicUrl: endpoints.publicUrl,
          adminUrl: endpoints.adminUrl,
          apiKey: encryptedApiKey || undefined,
        };
        set({ kratosEndpoints: storedEndpoints });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `kratos-public-url=${encodeURIComponent(endpoints.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-admin-url=${encodeURIComponent(endpoints.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `kratos-api-key=${encryptedApiKey}; path=/; SameSite=Strict`;
        }
      },

      setHydraEndpoints: async (endpoints: HydraEndpoints) => {
        const encryptedApiKey = endpoints.apiKey ? await encryptApiKey(endpoints.apiKey) : '';
        const storedEndpoints = {
          publicUrl: endpoints.publicUrl,
          adminUrl: endpoints.adminUrl,
          apiKey: encryptedApiKey || undefined,
        };
        set({ hydraEndpoints: storedEndpoints });

        // Set cookies for middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `hydra-public-url=${encodeURIComponent(endpoints.publicUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-admin-url=${encodeURIComponent(endpoints.adminUrl)}; path=/; SameSite=Strict`;
          document.cookie = `hydra-api-key=${encryptedApiKey}; path=/; SameSite=Strict`;
        }
      },

      setIsOryNetwork: (value: boolean) => {
        set({ isOryNetwork: value });
      },

      resetToDefaults: async () => {
        const defaultEndpoints = await fetchServerDefaults();
        set({
          kratosEndpoints: defaultEndpoints.kratos,
          hydraEndpoints: defaultEndpoints.hydra,
          isOryNetwork: defaultEndpoints.isOryNetwork,
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
        // Guard against multiple calls (React StrictMode or hot reload)
        if (rehydrationProcessed) {
          return;
        }
        rehydrationProcessed = true;

        // When storage is rehydrated, check if we have valid stored endpoints
        const hasValidEndpoints = state?.kratosEndpoints?.publicUrl && state?.hydraEndpoints?.publicUrl;

        if (hasValidEndpoints) {
          // Set cookies for middleware to read
          if (typeof document !== 'undefined') {
            document.cookie = `kratos-public-url=${encodeURIComponent(state.kratosEndpoints.publicUrl)}; path=/; SameSite=Strict`;
            document.cookie = `kratos-admin-url=${encodeURIComponent(state.kratosEndpoints.adminUrl)}; path=/; SameSite=Strict`;
            document.cookie = `kratos-api-key=${state.kratosEndpoints.apiKey || ''}; path=/; SameSite=Strict`;
            document.cookie = `hydra-public-url=${encodeURIComponent(state.hydraEndpoints.publicUrl)}; path=/; SameSite=Strict`;
            document.cookie = `hydra-admin-url=${encodeURIComponent(state.hydraEndpoints.adminUrl)}; path=/; SameSite=Strict`;
            document.cookie = `hydra-api-key=${state.hydraEndpoints.apiKey || ''}; path=/; SameSite=Strict`;
          }
          // Use setTimeout to ensure React has subscribed to the store before we update state
          setTimeout(() => {
            useSettingsStore.setState({ isLoaded: true });
          }, 0);
        } else {
          // If no stored endpoints, load defaults from server
          // loadDefaults will set isLoaded: true when done
          useSettingsStore.getState().loadDefaults();
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
export const useSetIsOryNetwork = () => useSettingsStore((state) => state.setIsOryNetwork);
export const useResetSettings = () => useSettingsStore((state) => state.resetToDefaults);
export const useIsValidUrl = () => useSettingsStore((state) => state.isValidUrl);
export const useLoadDefaults = () => useSettingsStore((state) => state.loadDefaults);

// Returns true only when settings are loaded and cookies are set
export const useSettingsLoaded = () => useSettingsStore((state) => state.isLoaded);
