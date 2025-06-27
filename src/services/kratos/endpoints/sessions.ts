import { IdentityApiListIdentitySessionsRequest } from '@ory/kratos-client';
import { getAdminApi } from '../client';

// Session operations
export async function listIdentitySessions(params: IdentityApiListIdentitySessionsRequest) {
  const adminApi = getAdminApi();
  return await adminApi.listIdentitySessions(params);
}

export async function listSessions(activeOnly?: boolean) {
  const adminApi = getAdminApi();
  return await adminApi.listSessions({expand: ['identity'], active: activeOnly});
}