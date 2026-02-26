/**
 * apiService.ts
 * Description: Centralized Axios configuration and HTTP utility functions for handling API requests (GET, POST, PUT, PATCH, DELETE) with global error interception.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
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
      console.error("Error en la respuesta de la API:", error.response);
      if (error.response.status === 401) {
        // Token refresh logic or redirect to login could be implemented here
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
  data: Record<string, unknown> | FormData,
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
  data: Record<string, unknown> | FormData,
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
  data: Record<string, unknown> | FormData,
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

// // apiService.js

// import axios, { AxiosRequestConfig } from "axios";

// // Configuración de la instancia de Axios
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   timeout: 5000,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: false,
// });

// // Interceptor de solicitud para añadir el token de autenticación (si existe)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Interceptor de respuesta para manejar errores globalmente
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       console.error("Error en la respuesta de la API:", error.response);
//       if (error.response.status === 401) {
//         // Lógica de refresco de token o redirección al login
//       }
//     } else if (error.request) {
//       console.error("No se recibió respuesta de la API:", error.request);
//     } else {
//       console.error("Error al configurar la petición:", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// // Función para peticiones GET
// export const getRequest = async (url: string, params = {}) => {
//   const response = await api.get(url, { params });
//   return response.data;
// };

// // Función para peticiones POST (JSON o FormData)
// export const postRequest = async (
//   url: string,
//   data: Record<string, unknown> | FormData,
//   config: AxiosRequestConfig = {}
// ) => {
//   const isForm = data instanceof FormData;
//   const headers = {
//     ...config.headers,
//     ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
//   };
//   const response = await api.post(url, data, { ...config, headers });
//   return response.data;
// };

// // Función para peticiones PUT
// export const putRequest = async (
//   url: string,
//   data: Record<string, unknown> | FormData,
//   config: AxiosRequestConfig = {}
// ) => {
//   const isForm = data instanceof FormData;
//   const headers = {
//     ...config.headers,
//     ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
//   };
//   const response = await api.put(url, data, { ...config, headers });
//   return response.data;
// };

// // Función para peticiones DELETE
// export const deleteRequest = async (url: string) => {
//   const response = await api.delete(url);
//   return response.data;
// };
