import { AXIOS } from "./axiosInterceptor";

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data ,params,responseType }) => {
    try {
      console.log(data);
      const result = await AXIOS({ url: baseUrl + url, method, data ,params, responseType});
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
