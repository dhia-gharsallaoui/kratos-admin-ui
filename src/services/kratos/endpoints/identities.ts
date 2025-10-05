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
import { withApiErrorHandling } from '@/utils/api-wrapper';

// Identity CRUD operations
export async function listIdentities(params: IdentityApiListIdentitiesRequest = {}) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.listIdentities(params);
  }, 'Kratos');
}

export async function getIdentity(params: IdentityApiGetIdentityRequest) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.getIdentity(params);
  }, 'Kratos');
}

export async function createIdentity(params: IdentityApiCreateIdentityRequest) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.createIdentity(params);
  }, 'Kratos');
}

export async function patchIdentity(params: IdentityApiPatchIdentityRequest) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.patchIdentity(params);
  }, 'Kratos');
}

export async function deleteIdentity(params: IdentityApiDeleteIdentityRequest) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.deleteIdentity(params);
  }, 'Kratos');
}

// Recovery operations
export async function createRecoveryLinkForIdentity(params: IdentityApiCreateRecoveryLinkForIdentityRequest) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.createRecoveryLinkForIdentity(params);
  }, 'Kratos');
}

// Simplified wrapper for easier use
export async function createRecoveryLink(identityId: string) {
  return withApiErrorHandling(async () => {
    const adminApi = getAdminApi();
    return await adminApi.createRecoveryLinkForIdentity({
      createRecoveryLinkForIdentityBody: { identity_id: identityId },
    });
  }, 'Kratos');
}

// Get all identities with automatic pagination handling
export async function getAllIdentities(options?: {
  maxPages?: number;
  pageSize?: number;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const { maxPages = 20, pageSize = 250, onProgress } = options || {};

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
}
