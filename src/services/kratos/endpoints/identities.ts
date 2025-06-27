import { 
  IdentityApiGetIdentityRequest,
  IdentityApiListIdentitiesRequest,
  IdentityApiCreateIdentityRequest,
  IdentityApiPatchIdentityRequest,
  IdentityApiDeleteIdentityRequest,
  IdentityApiCreateRecoveryLinkForIdentityRequest,
} from '@ory/kratos-client';
import { getAdminApi } from '../client';

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
    createRecoveryLinkForIdentityBody: { identity_id: identityId }
  });
}

// Get all identities with automatic pagination handling
export async function getAllIdentities(options?: {
  maxPages?: number;
  pageSize?: number;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const {
    maxPages = 20,
    pageSize = 250,
    onProgress
  } = options || {};

  let allIdentities: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore = true;
  let pageCount = 0;
  
  console.log('Starting getAllIdentities fetch...');
  
  while (hasMore && pageCount < maxPages) {
    console.log(`Fetching page ${pageCount + 1} with token: ${pageToken}`);
    
    try {
      const requestParams: any = { pageSize };
      
      // Only add pageToken if it's not the first page
      if (pageToken) {
        requestParams.pageToken = pageToken;
      }
      
      const response = await listIdentities(requestParams);
      
      console.log(`Page ${pageCount + 1}: Got ${response.data.length} identities`);
      allIdentities = [...allIdentities, ...response.data];
      
      // Call progress callback if provided
      onProgress?.(allIdentities.length, pageCount + 1);
      
      // Extract next page token from Link header
      const linkHeader = response.headers?.link;
      let nextPageToken = null;
      
      if (linkHeader) {
        const nextMatch = linkHeader.match(/page_token=([^&>]+)[^>]*>;\s*rel="next"/);
        if (nextMatch) {
          nextPageToken = nextMatch[1];
        }
      }
      
      hasMore = !!nextPageToken;
      pageToken = nextPageToken || "";
      pageCount++;
      
      console.log(`Next token: ${nextPageToken}, Has more: ${hasMore}`);
      
      // Small delay to avoid overwhelming the API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error fetching page ${pageCount + 1}:`, error);
      hasMore = false; // Stop on error
    }
  }
  
  console.log(`Total identities fetched: ${allIdentities.length}`);
  
  return {
    identities: allIdentities,
    totalCount: allIdentities.length,
    isComplete: !hasMore, // true if we got all identities, false if limited by maxPages
    pagesFetched: pageCount
  };
}