import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  constructor() {}
  public hash(stringToHash: string, salt: number): Promise<string> {
    return bcrypt.hash(stringToHash, bcrypt.genSaltSync(salt));
  }
  public compare(
    stringToCompare: string,
    hashString: string,
  ): Promise<boolean> {
    return bcrypt.compare(stringToCompare, hashString);
  }

  /**
   * Encrypts a given text using AES-256-GCM.
   * @param text The plaintext to encrypt.
   * @returns The encrypted text in the format: iv:authTag:ciphertext
   */
  public static encrypt(text: string, key: string, ivLength?: number): string {
    const algorithm = 'aes-256-gcm';
    // Generate a random initialization vector
    const iv = crypto.randomBytes(ivLength ?? 12);

    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get the Authentication Tag
    const authTag = cipher.getAuthTag();

    // Return the encrypted data with iv and authTag
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  public static async decrypt(data: string, key: string): Promise<string> {
    try {
      const algorithm = 'aes-256-gcm';
      const [ivHex, authTagHex, encryptedHex] = data.split(':');

      if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encryptedText = Buffer.from(encryptedHex, 'hex');

      // Create Decipher
      const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(key, 'utf-8'),
        iv,
      );
      decipher.setAuthTag(authTag);

      // Decrypt the text
      let decrypted = decipher.update(encryptedText, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err) {
      console.error('Decryption failed:', err);
      throw new Error('Failed to decrypt data');
    }
  }
}
