import { getSettings } from "@/lib/settings-store";

export type KratosConfig = {
	kratosPublicUrl: string;
	kratosAdminUrl: string;
	kratosApiKey: string;
};

export const getKratosConfig = (): KratosConfig => {
	const settings = getSettings();
	return {
		kratosPublicUrl: settings.kratosPublicUrl,
		kratosAdminUrl: settings.kratosAdminUrl,
		kratosApiKey: settings.kratosApiKey,
	};
};

export const getAdminUrl = (path = ""): string => {
	const config = getKratosConfig();
	return `${config.kratosAdminUrl}${path}`;
};

export const getPublicUrl = (path = ""): string => {
	const config = getKratosConfig();
	return `${config.kratosPublicUrl}${path}`;
};
