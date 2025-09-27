import { hydraAdminClient, hydraPublicClient } from '../client';
import { IntrospectedOAuth2Token } from '../types';
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
  client_secret?: string;
  scope?: string;
  audience?: string;
  [key: string]: any;
}

// Introspect OAuth2 token
export async function introspectOAuth2Token(tokenData: IntrospectTokenRequest) {
  try {
    const formData = new URLSearchParams();
    formData.append('token', tokenData.token);
    if (tokenData.scope) {
      formData.append('scope', tokenData.scope);
    }

    const response = await hydraAdminClient.post<IntrospectedOAuth2Token>(
      '/admin/oauth2/introspect',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error introspecting OAuth2 token');
    throw error;
  }
}

// Revoke OAuth2 token
export async function revokeOAuth2Token(tokenData: RevokeTokenRequest) {
  try {
    const formData = new URLSearchParams();
    formData.append('token', tokenData.token);
    if (tokenData.client_id) {
      formData.append('client_id', tokenData.client_id);
    }
    if (tokenData.client_secret) {
      formData.append('client_secret', tokenData.client_secret);
    }

    const response = await hydraPublicClient.post(
      '/oauth2/revoke',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error revoking OAuth2 token');
    throw error;
  }
}

// Exchange tokens (OAuth2 token endpoint)
export async function exchangeOAuth2Token(tokenData: TokenExchangeRequest) {
  try {
    const formData = new URLSearchParams();

    Object.entries(tokenData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await hydraPublicClient.post(
      '/oauth2/token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error exchanging OAuth2 token');
    throw error;
  }
}

// Delete OAuth2 access tokens for a subject
export async function deleteOAuth2AccessTokens(subject: string) {
  try {
    const response = await hydraAdminClient.delete(
      `/admin/oauth2/tokens?subject=${encodeURIComponent(subject)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error deleting OAuth2 access tokens for subject ${subject}`);
    throw error;
  }
}

// Flush inactive OAuth2 tokens
export async function flushInactiveOAuth2Tokens(notAfter?: string) {
  try {
    const queryParams = new URLSearchParams();
    if (notAfter) {
      queryParams.append('notAfter', notAfter);
    }

    const url = `/admin/oauth2/flush${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await hydraAdminClient.post(url);
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error flushing inactive OAuth2 tokens');
    throw error;
  }
}

// Get OAuth2 token metadata (if supported)
export async function getOAuth2TokenMetadata(tokenId: string) {
  try {
    const response = await hydraAdminClient.get(
      `/admin/oauth2/tokens/${encodeURIComponent(tokenId)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 token metadata for ${tokenId}`);
    throw error;
  }
}