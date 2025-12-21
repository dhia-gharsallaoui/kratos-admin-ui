// Export all service endpoints

// Export client utilities
export { getAdminApi, getMetadataApi, getPublicApi } from "./client";
// Export configuration utilities
export * from "./config";
export * from "./endpoints/courier";
export * from "./endpoints/health";
export * from "./endpoints/identities";
export * from "./endpoints/schemas";
export * from "./endpoints/sessions";

// Export health check utilities
export { checkKratosHealth } from "./health";
