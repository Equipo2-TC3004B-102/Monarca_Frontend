/**
 * FileName: apiService.ts
 * Description: Centralized Axios configuration and HTTP utility functions for handling API requests (GET, POST, PUT, PATCH, DELETE) with global error interception.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Removed comment redundancies and added a console log error.
 */

import axios, { AxiosRequestConfig } from "axios";

/**
 * api, Axios instance configured with base URL, timeout, default headers,
 * and credentials enabled for cookie-based authentication.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Global response interceptor to handle API errors consistently.
 * Input:
 * - response: Successful Axios response.
 * - error: Axios error object.
 * Output:
 * - Returns response when successful.
 * - Rejects promise with error after logging details.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorCode = error.response.data?.code;
      console.error(
        "API ERROR FULL:",
        JSON.stringify(error.response?.data, null, 2)
      );
      // Log file size errors specifically
      const message = Array.isArray(error.response.data?.message)
        ? error.response.data.message.join(', ')
        : error.response.data?.message;
      if (error.response.status === 413 || 
          (error.response.status === 400 && 
            typeof message === 'string' && message.toLowerCase().includes("size"))) {
        console.error("File size validation error:", message);
      }
      if (error.response.status === 401) {
        console.error("Unauthorized access - possible token issues.");
      }

      // If auth context is missing/invalid, send user back to login immediately.
      if (
        errorCode === "AUTH_MISSING_TOKEN" ||
        errorCode === "AUTH_INVALID_TOKEN"
      ) {
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    } else if (error.request) {
      console.error("se recibió respuesta de la API:", error.request);
    } else {
      console.error("Error al configurar la petición:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * getRequest, performs a GET request to the specified endpoint.
 * Input:
 * - url (string): API endpoint.
 * - params (object): Query parameters.
 * - config (AxiosRequestConfig): Optional Axios configuration.
 * Output:
 * - Returns response.data from the API.
 */
export const getRequest = async (
  url: string,
  params = {},
  config: AxiosRequestConfig = {}
) => {
  const response = await api.get(url, { params, ...config });
  return response.data;
};

/**
 * postRequest, performs a POST request supporting JSON or FormData.
 * Input:
 * - url (string): API endpoint.
 * - data (Record<string, unknown> | FormData): Payload to send.
 * - config (AxiosRequestConfig): Optional Axios configuration.
 * Output:
 * - Returns response.data from the API.
 */
export const postRequest = async (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {}
) => {
  try {
    const isForm = data instanceof FormData;
    const headers = {
      ...config.headers,
      ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
    };
    console.log("DATA", data);
    const response = await api.post(url, data, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * putRequest, performs a PUT request supporting JSON or FormData.
 * Input:
 * - url (string): API endpoint.
 * - data (Record<string, unknown> | FormData): Payload to update.
 * - config (AxiosRequestConfig): Optional Axios configuration.
 * Output:
 * - Returns response.data from the API.
 */
export const putRequest = async (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {}
) => {
  try {
    const isForm = data instanceof FormData;
    const headers = {
      ...config.headers,
      ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
    };
    const response = await api.put(url, data, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * patchRequest, performs a PATCH request supporting JSON or FormData.
 * Input:
 * - url (string): API endpoint.
 * - data (Record<string, unknown> | FormData): Partial payload update.
 * - config (AxiosRequestConfig): Optional Axios configuration.
 * Output:
 * - Returns response.data from the API.
 */
export const patchRequest = async (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {}
) => {
  try {
    const isForm = data instanceof FormData;
    const headers = {
      ...config.headers,
      ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
    };
    const response = await api.patch(url, data, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * deleteRequest, performs a DELETE request to the specified endpoint.
 * Input:
 * - url (string): API endpoint.
 * Output:
 * - Returns response.data from the API.
 */
export const deleteRequest = async (url: string) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
