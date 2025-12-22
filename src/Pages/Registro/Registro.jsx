import { useState } from "react";
import { InputComponent } from "../../Components/InputComponent";
import Api from "../../Services/api";
import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo-login.png";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await Api.postJson("register", {
        nombre,
        email,
        password,
      });

      // 🔐 Auto-login directo
      loginStore(response.data.data);

      navigate("/app"); // o "/app" según tu router
    } catch (error) {
      if (error.response) {
        setErrors({
          email: error.response.data.message,
        });
      } else {
        alert("Error de conexión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #fafaff 0%, #e4d9ff 50%, #fafaff 100%)",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-4">
              <img src={Logo} alt="FinanceApp" className="w-[30%]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              FinanceApp
            </h1>

            <p className="text-gray-500 text-sm sm:text-base">
              Regístrate y comienza a gestionar tus finanzas
            </p>
          </div>

          {/* Inputs */}
          <InputComponent
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            icon="user"
            error={errors.nombre}
          />

          <InputComponent
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="envelope"
            error={errors.email}
          />

          <InputComponent
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="lock"
            error={errors.password}
            showToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all"
            style={{
              background: isLoading
                ? "#9CA3AF"
                : "linear-gradient(135deg, #273469 0%, #1e2749 100%)",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {/* Link login */}
          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Inicia sesión
            </span>
          </p>
        </form>
      </div>
    </main>
  );
}
