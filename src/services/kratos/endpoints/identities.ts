import {
  IdentityApiGetIdentityRequest,
  IdentityApiListIdentitiesRequest,
  IdentityApiCreateIdentityRequest,
  IdentityApiPatchIdentityRequest,
  IdentityApiDeleteIdentityRequest,
  IdentityApiCreateRecoveryLinkForIdentityRequest,
} from '@ory/kratos-client';
import { getAdminApi } from '../client';
import { fetchAllPages, processPaginatedResponse } from '@/lib/pagination-utils';
import { apiLogger } from '@/lib/logger';

// Identity CRUD operations
export async function listIdentities(params: IdentityApiListIdentitiesRequest = {}) {
  const adminApi = getAdminApi();
  return await adminApi.listIdentities(params);
}

export async function getIdentity(params: IdentityApiGetIdentityRequest) {
  const adminApi = getAdminApi();
  return await adminApi.getIdentity(params);
}

export async function createIdentity(params: IdentityApiCreateIdentityRequest) {
  const adminApi = getAdminApi();
  return await adminApi.createIdentity(params);
}

export async function patchIdentity(params: IdentityApiPatchIdentityRequest) {
  const adminApi = getAdminApi();
  return await adminApi.patchIdentity(params);
}

export async function deleteIdentity(params: IdentityApiDeleteIdentityRequest) {
  const adminApi = getAdminApi();
  return await adminApi.deleteIdentity(params);
}

// Recovery operations
export async function createRecoveryLinkForIdentity(params: IdentityApiCreateRecoveryLinkForIdentityRequest) {
  const adminApi = getAdminApi();
  return await adminApi.createRecoveryLinkForIdentity(params);
}

// Simplified wrapper for easier use
export async function createRecoveryLink(identityId: string) {
  const adminApi = getAdminApi();
  return await adminApi.createRecoveryLinkForIdentity({
    createRecoveryLinkForIdentityBody: { identity_id: identityId },
  });
}

// Get all identities with automatic pagination handling
export async function getAllIdentities(options?: {
  maxPages?: number;
  pageSize?: number;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const { maxPages = 20, pageSize = 250, onProgress } = options || {};

  try {
    const allIdentities = await fetchAllPages(
      async (pageToken) => {
        const requestParams: any = { pageSize };
        if (pageToken) {
          requestParams.pageToken = pageToken;
        }
        const response = await listIdentities(requestParams);
        return {
          data: response.data,
          headers: response.headers || {},
        };
      },
      {
        maxPages,
        onProgress: onProgress ? (current: number) => onProgress(current, Math.ceil(current / pageSize)) : undefined,
        stopOnError: false,
      }
    );

    return {
      identities: allIdentities,
      totalCount: allIdentities.length,
      isComplete: true,
      pagesFetched: Math.ceil(allIdentities.length / pageSize),
    };
  } catch (error) {
    apiLogger.logError(error, 'Error fetching all identities');
    throw error;
  }
}
