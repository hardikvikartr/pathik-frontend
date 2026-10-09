import CryptoJS from "crypto-js";
import { encryptRequest, decryptResponse } from "./encryption";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_CRYPTO_SECRET || "your-secret-key-here";

const hashKey = (key: string): string => {
  return CryptoJS.HmacSHA256(key, SECRET_KEY).toString();
};

export const SecureStorage = {
  setItem: (key: string, value: any): void => {
    if (typeof window === "undefined") return;

    try {
      const secureKey = hashKey(key);
      const secureValue = encryptRequest(value);
      localStorage.setItem(secureKey, secureValue);
    } catch (error) {
    }
  },

  getItem: (key: string): any => {
    if (typeof window === "undefined") return null;

    try {
      const secureKey = hashKey(key);
      const secureValue = localStorage.getItem(secureKey);

      if (!secureValue) return null;
      return decryptResponse(secureValue);
    } catch (error) {
      return null;
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;

    try {
      const secureKey = hashKey(key);
      localStorage.removeItem(secureKey);
    } catch (error) {
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};
