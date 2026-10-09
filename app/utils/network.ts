/**
 * Checks if the browser has an active network connection.
 * Returns a promise that resolves to a boolean.
 */
export const isNetworkConnected = async (): Promise<boolean> => {
  if (typeof window === "undefined") {
    // Server-side: assume connected or handle differently
    return true;
  }
  return navigator.onLine;
};
