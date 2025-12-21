import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) {
		throw new Error("ENCRYPTION_KEY environment variable is required");
	}
	// Use SHA-256 to ensure we have exactly 32 bytes for AES-256
	return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypts an API key using AES-256-GCM.
 * Returns format: iv:authTag:encryptedData (all base64 encoded)
 */
export function encryptApiKey(apiKey: string | undefined): string {
	if (!apiKey) return "";

	const key = getEncryptionKey();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(apiKey, "utf8", "base64");
	encrypted += cipher.final("base64");
	const authTag = cipher.getAuthTag();

	return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypts an API key that was encrypted with AES-256-GCM.
 * Format expected: iv:authTag:encryptedData (all base64 encoded)
 *
 * If the value doesn't match the encrypted format (e.g., plain text from env vars),
 * it will be returned as-is for backwards compatibility.
 */
export function decryptApiKey(encryptedValue: string): string {
	if (!encryptedValue) return "";

	// Check if it's an encrypted value (format: iv:authTag:data)
	const parts = encryptedValue.split(":");
	if (parts.length !== 3) {
		// Not encrypted, return as-is (backwards compatibility / env var)
		return encryptedValue;
	}

	try {
		const [ivBase64, authTagBase64, encryptedData] = parts;
		const key = getEncryptionKey();
		const iv = Buffer.from(ivBase64, "base64");
		const authTag = Buffer.from(authTagBase64, "base64");

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encryptedData, "base64", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("Decryption failed, returning as-is:", error);
		// If decryption fails, assume it's plain text (env var or migration)
		return encryptedValue;
	}
}
