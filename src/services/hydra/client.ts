import {
	Configuration,
	type ConfigurationParameters,
	MetadataApi as HydraMetadataApi,
	JwkApi,
	OAuth2Api,
	OidcApi,
	WellknownApi,
} from "@ory/hydra-client";
import { getHydraAdminUrl, getHydraPublicUrl } from "./config";

// Create configurations for Hydra API clients
const getAdminConfiguration = (): Configuration => {
	const defaultConfig: ConfigurationParameters = {};

	return new Configuration({
		...defaultConfig,
		basePath: getHydraAdminUrl(),
	});
};

const getPublicConfiguration = (): Configuration => {
	const defaultConfig: ConfigurationParameters = {};

	return new Configuration({
		...defaultConfig,
		basePath: getHydraPublicUrl(),
		baseOptions: {
			withCredentials: true,
		},
	});
};

// Singleton API clients for performance optimization
let adminOAuth2ApiInstance: OAuth2Api | null = null;
let publicOAuth2ApiInstance: OAuth2Api | null = null;
let hydraMetadataApiInstance: HydraMetadataApi | null = null;
let wellknownApiInstance: WellknownApi | null = null;
let jwkApiInstance: JwkApi | null = null;
let oidcApiInstance: OidcApi | null = null;

// API client getters with singleton pattern
export const getAdminOAuth2Api = (): OAuth2Api => {
	if (!adminOAuth2ApiInstance) {
		adminOAuth2ApiInstance = new OAuth2Api(getAdminConfiguration());
	}
	return adminOAuth2ApiInstance;
};

export const getPublicOAuth2Api = (): OAuth2Api => {
	if (!publicOAuth2ApiInstance) {
		publicOAuth2ApiInstance = new OAuth2Api(getPublicConfiguration());
	}
	return publicOAuth2ApiInstance;
};

export const getHydraMetadataApi = (): HydraMetadataApi => {
	if (!hydraMetadataApiInstance) {
		hydraMetadataApiInstance = new HydraMetadataApi(getPublicConfiguration());
	}
	return hydraMetadataApiInstance;
};

export const getWellknownApi = (): WellknownApi => {
	if (!wellknownApiInstance) {
		wellknownApiInstance = new WellknownApi(getPublicConfiguration());
	}
	return wellknownApiInstance;
};

export const getJwkApi = (): JwkApi => {
	if (!jwkApiInstance) {
		jwkApiInstance = new JwkApi(getAdminConfiguration());
	}
	return jwkApiInstance;
};

export const getOidcApi = (): OidcApi => {
	if (!oidcApiInstance) {
		oidcApiInstance = new OidcApi(getPublicConfiguration());
	}
	return oidcApiInstance;
};

// Reset function for testing or configuration changes
export const resetHydraApiClients = (): void => {
	adminOAuth2ApiInstance = null;
	publicOAuth2ApiInstance = null;
	hydraMetadataApiInstance = null;
	wellknownApiInstance = null;
	jwkApiInstance = null;
	oidcApiInstance = null;
};
