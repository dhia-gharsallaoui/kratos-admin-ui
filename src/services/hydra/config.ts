export type HydraConfig = {
  hydraPublicUrl: string;
  hydraAdminUrl: string;
  basePath: string;
};

// For server-side API calls
let serverConfig: HydraConfig = {
  hydraPublicUrl: process.env.HYDRA_PUBLIC_URL || 'http://localhost:4444',
  hydraAdminUrl: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445',
  basePath: process.env.BASE_PATH || '',
};

// For client-side API calls through the middleware proxy
let clientConfig: HydraConfig = {
  hydraPublicUrl: '/api/hydra',
  hydraAdminUrl: '/api/hydra-admin',
  basePath: '',
};

// Determine if we're running on the client
const isClient = typeof window !== 'undefined';

export const getHydraConfig = (): HydraConfig => {
  return isClient ? clientConfig : serverConfig;
};

export const setHydraConfig = (newConfig: Partial<HydraConfig>): void => {
  if (isClient) {
    clientConfig = { ...clientConfig, ...newConfig };
  } else {
    serverConfig = { ...serverConfig, ...newConfig };
  }
};

export const getHydraAdminUrl = (path: string = ''): string => {
  const config = getHydraConfig();
  return `${config.hydraAdminUrl}${path}`;
};

export const getHydraPublicUrl = (path: string = ''): string => {
  const config = getHydraConfig();
  return `${config.hydraPublicUrl}${path}`;
};
