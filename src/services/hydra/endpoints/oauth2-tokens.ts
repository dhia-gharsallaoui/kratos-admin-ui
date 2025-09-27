import { getAdminOAuth2Api, getPublicOAuth2Api } from '../client';
import { IntrospectedOAuth2Token } from '@ory/hydra-client';
import { apiLogger } from '@/lib/logger';

// OAuth2 Token operations

export interface IntrospectTokenRequest {
  token: string;
  scope?: string;
}

export interface RevokeTokenRequest {
  token: string;
  client_id?: string;
  client_secret?: string;
}

export interface TokenExchangeRequest {
  grant_type: string;
  client_id?: string;
  code?: string;
  redirect_uri?: string;
  refresh_token?: string;
  [key: string]: any;
}

// Introspect OAuth2 token
export async function introspectOAuth2Token(tokenData: IntrospectTokenRequest) {
  try {
    const response = await getAdminOAuth2Api().introspectOAuth2Token({
      token: tokenData.token,
      scope: tokenData.scope
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error introspecting OAuth2 token');
    throw error;
  }
}

// Revoke OAuth2 token
export async function revokeOAuth2Token(tokenData: RevokeTokenRequest) {
  try {
    const response = await getPublicOAuth2Api().revokeOAuth2Token({
      token: tokenData.token,
      clientId: tokenData.client_id,
      clientSecret: tokenData.client_secret
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error revoking OAuth2 token');
    throw error;
  }
}

// Exchange tokens (OAuth2 token endpoint)
export async function exchangeOAuth2Token(tokenData: TokenExchangeRequest) {
  try {
    const response = await getPublicOAuth2Api().oauth2TokenExchange({
      grantType: tokenData.grant_type,
      clientId: tokenData.client_id,
      code: tokenData.code,
      redirectUri: tokenData.redirect_uri,
      refreshToken: tokenData.refresh_token
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error exchanging OAuth2 token');
    throw error;
  }
}

// Delete OAuth2 access tokens for a client
export async function deleteOAuth2AccessTokens(clientId: string) {
  try {
    const response = await getAdminOAuth2Api().deleteOAuth2Token({ clientId });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error deleting OAuth2 access tokens for client ${clientId}`);
    throw error;
  }
}

// Flush inactive OAuth2 tokens (Note: This method may not be available in the official client)
export async function flushInactiveOAuth2Tokens(notAfter?: string) {
  try {
    // This endpoint might not be available in the official Hydra client
    // Check the official documentation for availability
    throw new Error('Flush inactive tokens endpoint not available in official client');
  } catch (error) {
    apiLogger.logError(error, 'Error flushing inactive OAuth2 tokens');
    throw error;
  }
}

// Get OAuth2 token metadata (if supported)
export async function getOAuth2TokenMetadata(tokenId: string) {
  try {
    // Note: This might not be available in the official client
    // Check the actual API for availability
    const response = await getAdminOAuth2Api().introspectOAuth2Token({ token: tokenId });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 token metadata for ${tokenId}`);
    throw error;
  }
}