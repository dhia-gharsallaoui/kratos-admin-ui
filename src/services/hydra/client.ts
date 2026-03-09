import {
	Configuration,
	type ConfigurationParameters,
	MetadataApi as HydraMetadataApi,
	JwkApi,
	OAuth2Api,
	OidcApi,
	WellknownApi,
} from "@ory/hydra-client";
import { getHydraAdminUrl, getHydraConfig, getHydraPublicUrl } from "./config";

function withApiKey(params: ConfigurationParameters): ConfigurationParameters {
	const { hydraApiKey } = getHydraConfig();
	if (hydraApiKey) {
		params.baseOptions = {
			...params.baseOptions,
			headers: {
				...(params.baseOptions?.headers as Record<string, string>),
				Authorization: `Bearer ${hydraApiKey}`,
			},
		};
	}
	return params;
}

const getAdminConfiguration = (): Configuration => {
	return new Configuration(withApiKey({ basePath: getHydraAdminUrl() }));
};

const getPublicConfiguration = (): Configuration => {
	return new Configuration(withApiKey({ basePath: getHydraPublicUrl() }));
};

export const getAdminOAuth2Api = (): OAuth2Api => {
	return new OAuth2Api(getAdminConfiguration());
};

export const getPublicOAuth2Api = (): OAuth2Api => {
	return new OAuth2Api(getPublicConfiguration());
};

export const getHydraMetadataApi = (): HydraMetadataApi => {
	return new HydraMetadataApi(getPublicConfiguration());
};

export const getWellknownApi = (): WellknownApi => {
	return new WellknownApi(getPublicConfiguration());
};

export const getJwkApi = (): JwkApi => {
	return new JwkApi(getAdminConfiguration());
};

export const getOidcApi = (): OidcApi => {
	return new OidcApi(getPublicConfiguration());
};
