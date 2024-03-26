import React from "react";
import ForgotPassword from "../components/login/forgotPassword";
import ResetPassword from "../components/login/resetPassword";
const AuthLayout = React.lazy(() => import("../components/layout/authLayout"));
const Login = React.lazy(() => import("../components/login/login"));
const Registration = React.lazy(() =>
  import("../components/login/registration")
);

export const AuthRoutes = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Registration />,
      },
      {
        path:"forgot",
        element: <ForgotPassword />,
      },
      {
        path:"reset-password",
        element: <ResetPassword />,
      }
    ],
  },
];
