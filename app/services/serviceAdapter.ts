import { isNetworkConnected } from "../utils/network";
import { API } from "./apiHandler";
import { API_METHODS } from "../types";
import { SecureStorage } from "../utils/secureStorage";
import { AppConfig } from "../constants/config";

interface ServiceOptions {
  isEncrypted?: boolean;
  useToken?: boolean;
  type?: "HOTEL" | "POLICE" | "ADMIN";
  isMultipart?: boolean;
  timeout?: number;
}

interface APIServiceOptions {
  token?: string;
  isEncrypted?: boolean;
  type?: "HOTEL" | "POLICE" | "ADMIN";
  isMultipart?: boolean;
  timeout?: number;
}
export default async function serviceAdapter<T, ReqParams = any>(
  method: API_METHODS,
  url: string,
  requestParam?: ReqParams,
  options: ServiceOptions = { isEncrypted: true, useToken: true },
): Promise<T> {
  const status = await isNetworkConnected();

  if (status) {
    let token: string | undefined;

    url = AppConfig.API_URL + url;
    const apiOptions: APIServiceOptions = {};
    if (options.useToken && typeof window !== "undefined") {
      token = SecureStorage.getItem("token") || undefined;
      apiOptions.token = token;
    }
    apiOptions.isEncrypted = options.isEncrypted;
    apiOptions.type = options.type;
    apiOptions.isMultipart = options.isMultipart;
    apiOptions.timeout = options.timeout;

    switch (method) {
      case API_METHODS.GET:
        return API.getAPIService(url, apiOptions);
      case API_METHODS.DELETE:
        return API.deleteAPIService(url, requestParam, apiOptions);
      case API_METHODS.PUT:
        return API.putAPIService(url, requestParam, apiOptions);
      case API_METHODS.POST:
        return API.postAPIService(url, requestParam, apiOptions);
      default:
        return Promise.reject(new Error("REST METHOD NOT EXISTS"));
    }
  } else {
    return Promise.reject(new Error("No internet connection"));
  }
}
