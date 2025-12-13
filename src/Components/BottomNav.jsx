import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { to: "/app", icon: "fas fa-house", label: "Inicio" },
  {
    to: "/app/movimientos",
    icon: "fas fa-arrow-right-arrow-left",
    label: "Movs",
  },
  { to: "/app/deudas", icon: "fas fa-credit-card", label: "Deudas" },
  { to: "/app/perfil", icon: "fas fa-user", label: "Perfil" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200">
        <ul className="flex justify-between px-3 py-2 items-center">

          {/* TAB IZQUIERDO */}
          <li className="flex-1">
            <NavLink
              to={tabs[0].to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-[#2c295a] bg-[#eceaff]"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <i className={`${tabs[0].icon} text-lg`} />
              <span className="text-[11px] font-medium">
                {tabs[0].label}
              </span>
            </NavLink>
          </li>

          {/* TAB MOVS */}
          <li className="flex-1">
            <NavLink
              to={tabs[1].to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-[#2c295a] bg-[#eceaff]"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <i className={`${tabs[1].icon} text-lg`} />
              <span className="text-[11px] font-medium">
                {tabs[1].label}
              </span>
            </NavLink>
          </li>

          {/*BOTÓN CENTRAL */}
          <li className="flex-1 flex justify-center -mt-8">
            <NavLink to="/app/transacciones/nueva">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95
                  ${
                    location.pathname === "/app/transacciones/nueva"
                      ? "bg-[#2c295a]"
                      : "bg-[#2c295a]"
                  }`}
              >
                <i className="fas fa-plus text-white text-xl" />
              </div>
            </NavLink>
          </li>

          {/* TAB DEUDAS */}
          <li className="flex-1">
            <NavLink
              to={tabs[2].to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-[#2c295a] bg-[#eceaff]"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <i className={`${tabs[2].icon} text-lg`} />
              <span className="text-[11px] font-medium">
                {tabs[2].label}
              </span>
            </NavLink>
          </li>

          {/* TAB PERFIL */}
          <li className="flex-1">
            <NavLink
              to={tabs[3].to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-[#2c295a] bg-[#eceaff]"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <i className={`${tabs[3].icon} text-lg`} />
              <span className="text-[11px] font-medium">
                {tabs[3].label}
              </span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
