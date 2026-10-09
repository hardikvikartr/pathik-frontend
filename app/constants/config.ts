export const AppConfig = {
  API_URL: process.env.NEXT_PUBLIC_API_PRODUCTION_URL || "http://localhost:3000/api",
  // API_URL: process.env.NEXT_PUBLIC_API_DEV_URL || "http://localhost:3000/api",
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || "default-api-key",
  CRYPTO_SECRET_KEY: process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || "default-crypto-key",
  CRYPTO_SECRET_IV: process.env.NEXT_PUBLIC_CRYPTO_SECRET_IV || "default-crypto-iv",
  BASE_URL_FOR_IMAGE: process.env.NEXT_PUBLIC_BASE_URL_FOR_IMAGE || "http://localhost:3000/api",
};
