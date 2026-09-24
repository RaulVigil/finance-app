import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { to: "/app", icon: "fas fa-house", label: "Inicio" },
  { to: "/app/movimientos", icon: "fas fa-arrow-right-arrow-left", label: "Movs" },
  { to: "/app/gastos-fijos", icon: "fas fa-list-check", label: "Gastos" },
  { to: "/app/deudas", icon: "fas fa-file-invoice-dollar", label: "Deudas" },
  { to: "/app/tarjetas", icon: "fas fa-credit-card", label: "Tarjetas" },
  { to: "/app/perfil", icon: "fas fa-user", label: "Perfil" },
];

function NavItem({ tab }) {
  return (
    <li className="flex-1">
      <NavLink
        to={tab.to}
        end={tab.to === "/app"}
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-300 ${
            isActive
              ? "text-[#2c295a] bg-[#eceaff]"
              : "text-gray-400 hover:text-gray-600"
          }`
        }
      >
        <i className={`${tab.icon} text-base`} />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </NavLink>
    </li>
  );
}

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200">
        <ul className="flex justify-between px-1 py-1.5 items-center">

          {/* Tabs izquierdos */}
          <NavItem tab={tabs[0]} />
          <NavItem tab={tabs[1]} />

          {/* BOTÓN CENTRAL */}
          <li className="flex-1 flex justify-center -mt-7">
            <NavLink to="/app/transacciones/nueva">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                  location.pathname === "/app/transacciones/nueva"
                    ? "bg-[#3d3980]"
                    : "bg-[#2c295a]"
                }`}
              >
                <i className="fas fa-plus text-white text-lg" />
              </div>
            </NavLink>
          </li>

          {/* Tabs derechos */}
          <NavItem tab={tabs[2]} />
          <NavItem tab={tabs[3]} />
          <NavItem tab={tabs[4]} />
          <NavItem tab={tabs[5]} />

        </ul>
      </div>
    </nav>
  );
}
