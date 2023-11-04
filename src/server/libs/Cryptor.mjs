import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import crypto from 'crypto';
import fs from "node:fs"

/*
While the IV needs to be unique and unpredictable for each encryption operation, it doesn't need to be kept secret 
like the encryption key (secret). In fact, it is common practice to include the IV in the ciphertext, as it is required for 
decryption and does not compromise the security of the encryption. The important thing is to ensure that the IV is 
not reused for multiple encryption operations using the same key, as this can weaken the security of the encryption.
*/

/**
 * @class Cryptor
 * @hideconstructor
 */
class Cryptor {
	static SECRET = Buffer.from(process.env.SECRET_KEY, "utf-8")//process.env.SECRET_KEY; // replace with your own secret key
	static ALGORITHM = 'aes-256-gcm';
	static AUTH_TAG_LENGTH = 16;

	static encrypt(object) {
		Logger.debug("Encrypting..")
		const serialized_object = JSON.stringify(object)
		const iv = Buffer.from(crypto.randomBytes(16).toString('hex'), 'hex');
		// The Secret Message
		const secret_msg = Buffer.from(serialized_object, 'utf-8');
		// Encrypt
		const cipher = crypto.createCipheriv(this.ALGORITHM, this.SECRET, iv, { authTagLength: this.AUTH_TAG_LENGTH });
		const encryptedData = Buffer.concat([cipher.update(secret_msg), cipher.final(), cipher.getAuthTag()]);
		// Separate the encrypted data from the Auth Tag
		const dataToDecrypt = encryptedData.slice(0, encryptedData.length - this.AUTH_TAG_LENGTH);
		const authTag = encryptedData.slice(encryptedData.length - this.AUTH_TAG_LENGTH, encryptedData.length);

		const result = { cypher: dataToDecrypt.toString("hex"), iv: iv.toString("hex"), tag: authTag.toString("hex") }
		// serialize to send over the wire
		return JSON.stringify(result)
	}

	static decrypt(serialized_cypher_object) {
		Logger.debug("Decrypting..")
		const cypher_object = JSON.parse(serialized_cypher_object)
		const iv = Buffer.from(cypher_object.iv, "hex")
		const cypher = Buffer.from(cypher_object.cypher, "hex")
		const authTag = Buffer.from(cypher_object.tag, "hex")
		// Decrypt
		let decipher = crypto.createDecipheriv(this.ALGORITHM, this.SECRET, iv, { authTagLength: this.AUTH_TAG_LENGTH });
		decipher.setAuthTag(authTag);
		let decryptedData = Buffer.concat([decipher.update(cypher), decipher.final()]);
		let result = decryptedData.toString("utf-8")
		// deserialize from the wire
		return JSON.parse(result)
	}

	/**
	 * Calculates the sha256 hash from a buffer 
	 * (if a string is given, it will be converted to a buffer instead)
	 * IMPORTANT NOTE: This method calculates different shasums compared to
	 * the client. I am not sure why, just don't use it to compare file content.
	 * Use calculateSHA256 instead.
	 *
	 * @param   {Object} oBuffer the buffer to calculate the hash for
	 *
	 * @returns {string}         hexadecimal string expression of the hash
	 */
	static async sha256 (oBuffer) {
		if (typeof oBuffer === 'string') oBuffer = Buffer.from(oBuffer, 'utf8');
		const hashBuffer = await crypto.subtle.digest("SHA-256", oBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""); // convert bytes to hex string
		return hashHex
	}



	/**
	 * Calculates the sha356 hash for the file at the given location
	 *
	 * @param   {String} sFilePath file location
	 *
	 * @returns {string}           hexadecimal string expression of the hash
	 */
	static calculateSHA256 = (filePath) => {
	  return new Promise((resolve, reject) => {
	    const hash = crypto.createHash('sha256');

	    const stream = fs.createReadStream(filePath);

	    stream.on('data', (data) => {
	      hash.update(data);
	    });

	    stream.on('end', () => {
	      const sha256sum = hash.digest('hex');
	      resolve(sha256sum);
	    });

	    stream.on('error', (error) => {
	      reject(error);
	    });
	  });
	};




	/* functino aliases */
	static en = this.encrypt
	static hash = this.sha256
	static hashFile = this.calculateSHA256
	static de = this.decrypt
}

export default Cryptor