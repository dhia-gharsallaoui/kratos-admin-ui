import { hydraPublicClient } from '../client';
import { OidcConfiguration, OidcUserInfo, JsonWebKeySet } from '../types';
import { apiLogger } from '@/lib/logger';

// OpenID Connect operations

// Get OpenID Connect configuration (well-known endpoint)
export async function getOidcConfiguration() {
  try {
    const response = await hydraPublicClient.get<OidcConfiguration>('/.well-known/openid-configuration');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error getting OIDC configuration');
    throw error;
  }
}

// Get JSON Web Key Set (JWKS)
export async function getJsonWebKeySet() {
  try {
    const response = await hydraPublicClient.get<JsonWebKeySet>('/.well-known/jwks.json');
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error getting JSON Web Key Set');
    throw error;
  }
}

// Get OpenID Connect UserInfo
export async function getOidcUserInfo(accessToken: string) {
  try {
    const response = await hydraPublicClient.get<OidcUserInfo>('/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error getting OIDC UserInfo');
    throw error;
  }
}

// Create verifiable credential (if supported)
export async function createVerifiableCredential(
  accessToken: string,
  credentialRequest: {
    format?: string;
    types?: string[];
    proof?: {
      proof_type?: string;
      jwt?: string;
    };
  }
) {
  try {
    const response = await hydraPublicClient.post('/credentials', credentialRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  } catch (error) {
    apiLogger.logError(error, 'Error creating verifiable credential');
    throw error;
  }
}