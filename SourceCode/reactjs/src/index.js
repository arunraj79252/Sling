import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import Swal from "sweetalert2";
import { updateToken } from "./store/slice/authSlice";
import { AXIOS } from "./api/axiosInterceptor";

const { REACT_APP_API_ENDPOINT } = process.env;

axios.interceptors.response.use(
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
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const accessToken = await refreshAccessToken();
      console.log("newTokennnn", accessToken);
      console.log("originalRequest", originalRequest);
      axios.defaults.headers.common["Authorization"] = "SLINGSS " + accessToken;
      AXIOS.defaults.headers.common["Authorization"] = "SLINGSS " + accessToken;
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>
);

reportWebVitals();