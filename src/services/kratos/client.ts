import { Configuration, type ConfigurationParameters, CourierApi, IdentityApi, MetadataApi } from "@ory/kratos-client";
import { getAdminUrl, getKratosConfig, getPublicUrl } from "./config";

function withApiKey(params: ConfigurationParameters): ConfigurationParameters {
	const { kratosApiKey } = getKratosConfig();
	if (kratosApiKey) {
		params.baseOptions = {
			...params.baseOptions,
			headers: {
				...(params.baseOptions?.headers as Record<string, string>),
				Authorization: `Bearer ${kratosApiKey}`,
			},
		};
	}
	return params;
}

const getAdminConfiguration = (): Configuration => {
	return new Configuration(withApiKey({ basePath: getAdminUrl() }));
};

const getPublicConfiguration = (): Configuration => {
	return new Configuration(withApiKey({ basePath: getPublicUrl() }));
};

export const getAdminApi = (): IdentityApi => {
	return new IdentityApi(getAdminConfiguration());
};

export const getPublicApi = (): IdentityApi => {
	return new IdentityApi(getPublicConfiguration());
};

export const getMetadataApi = (): MetadataApi => {
	return new MetadataApi(getPublicConfiguration());
};

export const getCourierApi = (): CourierApi => {
	return new CourierApi(getAdminConfiguration());
};
