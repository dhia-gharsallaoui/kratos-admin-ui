import { IdentityApiGetIdentitySchemaRequest, IdentityApiListIdentitySchemasRequest } from '@ory/kratos-client';
import { getAdminApi, getPublicApi } from '../client';

// Schema operations
export async function getIdentitySchema(params: IdentityApiGetIdentitySchemaRequest) {
  const adminApi = getAdminApi();
  return await adminApi.getIdentitySchema(params);
}

export async function listIdentitySchemas(params: IdentityApiListIdentitySchemasRequest = {}) {
  const publicApi = getPublicApi();
  return await publicApi.listIdentitySchemas(params);
}
