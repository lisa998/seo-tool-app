export {};

declare module 'axios' {
  export interface AxiosRequestConfig {
    errorTitle?: string;
    errorMessage?: string;
  }
}
