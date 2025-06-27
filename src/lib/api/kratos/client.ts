/**
 * This file provides the Kratos API clients and utility functions
 * for working with the Kratos API throughout the application.
 */
import { 
  Configuration, 
  ConfigurationParameters,
  IdentityApi,
  IdentityApiGetIdentityRequest,
  IdentityApiListIdentitiesRequest,
  IdentityApiListIdentitySessionsRequest,
  IdentityApiCreateIdentityRequest,
  IdentityApiPatchIdentityRequest,
  IdentityApiDeleteIdentityRequest,
  IdentityApiGetIdentitySchemaRequest,
  IdentityApiListIdentitySchemasRequest,
  IdentityApiCreateRecoveryLinkForIdentityRequest,
  MetadataApi,
} from '@ory/kratos-client';
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

// Instantiate API clients using IdentityApi
const adminApi = new IdentityApi(getAdminConfiguration());
const publicApi = new IdentityApi(getPublicConfiguration());
const metadataApi = new MetadataApi(getPublicConfiguration());

// Admin API wrappers
export async function listIdentities(params: IdentityApiListIdentitiesRequest = {}) {
  return await adminApi.listIdentities(params);
}

export async function getIdentity(params: IdentityApiGetIdentityRequest) {
  return await adminApi.getIdentity(params);
}

export async function createIdentity(params: IdentityApiCreateIdentityRequest) {
  return await adminApi.createIdentity(params);
}

export async function patchIdentity(params: IdentityApiPatchIdentityRequest) {
  return await adminApi.patchIdentity(params);
}

export async function deleteIdentity(params: IdentityApiDeleteIdentityRequest) {
  return await adminApi.deleteIdentity(params);
}

export async function listIdentitySessions(params: IdentityApiListIdentitySessionsRequest) {
  return await adminApi.listIdentitySessions(params);
}

export async function listSessions(activeOnly?: boolean) {
  return await adminApi.listSessions({expand: ['identity'], active: activeOnly});
}

export async function getIdentitySchema(params: IdentityApiGetIdentitySchemaRequest) {
  return await adminApi.getIdentitySchema(params);
}

export async function createRecoveryLinkForIdentity(params: IdentityApiCreateRecoveryLinkForIdentityRequest) {
  return await adminApi.createRecoveryLinkForIdentity(params);
}

// Simplified wrapper for easier use
export async function createRecoveryLink(identityId: string) {
  return await adminApi.createRecoveryLinkForIdentity({
    createRecoveryLinkForIdentityBody: { identity_id: identityId }
  });
}

// Public API methods
export async function listIdentitySchemas(params: IdentityApiListIdentitySchemasRequest = {}) {
  return await publicApi.listIdentitySchemas(params);
}

// Metadata API methods
export async function checkKratosReady():Promise<boolean> {
    // Check if alive
    try {
      const aliveResponse = await metadataApi.isAlive();
      if (aliveResponse.status !== 200) {
        return false;
      }
    } catch (error) {
      return false;
    }

    // Check if ready
    try {
      const readyResponse = await metadataApi.isReady();
      
      if (readyResponse.status !== 200) {
        return false;
      }
    } catch (error) {
      return false;
    }
    return true;
}

export async function getKratosVersion():Promise<string> {
  const versionResponse = await metadataApi.getVersion();
  return versionResponse.data.version;
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

// Error handling utilities
export function handleKratosApiError(error: any) {
  if (!error.response) {
    console.error('Network error:', error);
    return {
      status: 500,
      message: 'Network error, please try again later.',
    };
  }

  const { status, data } = error.response;
  
  console.error('Kratos API error:', status, data);
  
  return {
    status,
    message: data.error?.message || 'An unknown error occurred.',
    details: data.error?.details || {},
  };
}
