import { withApiErrorHandling } from "@/utils/api-wrapper";
import { getOidcApi, getWellknownApi } from "../client";

// OpenID Connect operations

// Get OpenID Connect configuration (well-known endpoint)
export async function getOidcConfiguration() {
	return withApiErrorHandling(async () => {
		const response = await getOidcApi().discoverOidcConfiguration();
		return { data: response.data };
	}, "Hydra");
}

// Get JSON Web Key Set (JWKS)
export async function getJsonWebKeySet() {
	return withApiErrorHandling(async () => {
		const response = await getWellknownApi().discoverJsonWebKeys();
		return { data: response.data };
	}, "Hydra");
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
	}, "Hydra");
}

// Create verifiable credential (if supported)
export async function createVerifiableCredential(
	_accessToken: string,
	credentialRequest: {
		format?: string;
		types?: string[];
		proof?: {
			proof_type?: string;
			jwt?: string;
		};
	},
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
	}, "Hydra");
}
