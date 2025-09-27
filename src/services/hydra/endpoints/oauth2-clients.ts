import { hydraAdminClient } from '../client';
import { OAuth2Client, PaginationParams, PaginatedResponse } from '../types';
import { apiLogger } from '@/lib/logger';

// OAuth2 Client CRUD operations

export interface ListOAuth2ClientsParams extends PaginationParams {
  client_name?: string;
  owner?: string;
}

export interface CreateOAuth2ClientRequest {
  client_id?: string;
  client_name?: string;
  client_secret?: string;
  client_uri?: string;
  grant_types?: string[];
  response_types?: string[];
  redirect_uris?: string[];
  scope?: string;
  audience?: string[];
  owner?: string;
  policy_uri?: string;
  tos_uri?: string;
  logo_uri?: string;
  contacts?: string[];
  subject_type?: string;
  token_endpoint_auth_method?: string;
  userinfo_signed_response_alg?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOAuth2ClientRequest extends CreateOAuth2ClientRequest {
  client_id: string;
}

// List OAuth2 clients with pagination
export async function listOAuth2Clients(params: ListOAuth2ClientsParams = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.page_token) queryParams.append('page_token', params.page_token);
    if (params.client_name) queryParams.append('client_name', params.client_name);
    if (params.owner) queryParams.append('owner', params.owner);

    const url = `/admin/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await hydraAdminClient.get<OAuth2Client[]>(url);

    return {
      ...response,
      data: response.data || [],
    };
  } catch (error) {
    apiLogger.logError(error, 'Error listing OAuth2 clients');
    throw error;
  }
}

// Get a specific OAuth2 client
export async function getOAuth2Client(clientId: string) {
  try {
    const response = await hydraAdminClient.get<OAuth2Client>(`/admin/clients/${encodeURIComponent(clientId)}`);
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 client ${clientId}`);
    throw error;
  }
}

// Create a new OAuth2 client
export async function createOAuth2Client(clientData: CreateOAuth2ClientRequest) {
  try {
    const response = await hydraAdminClient.post<OAuth2Client>('/admin/clients', clientData);
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error creating OAuth2 client');
    throw error;
  }
}

// Update an existing OAuth2 client
export async function updateOAuth2Client(clientId: string, clientData: UpdateOAuth2ClientRequest) {
  try {
    const response = await hydraAdminClient.put<OAuth2Client>(
      `/admin/clients/${encodeURIComponent(clientId)}`,
      clientData
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error updating OAuth2 client ${clientId}`);
    throw error;
  }
}

// Patch an existing OAuth2 client (partial update)
export async function patchOAuth2Client(clientId: string, clientData: Partial<CreateOAuth2ClientRequest>) {
  try {
    const response = await hydraAdminClient.patch<OAuth2Client>(
      `/admin/clients/${encodeURIComponent(clientId)}`,
      clientData
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error patching OAuth2 client ${clientId}`);
    throw error;
  }
}

// Delete an OAuth2 client
export async function deleteOAuth2Client(clientId: string) {
  try {
    const response = await hydraAdminClient.delete(`/admin/clients/${encodeURIComponent(clientId)}`);
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error deleting OAuth2 client ${clientId}`);
    throw error;
  }
}

// Get all OAuth2 clients with automatic pagination handling
export async function getAllOAuth2Clients(options?: {
  maxPages?: number;
  pageSize?: number;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const { maxPages = 20, pageSize = 250, onProgress } = options || {};

  try {
    let allClients: OAuth2Client[] = [];
    let pageToken: string | undefined;
    let pageNumber = 1;

    do {
      const response = await listOAuth2Clients({
        page_size: pageSize,
        page_token: pageToken,
      });

      const clients = response.data || [];
      allClients = [...allClients, ...clients];

      // Extract next page token from headers (common pattern)
      pageToken = response.headers['x-next-page-token'] ||
                 response.headers['next-page-token'];

      if (onProgress) {
        onProgress(allClients.length, pageNumber);
      }

      pageNumber++;

      // Stop if we have no more data or reached max pages
      if (!pageToken || clients.length < pageSize || pageNumber > maxPages) {
        break;
      }
    } while (pageToken);

    return {
      clients: allClients,
      totalCount: allClients.length,
      isComplete: !pageToken,
      pagesFetched: pageNumber - 1,
    };
  } catch (error) {
    apiLogger.logError(error, 'Error fetching all OAuth2 clients');
    throw error;
  }
}