import { useState, useEffect } from "react";
import { InputComponent } from "../../Components/InputComponent";
import Logo from "../../assets/images/logo-login.png";
import Api from "../../Services/api";
import useAuthStore from "../../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await Api.postJson("login", { email, password });
      const data = response.data.data;

      if (rememberMe) {
        localStorage.setItem("financeapp-remember-email", email);
      } else {
        localStorage.removeItem("financeapp-remember-email");
      }

      loginStore(data);
      navigate("/app");
    } catch (error) {
      if (error.response) {
        setErrors({ password: error.response.data.message });
      } else {
        alert("Error de conexión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("financeapp-remember-email");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #fafaff 0%, #e4d9ff 50%, #fafaff 100%)",
      }}
    >

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ background: "rgba(40, 52, 105, 0.1)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ background: "rgba(40, 52, 105, 0.15)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <img src={Logo} alt="" className="w-[30%]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                FinanceApp
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Gestiona tus ingresos y egresos fácilmente
              </p>
            </div>


            <div className="space-y-4">
              <InputComponent
                type="email"
                placeholder="tu@correo.com"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{
                background: isLoading
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #273469 0%, #1e2749 100%)",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt" />
                  Iniciar Sesión
                </>
              )}
            </button>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "#273469" }}
                />
                <span className="text-gray-600">Recuérdame</span>
              </label>

              {/* <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <i className="fas fa-question-circle text-xs" />
                ¿Olvidaste tu contraseña?
              </a> */}
            </div>

            {/* Sign Up */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-xs sm:text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/registro"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs sm:text-sm mt-6 flex items-center justify-center gap-1">
          <i className="fas fa-shield-alt" />© 2025 FinanceApp. Maneja tus
          finanzas con seguridad :).
        </div>
      </div>
    </main>
  );
}
