export type KratosConfig = {
  kratosPublicUrl: string;
  kratosAdminUrl: string;
  basePath: string;
};

// For server-side API calls
let serverConfig: KratosConfig = {
  kratosPublicUrl: process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433',
  kratosAdminUrl: process.env.KRATOS_ADMIN_URL || 'http://localhost:4434',
  basePath: process.env.BASE_PATH || '',
};

// For client-side API calls through the proxy
let clientConfig: KratosConfig = {
  kratosPublicUrl: '/api/kratos',
  kratosAdminUrl: '/api/kratos-admin',
  basePath: '',
};

// Determine if we're running on the client
const isClient = typeof window !== 'undefined';

export const getKratosConfig = (): KratosConfig => {
  return isClient ? clientConfig : serverConfig;
};

export const setKratosConfig = (newConfig: Partial<KratosConfig>): void => {
  if (isClient) {
    clientConfig = { ...clientConfig, ...newConfig };
  } else {
    serverConfig = { ...serverConfig, ...newConfig };
  }
};

export const getAdminUrl = (path: string = ''): string => {
  const config = getKratosConfig();
  return `${config.kratosAdminUrl}${path}`;
};

export const getPublicUrl = (path: string = ''): string => {
  const config = getKratosConfig();
  return `${config.kratosPublicUrl}${path}`;
};
