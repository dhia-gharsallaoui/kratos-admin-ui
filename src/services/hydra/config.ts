import { getSettings } from "@/lib/settings-store";

export type HydraConfig = {
	hydraPublicUrl: string;
	hydraAdminUrl: string;
	hydraApiKey: string;
};

export const getHydraConfig = (): HydraConfig => {
	const settings = getSettings();
	return {
		hydraPublicUrl: settings.hydraPublicUrl,
		hydraAdminUrl: settings.hydraAdminUrl,
		hydraApiKey: settings.hydraApiKey,
	};
};

export const getHydraAdminUrl = (path = ""): string => {
	const config = getHydraConfig();
	return `${config.hydraAdminUrl}${path}`;
};

export const getHydraPublicUrl = (path = ""): string => {
	const config = getHydraConfig();
	return `${config.hydraPublicUrl}${path}`;
};
