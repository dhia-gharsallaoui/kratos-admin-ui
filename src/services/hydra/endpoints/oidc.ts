import { getWellknownApi, getOidcApi } from '../client';
import { OidcConfiguration, OidcUserInfo, JsonWebKeySet } from '@ory/hydra-client';
import { apiLogger } from '@/lib/logger';
import { withApiErrorHandling } from '@/utils/api-wrapper';

// OpenID Connect operations

// Get OpenID Connect configuration (well-known endpoint)
export async function getOidcConfiguration() {
  return withApiErrorHandling(async () => {
    const response = await getOidcApi().discoverOidcConfiguration();
    return { data: response.data };
  }, 'Hydra');
}

// Get JSON Web Key Set (JWKS)
export async function getJsonWebKeySet() {
  return withApiErrorHandling(async () => {
    const response = await getWellknownApi().discoverJsonWebKeys();
    return { data: response.data };
  }, 'Hydra');
}

// Get OpenID Connect UserInfo
export async function getOidcUserInfo(accessToken: string) {
  return withApiErrorHandling(async () => {
    const response = await getOidcApi().getOidcUserInfo({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { data: response.data };
  }, 'Hydra');
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
  return withApiErrorHandling(async () => {
    const response = await getOidcApi().createVerifiableCredential({
      createVerifiableCredentialRequestBody: {
        format: credentialRequest.format,
        types: credentialRequest.types,
        proof: credentialRequest.proof,
      },
    });
    return { data: response.data };
  }, 'Hydra');
}
