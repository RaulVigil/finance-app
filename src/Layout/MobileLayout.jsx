import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "../Components/BottomNav";
import Logo from "../assets/images/logo-login.png";
import useAuthStore from "../store/useAuthStore";

export default function MobileLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7fb] via-[#f0ecff] to-[#f6f7fb] flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="FinanceApp" className="h-8 w-auto" />
            <span className="font-semibold text-gray-800 tracking-tight">
              {user ? `Hola, ${user.nombre}` : "Bienvenido"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 active:scale-95 transition"
            title="Cerrar sesión"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 px-4 pt-4 pb-32 transition-all duration-300 ease-in-out">
        <Outlet />
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}
