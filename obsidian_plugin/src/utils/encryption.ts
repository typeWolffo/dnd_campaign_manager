export class EncryptionUtils {
	static getDeviceKey(): string {
		const baseKey = 'grimbane-obsidian-plugin-v1';
		const deviceInfo = `${navigator.platform}-${screen.width}x${screen.height}`;
		const combined = `${baseKey}-${deviceInfo}`;
		return this.simpleHash(combined).substring(0, 16);
	}

	static encryptSensitiveData(data: string): string {
		if (!data) return '';

		try {
			const key = this.getDeviceKey();
			const encrypted = data.split('').map((char, index) =>
				String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
			).join('');

			return btoa(encrypted);
		} catch (error) {
			console.error('Encryption failed:', error);

			return data;
		}
	}

	static decryptSensitiveData(encryptedData: string): string {
		if (!encryptedData) return '';

		try {
			const encrypted = atob(encryptedData);
			const key = this.getDeviceKey();
			const decrypted = encrypted.split('').map((char, index) =>
				String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
			).join('');

			if (decrypted.length > 10 && /^[a-zA-Z0-9_-]+$/.test(decrypted)) {
				return decrypted;
			} else {
				console.warn('Decryption resulted in invalid token format');
				return encryptedData;
			}
		} catch (error) {
			console.error('Decryption failed:', error);

			return encryptedData;
		}
	}

	private static simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		return Math.abs(hash).toString(36);
	}
}
