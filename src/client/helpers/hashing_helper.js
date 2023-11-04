export const calcSha256 = async (oUint8Array) => {
	const hashBuffer = await window.crypto.subtle.digest("SHA-256", oUint8Array)
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}