import CryptoJS from "crypto-js";

const SECRET_KEY = CryptoJS.enc.Hex.parse(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || "",
);

const SECRET_IV = CryptoJS.enc.Hex.parse(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET_IV || "",
);

/**
 * Encrypt request
 */
export const encryptRequest = (data: any) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
      SECRET_KEY,
      {
        iv: SECRET_IV,
      },
    );

    return encrypted.toString(); // Base64
  } catch (err) {
    return "";
  }
};

/**
 * Decrypt response
 */
export const decryptResponse = (cipherText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY, {
      iv: SECRET_IV,
    });

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  } catch (err) {
    return {};
  }
};

export const decryptText = (cipherText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY, {
      iv: SECRET_IV,
    });

    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return "";
  }
};

/**
 * URL Safe Encryption for IDs
 */
export const encryptId = (id: string | number | undefined | null) => {
  if (id === undefined || id === null) return "";
  const encrypted = encryptRequest(id);
  // Replace standard Base64 characters to be URL safe
  return encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * URL Safe Decryption for IDs
 */
export const decryptId = (encryptedId: string | undefined | null) => {
  if (!encryptedId) return null;

  // Revert URL safe characters to standard Base64
  let str = encryptedId.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }

  try {
    const dec = decryptResponse(str);
    // decryptResponse returns object/value. If it was simpler type, we get it back.
    if (dec && typeof dec === "object" && Object.keys(dec).length === 0) {
      // Fallback if decryption returned empty object (error case in decryptResponse)
      // But decryptResponse returns {} on error.
      // If we encrypted a number 123, it returns 123.
      return null;
    }
    return dec;
  } catch (e) {
    return null;
  }
};
