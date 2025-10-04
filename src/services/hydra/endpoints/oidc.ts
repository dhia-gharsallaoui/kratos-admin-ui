import { getWellknownApi, getOidcApi } from '../client';
import { OidcConfiguration, OidcUserInfo, JsonWebKeySet } from '@ory/hydra-client';
import { apiLogger } from '@/lib/logger';

// OpenID Connect operations

// Get OpenID Connect configuration (well-known endpoint)
export async function getOidcConfiguration() {
  try {
    const response = await getOidcApi().discoverOidcConfiguration();
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error getting OIDC configuration');
    throw error;
  }
}

// Get JSON Web Key Set (JWKS)
export async function getJsonWebKeySet() {
  try {
    const response = await getWellknownApi().discoverJsonWebKeys();
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error getting JSON Web Key Set');
    throw error;
  }
}

// Get OpenID Connect UserInfo
export async function getOidcUserInfo(accessToken: string) {
  try {
    const response = await getOidcApi().getOidcUserInfo({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { data: response.data };
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
    const response = await getOidcApi().createVerifiableCredential({
      createVerifiableCredentialRequestBody: {
        format: credentialRequest.format,
        types: credentialRequest.types,
        proof: credentialRequest.proof,
      },
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, 'Error creating verifiable credential');
    throw error;
  }
}
