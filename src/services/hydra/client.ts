import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getHydraAdminUrl, getHydraPublicUrl } from './config';
import { apiLogger } from '@/lib/logger';

// Create axios configurations for Hydra API clients
const createAxiosConfig = (baseURL: string): AxiosRequestConfig => ({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API configuration
const getAdminAxiosConfig = (): AxiosRequestConfig => {
  return createAxiosConfig(getHydraAdminUrl());
};

// Public API configuration
const getPublicAxiosConfig = (): AxiosRequestConfig => {
  return createAxiosConfig(getHydraPublicUrl());
};

// Singleton axios instances for performance optimization
let adminAxiosInstance: AxiosInstance | null = null;
let publicAxiosInstance: AxiosInstance | null = null;

// Admin API client getter with singleton pattern
export const getHydraAdminClient = (): AxiosInstance => {
  if (!adminAxiosInstance) {
    adminAxiosInstance = axios.create(getAdminAxiosConfig());

    // Request interceptor for logging
    adminAxiosInstance.interceptors.request.use(
      (config) => {
        apiLogger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        apiLogger.logError(error, 'Admin request error');
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    adminAxiosInstance.interceptors.response.use(
      (response) => {
        apiLogger.debug(`Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        apiLogger.logError(error, 'Admin response error');
        return Promise.reject(error);
      }
    );
  }
  return adminAxiosInstance;
};

// Public API client getter with singleton pattern
export const getHydraPublicClient = (): AxiosInstance => {
  if (!publicAxiosInstance) {
    publicAxiosInstance = axios.create({
      ...getPublicAxiosConfig(),
      withCredentials: true,
    });

    // Request interceptor for logging
    publicAxiosInstance.interceptors.request.use(
      (config) => {
        apiLogger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        apiLogger.logError(error, 'Public request error');
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    publicAxiosInstance.interceptors.response.use(
      (response) => {
        apiLogger.debug(`Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        apiLogger.logError(error, 'Public response error');
        return Promise.reject(error);
      }
    );
  }
  return publicAxiosInstance;
};

// Generic HTTP client wrapper
export class HydraHttpClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Pre-configured HTTP clients
export const hydraAdminClient = new HydraHttpClient(getHydraAdminClient());
export const hydraPublicClient = new HydraHttpClient(getHydraPublicClient());

// Reset function for testing or configuration changes
export const resetHydraApiClients = (): void => {
  adminAxiosInstance = null;
  publicAxiosInstance = null;
};