import type { IdentityApiGetIdentitySchemaRequest, IdentityApiListIdentitySchemasRequest } from "@ory/kratos-client";
import { withApiErrorHandling } from "@/utils/api-wrapper";
import { getAdminApi, getPublicApi } from "../client";

// Schema operations
export async function getIdentitySchema(params: IdentityApiGetIdentitySchemaRequest) {
	return withApiErrorHandling(async () => {
		const adminApi = getAdminApi();
		return await adminApi.getIdentitySchema(params);
	}, "Kratos");
}

export async function listIdentitySchemas(params: IdentityApiListIdentitySchemasRequest = {}) {
	return withApiErrorHandling(async () => {
		const publicApi = getPublicApi();
		return await publicApi.listIdentitySchemas(params);
	}, "Kratos");
}
