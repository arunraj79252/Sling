import { CircularProgress } from "@mui/material";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import "./App.css";
import ThemeProvider from "./config/theme/themeProvider";
import { Routes } from "./GlobalRoutes";
import { ToastContainer } from "react-toastify";

export const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
function App() {
  let element = useRoutes(Routes);
  return (
    <ThemeProvider>
      <Suspense fallback={<CircularProgress />}> {element}</Suspense>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
}

export default App;