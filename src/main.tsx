import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter, useSearchParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { Home } from "./pages/Home.tsx";
import { PlayVideo } from "./pages/PlayVideo.tsx";
import { Download } from "./pages/Download.tsx";

const ContentWrapper = () => {
  const [searchParams] = useSearchParams();
  const v = searchParams.get("v");
  return v ? <PlayVideo /> : <Home />;
};

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ContentWrapper /> },
      { path: "play/:id", element: <PlayVideo /> },
      { path: "download", element: <Download /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);