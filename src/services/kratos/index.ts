// Export all service endpoints
export * from './endpoints/identities';
export * from './endpoints/sessions';
export * from './endpoints/schemas';
export * from './endpoints/health';

// Export client utilities
export { getAdminApi, getPublicApi, getMetadataApi } from './client';

// Export configuration utilities
export * from './config';