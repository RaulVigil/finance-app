import { NavLink, useLocation } from "react-router-dom";

// 3 tabs a la izquierda + BOTÓN + 3 tabs a la derecha = 7 columnas simétricas exactas
const leftTabs = [
  { to: "/app", icon: "fas fa-house", label: "Inicio" },
  { to: "/app/movimientos", icon: "fas fa-arrow-right-arrow-left", label: "Movs" },
  { to: "/app/gastos-fijos", icon: "fas fa-list-check", label: "Gastos" },
];

const rightTabs = [
  { to: "/app/tarjetas", icon: "fas fa-credit-card", label: "Tarjetas" },
  { to: "/app/deudas", icon: "fas fa-file-invoice-dollar", label: "Deudas" },
  { to: "/app/perfil", icon: "fas fa-user", label: "Perfil" },
];

function NavItem({ tab }) {
  return (
    <div className="flex justify-center items-center w-full">
      <NavLink
        to={tab.to}
        end={tab.to === "/app"}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1.5 px-0.5 w-full rounded-xl transition-all duration-200 group select-none ${
            isActive
              ? "text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative flex items-center justify-center h-5">
              <i
                className={`${tab.icon} text-[15px] sm:text-base transition-all duration-200 group-active:scale-90 ${
                  isActive
                    ? "text-[#00BCD4] scale-110 -translate-y-0.5 animate-tab-pop"
                    : "text-neutral-400 group-hover:text-neutral-300"
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-all duration-200 ${
                isActive
                  ? "font-bold text-white scale-[1.03]"
                  : "font-medium text-neutral-400"
              }`}
            >
              {tab.label}
            </span>
            {/* Indicador activo animado en cian (#00BCD4) con brillo sutil */}
            <span
              className={`h-1 rounded-full transition-all duration-300 ease-out mt-0.5 ${
                isActive
                  ? "w-4 bg-[#00BCD4] opacity-100 shadow-[0_0_10px_#00BCD4]"
                  : "w-0 bg-transparent opacity-0"
              }`}
            />
          </>
        )}
      </NavLink>
    </div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const isNewTransaction = location.pathname === "/app/transacciones/nueva";

  return (
    <nav className="fixed bottom-3 sm:bottom-4 inset-x-0 z-50 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-[440px] sm:max-w-md mx-auto pointer-events-auto">
        {/* Dock flotante oscuro de cristal con borde fino */}
        <div className="bg-[#12141A]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.12] shadow-[0_20px_45px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)] px-1 py-1">
          {/* Grilla matemática de 7 columnas */}
          <div className="grid grid-cols-7 items-center w-full">
            {/* 3 Tabs Izquierda */}
            {leftTabs.map((tab) => (
              <NavItem key={tab.to} tab={tab} />
            ))}

            {/* BOTÓN CENTRAL (+): Milimétricamente centrado en la columna 4 */}
            <div className="flex justify-center items-center w-full -mt-6 sm:-mt-7">
              <NavLink
                to="/app/transacciones/nueva"
                aria-label="Registrar nueva transacción"
                className="group relative focus:outline-none"
              >
                <div
                  className={`w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full flex items-center justify-center ring-4 ring-[#12141A] shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-200 active:scale-90 ${
                    isNewTransaction
                      ? "bg-[#00BCD4] text-[#12141A] shadow-[0_0_20px_rgba(0,188,212,0.5)]"
                      : "bg-[#212121] text-white hover:bg-[#1a1a1a] border border-white/10"
                  }`}
                >
                  <i
                    className={`fas fa-plus text-base sm:text-lg transition-transform duration-200 ${
                      isNewTransaction
                        ? "text-[#12141A] rotate-45"
                        : "text-[#00BCD4] group-hover:rotate-90"
                    }`}
                  />
                </div>
              </NavLink>
            </div>

            {/* 3 Tabs Derecha */}
            {rightTabs.map((tab) => (
              <NavItem key={tab.to} tab={tab} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
