import { IdentityApiListIdentitySessionsRequest } from '@ory/kratos-client';
import { getAdminApi } from '../client';

// Session operations
export async function listIdentitySessions(params: IdentityApiListIdentitySessionsRequest) {
  const adminApi = getAdminApi();
  return await adminApi.listIdentitySessions(params);
}

export async function listSessions(active?: boolean) {
  const adminApi = getAdminApi();
  return await adminApi.listSessions({expand: ['identity'], active});
}

// Get all sessions with automatic pagination handling
export async function getAllSessions(options?: {
  maxPages?: number;
  pageSize?: number;
  active?: boolean;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const {
    maxPages = 20,
    pageSize = 250,
    active,
    onProgress
  } = options || {};

  let allSessions: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore = true;
  let pageCount = 0;
  
  console.log('Starting getAllSessions fetch...');
  
  while (hasMore && pageCount < maxPages) {
    console.log(`Fetching sessions page ${pageCount + 1} with token: ${pageToken}`);
    
    try {
      const requestParams: any = { 
        pageSize, 
        expand: ['identity'],
        active
      };
      
      // Only add pageToken if it's not the first page
      if (pageToken) {
        requestParams.pageToken = pageToken;
      }
      
      const adminApi = getAdminApi();
      const response = await adminApi.listSessions(requestParams);
      
      console.log(`Sessions page ${pageCount + 1}: Got ${response.data.length} sessions`);
      allSessions = [...allSessions, ...response.data];
      
      // Call progress callback if provided
      onProgress?.(allSessions.length, pageCount + 1);
      
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
      console.error(`Error fetching sessions page ${pageCount + 1}:`, error);
      hasMore = false; // Stop on error
    }
  }
  
  console.log(`Total sessions fetched: ${allSessions.length}`);
  
  return {
    sessions: allSessions,
    totalCount: allSessions.length,
    isComplete: !hasMore, // true if we got all sessions, false if limited by maxPages
    pagesFetched: pageCount
  };
}

// Get sessions until a specific date with smart pagination stopping
export async function getSessionsUntilDate(options?: {
  maxPages?: number;
  pageSize?: number;
  active?: boolean;
  untilDate?: Date;
  onProgress?: (currentCount: number, pageNumber: number) => void;
}) {
  const {
    maxPages = 20,
    pageSize = 250,
    active,
    untilDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
    onProgress
  } = options || {};

  let allSessions: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore = true;
  let pageCount = 0;
  let shouldStop = false;
  
  console.log(`Starting getSessionsUntilDate fetch until: ${untilDate.toISOString()}`);
  
  while (hasMore && pageCount < maxPages && !shouldStop) {
    console.log(`Fetching sessions page ${pageCount + 1} with token: ${pageToken}`);
    
    try {
      const requestParams: any = { 
        pageSize, 
        expand: ['identity'],
        active
      };
      
      // Only add pageToken if it's not the first page
      if (pageToken) {
        requestParams.pageToken = pageToken;
      }
      
      const adminApi = getAdminApi();
      const response = await adminApi.listSessions(requestParams);
      
      console.log(`Sessions page ${pageCount + 1}: Got ${response.data.length} sessions`);
      
      // Filter sessions and check if we should stop
      const currentPageSessions = response.data;
      const relevantSessions: any[] = [];
      
      for (const session of currentPageSessions) {
        // Check session creation date (authenticated_at is when session was created)
        const sessionDate = new Date(session.authenticated_at || session.issued_at || '');
        
        if (sessionDate >= untilDate) {
          relevantSessions.push(session);
        } else {
          // Found a session older than our cutoff date, stop fetching
          console.log(`Found session older than ${untilDate.toISOString()}, stopping pagination`);
          shouldStop = true;
          break;
        }
      }
      
      allSessions = [...allSessions, ...relevantSessions];
      
      // Call progress callback if provided
      onProgress?.(allSessions.length, pageCount + 1);
      
      // If we didn't find any relevant sessions in this page, also stop
      if (relevantSessions.length === 0) {
        console.log('No relevant sessions found in this page, stopping pagination');
        shouldStop = true;
      }
      
      if (!shouldStop) {
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
        
        console.log(`Next token: ${nextPageToken}, Has more: ${hasMore}`);
        
        // Small delay to avoid overwhelming the API
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      pageCount++;
      
    } catch (error) {
      console.error(`Error fetching sessions page ${pageCount + 1}:`, error);
      hasMore = false; // Stop on error
      shouldStop = true;
    }
  }
  
  console.log(`Total relevant sessions fetched: ${allSessions.length}`);
  
  return {
    sessions: allSessions,
    totalCount: allSessions.length,
    isComplete: shouldStop || !hasMore, // true if we got all relevant sessions
    pagesFetched: pageCount,
    stoppedAtDate: shouldStop // indicates if we stopped due to date cutoff
  };
}
