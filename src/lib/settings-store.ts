import * as fs from "node:fs";
import * as path from "node:path";

export interface AppSettings {
	kratosPublicUrl: string;
	kratosAdminUrl: string;
	kratosApiKey: string;
	hydraPublicUrl: string;
	hydraAdminUrl: string;
	hydraApiKey: string;
	isOryNetwork: boolean;
	hydraEnabled: boolean;
}

// Fields that can be overridden via the UI (stored in JSON file)
// API keys are env-only for security
type OverridableFields = Pick<
	AppSettings,
	"kratosPublicUrl" | "kratosAdminUrl" | "hydraPublicUrl" | "hydraAdminUrl" | "isOryNetwork" | "hydraEnabled"
>;

const SETTINGS_FILE_PATH = process.env.SETTINGS_FILE_PATH || path.join(process.cwd(), "data", "settings.json");

function getEnvDefaults(): AppSettings {
	const oryApiKey = process.env.ORY_API_KEY || "";
	return {
		kratosPublicUrl: process.env.KRATOS_PUBLIC_URL || "http://localhost:4433",
		kratosAdminUrl: process.env.KRATOS_ADMIN_URL || "http://localhost:4434",
		kratosApiKey: process.env.KRATOS_API_KEY || oryApiKey,
		hydraPublicUrl: process.env.HYDRA_PUBLIC_URL || "http://localhost:4444",
		hydraAdminUrl: process.env.HYDRA_ADMIN_URL || "http://localhost:4445",
		hydraApiKey: process.env.HYDRA_API_KEY || oryApiKey,
		isOryNetwork: process.env.IS_ORY_NETWORK === "true",
		hydraEnabled: process.env.HYDRA_ENABLED !== "false",
	};
}

function readOverrides(): Partial<OverridableFields> {
	try {
		if (fs.existsSync(SETTINGS_FILE_PATH)) {
			const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
			return JSON.parse(raw);
		}
	} catch (error) {
		console.error("Failed to read settings file:", error);
	}
	return {};
}

function writeOverrides(overrides: Partial<OverridableFields>): void {
	try {
		const dir = path.dirname(SETTINGS_FILE_PATH);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		const tmpPath = `${SETTINGS_FILE_PATH}.tmp`;
		fs.writeFileSync(tmpPath, JSON.stringify(overrides, null, "\t"), "utf-8");
		fs.renameSync(tmpPath, SETTINGS_FILE_PATH);
	} catch (error) {
		console.error("Failed to write settings file:", error);
		throw new Error("Failed to persist settings");
	}
}

export function getSettings(): AppSettings {
	const defaults = getEnvDefaults();
	const overrides = readOverrides();
	return { ...defaults, ...overrides, kratosApiKey: defaults.kratosApiKey, hydraApiKey: defaults.hydraApiKey };
}

/** Returns settings safe to expose to the client (no API keys, just configured status) */
export function getClientSettings(): Omit<AppSettings, "kratosApiKey" | "hydraApiKey"> & {
	kratosApiKeyConfigured: boolean;
	hydraApiKeyConfigured: boolean;
} {
	const settings = getSettings();
	const { kratosApiKey, hydraApiKey, ...rest } = settings;
	return {
		...rest,
		kratosApiKeyConfigured: !!kratosApiKey,
		hydraApiKeyConfigured: !!hydraApiKey,
	};
}

export function updateSettings(partial: Partial<OverridableFields>): void {
	const current = readOverrides();
	// Only allow overridable fields, strip any API key attempts
	const { kratosPublicUrl, kratosAdminUrl, hydraPublicUrl, hydraAdminUrl, isOryNetwork, hydraEnabled } = partial as any;
	const safeUpdate: Partial<OverridableFields> = {};
	if (kratosPublicUrl !== undefined) safeUpdate.kratosPublicUrl = kratosPublicUrl;
	if (kratosAdminUrl !== undefined) safeUpdate.kratosAdminUrl = kratosAdminUrl;
	if (hydraPublicUrl !== undefined) safeUpdate.hydraPublicUrl = hydraPublicUrl;
	if (hydraAdminUrl !== undefined) safeUpdate.hydraAdminUrl = hydraAdminUrl;
	if (isOryNetwork !== undefined) safeUpdate.isOryNetwork = isOryNetwork;
	if (hydraEnabled !== undefined) safeUpdate.hydraEnabled = hydraEnabled;

	writeOverrides({ ...current, ...safeUpdate });
}

export function resetSettings(): void {
	try {
		if (fs.existsSync(SETTINGS_FILE_PATH)) {
			fs.unlinkSync(SETTINGS_FILE_PATH);
		}
	} catch (error) {
		console.error("Failed to reset settings file:", error);
		throw new Error("Failed to reset settings");
	}
}
