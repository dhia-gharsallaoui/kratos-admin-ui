import { Configuration, ConfigurationParameters, CourierApi, IdentityApi, MetadataApi } from '@ory/kratos-client';
import { getAdminUrl, getPublicUrl } from './config';

// Create configurations for API clients
const getAdminConfiguration = (): Configuration => {
  const defaultConfig: ConfigurationParameters = {};

  return new Configuration({
    ...defaultConfig,
    basePath: getAdminUrl(),
  });
};

const getPublicConfiguration = (): Configuration => {
  const defaultConfig: ConfigurationParameters = {};

  return new Configuration({
    ...defaultConfig,
    basePath: getPublicUrl(),
    baseOptions: {
      withCredentials: true,
    },
  });
};

// API client getters
export const getAdminApi = () => new IdentityApi(getAdminConfiguration());
export const getPublicApi = () => new IdentityApi(getPublicConfiguration());
export const getMetadataApi = () => new MetadataApi(getPublicConfiguration());
export const getCourierApi = () => new CourierApi(getAdminConfiguration());
