import { Outlet } from "react-router-dom";
import { AuthRoutes } from "./routes/AuthRoutes";
import { UserRoutes } from "./routes/UserRoutes";

export const Routes = [
    {
        path: "/",
        element: <Outlet />,
        children: [
            ...UserRoutes,
            ...AuthRoutes
        ],
      },
    //   { path: "team", element: <AboutPage /> },
]