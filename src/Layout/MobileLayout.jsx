import { Outlet, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../Components/BottomNav";
import LogoHorizontalWhite from "../assets/logo-horizontal-white.svg";
import useAuthStore from "../store/useAuthStore";

export default function MobileLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] relative font-sans text-neutral-100 flex flex-col selection:bg-[#00BCD4]/30 selection:text-white">
      {/* Fondo técnico oscuro con micro-retícula arquitectónica y halos sutiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Retícula arquitectónica milimétrica */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Halo ambiental cian (#00BCD4) superior */}
        <div
          className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full blur-[130px] opacity-15"
          style={{ background: "radial-gradient(circle, #00BCD4 0%, transparent 70%)" }}
        />
        {/* Halo ambiental carbón (#212121) inferior */}
        <div
          className="absolute -bottom-32 -left-24 w-[460px] h-[460px] rounded-full blur-[130px] opacity-25"
          style={{ background: "radial-gradient(circle, #212121 0%, transparent 70%)" }}
        />
      </div>

      {/* HEADER SUPERIOR OSCURO */}
      <header className="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-2.5 sm:py-3 relative z-10">
          {/* Logo horizontal blanco con punto cian */}
          <div className="flex items-center">
            <img
              src={LogoHorizontalWhite}
              alt="FinanceApp"
              className="h-7 sm:h-8 w-auto object-contain cursor-pointer transition-transform duration-200 active:scale-95"
              onClick={() => navigate("/app")}
            />
          </div>

          {/* Área de Usuario y Logout */}
          <div className="flex items-center gap-2">
            {user && (
              <div
                onClick={() => navigate("/app/perfil")}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-white/[0.06] cursor-pointer transition-colors select-none border border-white/[0.08]"
              >
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-200 max-w-[120px] sm:max-w-[160px] truncate">
                  {user.nombre}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#212121] border border-white/20 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                  {getInitials(user.nombre)}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <i className="fas fa-arrow-right-from-bracket text-xs sm:text-sm" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON TRANSICIÓN ANIMADA FLUIDA */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-28 sm:pb-32 relative z-10">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* MENÚ INFERIOR */}
      <BottomNav />
    </div>
  );
}
