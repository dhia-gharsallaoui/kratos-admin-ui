import { hydraAdminClient, hydraPublicClient } from '../client';
import { apiLogger } from '@/lib/logger';

// Hydra Health Check operations

export interface HealthStatus {
  status: 'ok' | 'error';
}

export interface VersionInfo {
  version?: string;
}

// Check Hydra admin readiness
export async function checkHydraAdminReady() {
  try {
    const response = await hydraAdminClient.get<HealthStatus>('/admin/health/ready');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error checking Hydra admin readiness');
    throw error;
  }
}

// Check Hydra admin aliveness
export async function checkHydraAdminAlive() {
  try {
    const response = await hydraAdminClient.get<HealthStatus>('/admin/health/alive');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error checking Hydra admin aliveness');
    throw error;
  }
}

// Check Hydra public readiness
export async function checkHydraPublicReady() {
  try {
    const response = await hydraPublicClient.get<HealthStatus>('/health/ready');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error checking Hydra public readiness');
    throw error;
  }
}

// Check Hydra public aliveness
export async function checkHydraPublicAlive() {
  try {
    const response = await hydraPublicClient.get<HealthStatus>('/health/alive');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error checking Hydra public aliveness');
    throw error;
  }
}

// Get Hydra version information
export async function getHydraVersion() {
  try {
    const response = await hydraAdminClient.get<VersionInfo>('/admin/version');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error getting Hydra version');
    throw error;
  }
}

// Combined health check for both admin and public endpoints
export async function getHydraHealthStatus() {
  try {
    const [adminReady, adminAlive, publicReady, publicAlive, version] = await Promise.allSettled([
      checkHydraAdminReady(),
      checkHydraAdminAlive(),
      checkHydraPublicReady(),
      checkHydraPublicAlive(),
      getHydraVersion(),
    ]);

    return {
      admin: {
        ready: adminReady.status === 'fulfilled' ? adminReady.value : null,
        alive: adminAlive.status === 'fulfilled' ? adminAlive.value : null,
      },
      public: {
        ready: publicReady.status === 'fulfilled' ? publicReady.value : null,
        alive: publicAlive.status === 'fulfilled' ? publicAlive.value : null,
      },
      version: version.status === 'fulfilled' ? version.value : null,
      overall: {
        status:
          adminReady.status === 'fulfilled' &&
          adminAlive.status === 'fulfilled' &&
          publicReady.status === 'fulfilled' &&
          publicAlive.status === 'fulfilled'
            ? 'healthy'
            : 'unhealthy',
      },
    };
  } catch (error) {
    apiLogger.logError(error, 'Error getting combined Hydra health status');
    throw error;
  }
}