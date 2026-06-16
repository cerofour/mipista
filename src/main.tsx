import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { AppProvider } from './context/AppContext.tsx'
import './index.css'

import InitialPage from './pages/InitialPage.tsx';
import MiPistaLogin from './pages/LoginPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import MapPage from './pages/MapPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <InitialPage></InitialPage>,
  },
  {
    path: "login",
    Component: MiPistaLogin,
  },
  {
    path: "signup",
    Component: AuthPage,
  },
  {
    path: "map",
    Component: MapPage,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router}></RouterProvider>
    </AppProvider>
  </React.StrictMode>
)