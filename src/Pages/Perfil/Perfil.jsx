import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const { user, saldoActual, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">

      {/* IDENTIDAD */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#2c295a] text-white flex items-center justify-center text-2xl font-bold">
          {user.nombre.charAt(0)}
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-800">
          {user.nombre}
        </h2>

        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* ESTADO FINANCIERO */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Saldo disponible</p>
            <p className="text-2xl font-bold text-gray-800">
              ${Number(saldoActual).toFixed(2)}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <i className="fas fa-wallet"></i>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Este es el saldo actualizado según tus últimas operaciones
        </p>
      </div>

      {/* ACCIONES */}
      {/* <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
        <button className="w-full py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2">
          <i className="fas fa-user-edit"></i>
          Editar perfil
        </button>

        <button className="w-full py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2">
          <i className="fas fa-lock"></i>
          Cambiar contraseña
        </button>
      </div> */}

      {/* LOGOUT */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
