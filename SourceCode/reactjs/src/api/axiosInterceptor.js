import axios, { Axios } from "axios";
import { store } from "../store/store";
import Swal from "sweetalert2";
import { updateToken } from "../store/slice/authSlice";
const basicContentType = { "Content-Type": "application/json" };
const { REACT_APP_API_ENDPOINT } = process.env;

export const AXIOS = axios.create({
  baseURL: REACT_APP_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    get: basicContentType,
    post: basicContentType,
    put: basicContentType,
    delete: basicContentType,
    patch: basicContentType,
  },
});

AXIOS.interceptors.request.use(
  (request) => {
    if (request.url.includes("profileImage")) {
      console.log("worksssssssss");
      request.headers["Content-type"] = "multipart/form-data";
    } else if (request.url.includes("resetPassword")) {
      request.headers["Content-type"] = "multipart/form-data";
    }
    else if (!request.url.includes("login")) {
      request.headers["Authorization"] =
        "SLING " + store.getState().auth.accessToken;
    }
   
    return request;
  },
  function (error) {
    console.log(error);
    // toast.error(error.response.data.message.error)
    console.log(error.response.data.message.error);
    return Promise.reject(error);
  }
);

AXIOS.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    let serverErr = "Network Error";

    if (error.message === serverErr) {
      Swal.fire({
        title: "Oops...",
        text: "Server connection failed!",
        icon: "error",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Okay",
      });
    }
    const originalRequest = error.config;
console.log(error.response.data.message.error);

Swal.fire({
  title: error.response.data.message.error,
  text: "Please try Again.",
  icon: "error",
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Okay",
}).then((result) => {
  if (result.value) {
    localStorage.clear();
    window.location.replace("/");
  }
});
    if (error.response.status === 401 && !originalRequest._retry && !(error.response.data.error_Code =5001)) {
      originalRequest._retry = true;
      const accessToken = await refreshAccessToken();
      console.log("newTokennnn", accessToken);
      console.log("originalRequest", originalRequest);
      axios.defaults.headers.common["Authorization"] = "SLING " + accessToken;
      AXIOS.defaults.headers.common["Authorization"] = "SLING " + accessToken;
      originalRequest.headers.Authorization = "SLING " + accessToken;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  console.log("workings");
  const refreshToken = localStorage.getItem("refreshToken");
  console.log(JSON.stringify(refreshToken));

  try {
    let body = { Token: refreshToken };
    const response = await axios.put(`${REACT_APP_API_ENDPOINT}login`, body);
    console.log("res=====================", response?.data);

    const accessToken = response?.data?.token;
    const newRefreshToken = response?.data?.refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    let payload = {
      accessToken: accessToken,
    };
    store.dispatch(updateToken(payload));
    return accessToken;
  } catch (err) {
    console.log(err, "no refresh");
    Swal.fire({
      title: "Authorization Token Expired!!",
      text: "Please Login Again.",
      icon: "error",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Okay",
    }).then((result) => {
      if (result.value) {
        localStorage.clear();
        window.location.replace("/");
      }
    });
  }
};

