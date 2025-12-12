import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "../Pages/Login/Login";
import PrivateRoute from "./PrivateRoute";

import AdminRoute from "./AdminRoute";


const AppRouter = () => {

  return (
    <>

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" index element={<Login />} />
   
        {/* Rutas privadas */}
        <Route element={<PrivateRoute />}>
        <Route path="/" index element={<Login />} />

        </Route>
        {/* Rutas de administrador */}
        <Route element={<AdminRoute />}>
          <Route path="/" index element={<Login />} />
        </Route>
      </Routes>

    </>
  );
};

export default AppRouter;
