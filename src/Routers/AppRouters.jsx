import { Routes, Route } from "react-router-dom";
import Login from "../Pages/Login/Login";

import MobileLayout from "../Layout/MobileLayout";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Movimientos from "../Pages/Movimientos/Movimientos";
import Deudas from "../Pages/Deudas/Deudas";
import Perfil from "../Pages/Perfil/Perfil";
import NewTransaction from "../Pages/Transactions/NewTransaction";

const AppRouter = () => {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* APP CON MENU INFERIOR */}
      <Route path="/app" element={<MobileLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="deudas" element={<Deudas />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="transacciones/nueva" element={<NewTransaction />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
