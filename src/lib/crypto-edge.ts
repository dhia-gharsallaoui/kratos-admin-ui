/**
 * Edge-compatible crypto utilities using Web Crypto API
 * This is used in middleware which runs in Edge Runtime
 */

const ALGORITHM = "AES-GCM";

async function getEncryptionKey(): Promise<CryptoKey> {
	const keyString = process.env.ENCRYPTION_KEY;
	if (!keyString) {
		throw new Error("ENCRYPTION_KEY environment variable is required");
	}

	// Use SHA-256 to derive a 32-byte key from the environment variable
	const encoder = new TextEncoder();
	const keyData = encoder.encode(keyString);
	const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);

	return crypto.subtle.importKey("raw", hashBuffer, { name: ALGORITHM }, false, ["decrypt"]);
}

/**
 * Decrypts an API key that was encrypted with AES-256-GCM.
 * Format expected: iv:authTag:encryptedData (all base64 encoded)
 *
 * If the value doesn't match the encrypted format (e.g., plain text from env vars),
 * it will be returned as-is for backwards compatibility.
 */
export async function decryptApiKey(encryptedValue: string): Promise<string> {
	if (!encryptedValue) return "";

	// Check if it's an encrypted value (format: iv:authTag:data)
	const parts = encryptedValue.split(":");
	if (parts.length !== 3) {
		// Not encrypted, return as-is (backwards compatibility / env var)
		return encryptedValue;
	}

	try {
		const key = await getEncryptionKey();
		const [ivBase64, authTagBase64, encryptedData] = parts;

		// Decode base64 values
		const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
		const authTag = Uint8Array.from(atob(authTagBase64), (c) => c.charCodeAt(0));
		const ciphertext = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

		// AES-GCM in Web Crypto expects ciphertext + authTag concatenated
		const combined = new Uint8Array(ciphertext.length + authTag.length);
		combined.set(ciphertext);
		combined.set(authTag, ciphertext.length);

		const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, combined);

		return new TextDecoder().decode(decrypted);
	} catch (error) {
		console.error("Decryption failed, returning as-is:", error);
		// If decryption fails, assume it's plain text (env var or migration)
		return encryptedValue;
	}
}
