import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AppConfig } from "../constants/config";
import { decryptResponse, encryptRequest } from "../utils/encryption";
import Router from "next/router";
import { SecureStorage } from "../utils/secureStorage";
import { toast } from "react-toastify";

interface RequestOptions {
  token?: string;
  isEncrypted?: boolean;
  type?: "HOTEL" | "POLICE" | "ADMIN";
  isMultipart?: boolean;
}

class APIhandler {
  private readonly axiosInstance: AxiosInstance;
  private readonly axiosHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: AppConfig.API_URL,
      headers: this.axiosHeaders,
      timeout: 60000, // Increased timeout to 60s
      timeoutErrorMessage: "Slow Network",
      validateStatus(status) {
        return (
          (status >= 200 && status < 300) || status === 400 || status === 401 || status === 404
        );
      },
    });

    // Uncomment for debugging
    // this.axiosInstance.interceptors.request.use(req => {
    //   if (process.env.NODE_ENV === 'development') {
    //   }
    //   return req;
    // });

    // this.axiosInstance.interceptors.response.use(
    //   // ✅ SUCCESS RESPONSE (2xx status codes)
    //   (response) => {
    //     if(response.status === 200){
    //       return response;
    //     } else if(response.status === 401) {
    //       if(typeof window !== "undefined") {
    //         localStorage.clear();
    //         sessionStorage.clear();
    //         if(window.location.pathname !== "/") {
    //           window.location.href = "/";
    //         }
    //       }
    //       return Promise.reject(response);
    //     }
    //   },
    // );
  }

  requestHeader = (token?: string, options: RequestOptions = {}) => {
    const headers: any = {};
    if (token) {
      headers["token"] = token;
    }
    // Add Encrypted API Key
    if (AppConfig.API_KEY) {
      headers["api-key"] = AppConfig.API_KEY;
    }
    if (options.type) {
      headers["type"] = options.type;
    }
    headers["accept-language"] = "en";
    return headers;
  };

  handleBodyResponse = async (response: AxiosResponse): Promise<any> => {
    response.data = decryptResponse(response.data);
    if (response.status === 200) {
      return Promise.resolve(response.data);
    } else if (response.status === 400) {
      return Promise.reject({
        cause: response.status.toString(),
        message: response.data.message || "Bad Request",
      });
    } else if (response.status === 404) {
      response.data = decryptResponse(response.data);
      return Promise.reject({
        cause: "404",
        message: response.data?.message || "Invalid email or password.",
      });
    } else if (response.status === 401) {
      if (typeof window !== "undefined") {
        const user = SecureStorage.getItem("pathikUser");
        if (user?.role === "HOTEL") {
          toast.error("Your session has expired. Please login again.");
          window.location.href = "/hotel";
        } else if (user?.role === "POLICE_STATION") {
          toast.error("Your session has expired. Please login again.");
          window.location.href = "/police";
        } else {
          toast.error("Your session has expired. Please login again.");
          window.location.href = "/sys-admin";
        }

        localStorage.clear();
        sessionStorage.clear();
        return Promise.reject({
          cause: response.status.toString(),
          message:
            response.data.message ||
            "Your session has expired. Please login again.",
        });
      }
    } else {
      return Promise.reject({
        cause: response.status.toString(),
        message: response.data.message || "Unknown Error",
      });
    }
  };

  getAPIService = async (
    api: string,
    options: RequestOptions = {},
  ): Promise<any> => {
    try {
      const response = await this.axiosInstance.get(api, {
        headers: {
          ...this.axiosHeaders,
          ...this.requestHeader(options.token, options),
        },
      });
      return this.handleBodyResponse(response);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  postAPIService = async (
    api: string,
    reqParams: any,
    options: RequestOptions,
  ): Promise<any> => {
    try {
      let data = reqParams;
      const headers: any = {
        ...this.axiosHeaders,
        ...this.requestHeader(options.token, options),
      };

      if (options.isMultipart) {
        // delete headers["Content-Type"]; // Allow browser/axios to set boundary
        headers["Content-Type"] = undefined; // Force un-set to override defaults
      }

      if (options.isEncrypted) {
        data = encryptRequest(reqParams);
        headers["Content-Type"] = "text/plain";
        headers["Accept"] = "text/plain";
      }
      const response = await this.axiosInstance.post<any>(api, data, {
        headers: headers,
      });
      return this.handleBodyResponse(response);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  putAPIService = async (
    api: string,
    reqParams: any = {},
    options: RequestOptions = {},
  ): Promise<any> => {
    try {
      let data = reqParams;
      const headers: any = {
        ...this.axiosHeaders,
        ...this.requestHeader(options.token, options),
      };

      if (options.isEncrypted) {
        data = encryptRequest(reqParams);
        headers["Content-Type"] = "text/plain";
      }

      const response = await this.axiosInstance.put<any>(api, data, {
        headers: headers,
      });
      return this.handleBodyResponse(response);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  deleteAPIService = async (
    api: string,
    reqParams: any = {},
    options: RequestOptions = {},
  ): Promise<any> => {
    try {
      const response = await this.axiosInstance.delete<any>(api, {
        headers: {
          ...this.axiosHeaders,
          ...this.requestHeader(options.token, options),
        },
        params: reqParams,
      });
      return this.handleBodyResponse(response);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export const API = new APIhandler();
