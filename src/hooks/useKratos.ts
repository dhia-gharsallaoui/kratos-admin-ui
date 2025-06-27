import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  listIdentities,
  getIdentity,
  createIdentity,
  patchIdentity,
  deleteIdentity,
  listIdentitySessions,
  getIdentitySchema,
  listIdentitySchemas,
  createRecoveryLinkForIdentity,
} from '@/lib/api/kratos/client';

// Identity hooks
export const useIdentities = (params?: { pageSize?: number; pageToken?: string }) => {
  const pageSize = params?.pageSize || 25;
  const pageToken = params?.pageToken;
  
  return useQuery({
    queryKey: ['identities', pageToken, pageSize],
    queryFn: async () => {
      const requestParams: any = { pageSize };
      if (pageToken) {
        requestParams.pageToken = pageToken;
      }
      
      const response = await listIdentities(requestParams);
      
      // Extract next page token from Link header if available
      const linkHeader = response.headers?.link;
      let nextPageToken = null;
      
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
        if (nextMatch) {
          nextPageToken = nextMatch[1];
        }
      }
      
      return {
        identities: response.data,
        nextPageToken,
        hasMore: !!nextPageToken,
        pageSize,
        currentPageToken: pageToken,
      };
    },
  });
};

// Multi-page search hook that fetches across pages until target count is reached
export const useIdentitiesSearch = (params?: { pageSize?: number; searchTerm?: string }) => {
  const pageSize = params?.pageSize || 25;
  const searchTerm = params?.searchTerm?.trim();
  
  return useQuery({
    queryKey: ['identities-search', pageSize, searchTerm],
    queryFn: async () => {
      // If no search term, use regular pagination
      if (!searchTerm) {
        const requestParams: any = { pageSize };
        const response = await listIdentities(requestParams);
        
        const linkHeader = response.headers?.link;
        let nextPageToken = null;
        
        if (linkHeader) {
          const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
          if (nextMatch) {
            nextPageToken = nextMatch[1];
          }
        }
        
        return {
          identities: response.data,
          nextPageToken,
          hasMore: !!nextPageToken,
          isSearchResult: false,
          totalFetched: response.data.length,
        };
      }
      
      // Multi-page search logic
      let allIdentities: any[] = [];
      let matchedIdentities: any[] = [];
      let pageToken: string | undefined = undefined;
      let hasMore = true;
      let pageCount = 0;
      const maxPages = 20; // Prevent infinite loops
      
      console.log(`Starting search for: "${searchTerm}"`);
      
      while (matchedIdentities.length < pageSize && hasMore && pageCount < maxPages) {
        console.log(`Searching page ${pageCount + 1} (found ${matchedIdentities.length}/${pageSize})`);
        
        try {
          const requestParams: any = { pageSize: 250 }; // Fetch max per page for efficiency
          if (pageToken) {
            requestParams.pageToken = pageToken;
          }
          
          const response = await listIdentities(requestParams);
          const pageIdentities = response.data;
          
          // Filter current page for matches
          const pageMatches = pageIdentities.filter((identity: any) => {
            const traits = identity.traits as any;
            const email = String(traits?.email || '');
            const username = String(traits?.username || '');
            const firstName = String(traits?.first_name || traits?.firstName || '');
            const lastName = String(traits?.last_name || traits?.lastName || '');
            const name = String(traits?.name || '');
            const id = String(identity.id || '');
            
            const searchLower = searchTerm.toLowerCase();
            return (
              id.toLowerCase().includes(searchLower) ||
              email.toLowerCase().includes(searchLower) ||
              username.toLowerCase().includes(searchLower) ||
              firstName.toLowerCase().includes(searchLower) ||
              lastName.toLowerCase().includes(searchLower) ||
              name.toLowerCase().includes(searchLower)
            );
          });
          
          matchedIdentities = [...matchedIdentities, ...pageMatches];
          allIdentities = [...allIdentities, ...pageIdentities];
          
          // Extract next page token
          const linkHeader = response.headers?.link;
          let nextPageToken = null;
          
          if (linkHeader) {
            const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
            if (nextMatch) {
              nextPageToken = nextMatch[1];
            }
          }
          
          hasMore = !!nextPageToken;
          pageToken = nextPageToken;
          pageCount++;
          
          console.log(`Page ${pageCount}: Found ${pageMatches.length} matches (total: ${matchedIdentities.length})`);
          
          // Small delay between requests
          if (hasMore && matchedIdentities.length < pageSize) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error searching page ${pageCount + 1}:`, error);
          hasMore = false;
        }
      }
      
      // Return up to pageSize results
      const finalResults = matchedIdentities.slice(0, pageSize);
      
      console.log(`Search complete: ${finalResults.length} results from ${pageCount} pages`);
      
      return {
        identities: finalResults,
        nextPageToken: matchedIdentities.length > pageSize ? 'search-has-more' : null,
        hasMore: matchedIdentities.length > pageSize || (hasMore && matchedIdentities.length === pageSize),
        isSearchResult: true,
        totalFetched: allIdentities.length,
        totalMatched: matchedIdentities.length,
      };
    },
    enabled: true,
    staleTime: 30 * 1000, // Cache search results for 30 seconds
  });
};

export const useIdentity = (id: string) => {
  return useQuery({
    queryKey: ['identity', id],
    queryFn: async () => {
      const { data } = await getIdentity({ id });
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateIdentity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ schemaId, traits }: { schemaId: string; traits: any }) => {
      const { data } = await createIdentity({ schema_id: schemaId, traits });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] });
    },
  });
};

export const useUpdateIdentity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      schemaId, 
      traits, 
      state 
    }: { 
      id: string; 
      schemaId: string; 
      traits: any; 
      state?: string;
    }) => {
      const jsonPatch = [
        { op: 'replace', path: '/traits', value: traits }
      ];
      
      // Only add state patch if it's provided and different from current
      if (state) {
        jsonPatch.push({ op: 'replace', path: '/state', value: state });
      }
      
      console.log('JSON Patch being sent:', jsonPatch);
      
      const { data } = await patchIdentity({ 
        id, 
        jsonPatch: jsonPatch,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['identities'] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.id] });
    },
  });
};

export const usePatchIdentity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, jsonPatch }: { id: string; jsonPatch: any[] }) => {
      const { data } = await patchIdentity({ id, jsonPatch: jsonPatch });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['identities'] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.id] });
    },
  });
};

export const useDeleteIdentity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteIdentity({ id });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identities'] });
    },
  });
};

export const useRecoverIdentity = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await createRecoveryLinkForIdentity({ identity_id: id });
      return data;
    },
  });
};

// Session hooks
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await listIdentitySessions({ id: '' });
      return data;
    },
  });
};

export const useIdentitySessions = (identityId: string) => {
  return useQuery({
    queryKey: ['identity', identityId, 'sessions'],
    queryFn: async () => {
      const { data } = await listIdentitySessions({ id: identityId });
      return data;
    },
    enabled: !!identityId,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      // Implementation depends on your API
      // await revokeSession(sessionId);
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ identityId }: { identityId: string }) => {
      // Implementation depends on your API
      // await revokeAllSessions(identityId);
      return identityId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.identityId, 'sessions'] });
    },
  });
};

// Schema hooks
export const useSchemas = () => {
  return useQuery({
    queryKey: ['schemas'],
    queryFn: async () => {
      const { data } = await listIdentitySchemas();
      return data;
    },
  });
};

export const useSchema = (id: string) => {
  return useQuery({
    queryKey: ['schema', id],
    queryFn: async () => {
      const { data } = await getIdentitySchema({ id });
      return data;
    },
    enabled: !!id,
  });
};
