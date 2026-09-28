import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputComponent } from "../../Components/InputComponent";
import { ButtonComponent } from "../../Components/ButtonComponent";
import LogoHorizontal from "../../assets/logo-horizontal.svg";
import Api from "../../Services/api";
import useAuthStore from "../../store/useAuthStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "El correo no tiene un formato válido";
    }

    if (!password.trim()) {
      newErrors.password = "Ingresa tu contraseña";
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
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "No se pudo conectar con el servidor. Intenta nuevamente." });
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
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0C0D10] relative font-sans text-[#212121] overflow-hidden select-none">
      {/* Fondo oscuro técnico con movimiento orgánico usando #212121 y #00BCD4 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Orbe 1: Halo de luz Cian #00BCD4 con animación fluida */}
        <div
          className="absolute -top-20 -right-20 w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] rounded-full blur-[100px] opacity-25 animate-float-1"
          style={{ background: "radial-gradient(circle, #00BCD4 0%, rgba(0, 188, 212, 0) 70%)" }}
        />

        {/* Orbe 2: Resplandor Carbón Profundo #212121 en contra-movimiento */}
        <div
          className="absolute -bottom-28 -left-20 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full blur-[110px] opacity-35 animate-float-2"
          style={{ background: "radial-gradient(circle, #212121 20%, #15171C 80%)" }}
        />

        {/* Orbe 3: Aura Cian central sutil con pulso respiratorio */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full blur-[90px] animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(0, 188, 212, 0.18) 0%, transparent 70%)" }}
        />

        {/* Retícula arquitectónica oscura para dar textura y profundidad técnica */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Viñeta perimetral suave */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(12, 13, 16, 0.8) 100%)",
          }}
        />
      </div>

      {/* Contenedor central optimizado para móvil y tablet */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Tarjeta principal: superficie blanca de alto contraste con sombra profunda */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-white/20 sm:border-neutral-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300">
          {/* Acento superior de dos tonos con acento cian */}
          <div className="h-[3.5px] w-full bg-[#212121] relative">
            <div className="absolute left-6 top-0 bottom-0 w-14 bg-[#00BCD4] shadow-[0_0_10px_#00BCD4]" />
          </div>

          <div className="p-6 sm:p-8">
            {/* Logo horizontal: tamaño prominente, claro y legible */}
            <div className="flex justify-center mb-6 sm:mb-7">
              <img
                src={LogoHorizontal}
                alt="FinanceApp"
                className="w-[210px] sm:w-[250px] max-w-[85%] h-auto object-contain drop-shadow-xs transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>

            {/* Encabezado limpio y directo */}
            <div className="mb-5 sm:mb-6 text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-[#212121] tracking-tight">
                Iniciar sesión
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Ingresa a tu panel de control financiero
              </p>
            </div>

            {/* Formulario con campos optimizados para toque en móvil */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alerta de error del servidor si ocurre */}
              {errors.general && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                  <i className="fas fa-circle-exclamation text-rose-500 text-xs mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{errors.general}</span>
                </div>
              )}

              {/* Input Correo Electrónico */}
              <InputComponent
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.general) {
                    setErrors((prev) => ({ ...prev, email: null, general: null }));
                  }
                }}
                icon="envelope"
                error={errors.email}
                autoComplete="email"
                required
              />

              {/* Input Contraseña */}
              <InputComponent
                label="Contraseña"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.general) {
                    setErrors((prev) => ({ ...prev, password: null, general: null }));
                  }
                }}
                icon="lock"
                error={errors.password}
                showToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete="current-password"
                required
              />

              {/* Recordar cuenta */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-neutral-300 bg-neutral-50 peer-checked:bg-[#212121] peer-checked:border-[#212121] peer-focus-visible:ring-2 peer-focus-visible:ring-[#00BCD4] transition-all flex items-center justify-center">
                      <svg
                        className={`w-2.5 h-2.5 text-[#00BCD4] transition-transform duration-150 ${
                          rememberMe ? "scale-100" : "scale-0"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs sm:text-[13px] text-neutral-600 group-hover:text-neutral-900 transition-colors">
                    Mantener sesión iniciada
                  </span>
                </label>
              </div>

              {/* Botón Iniciar Sesión con tamaño táctil para móvil */}
              <div className="pt-2 sm:pt-3">
                <ButtonComponent
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                  rightIcon="arrow-right"
                  className="py-3.5 sm:py-4 text-base shadow-lg shadow-black/25"
                >
                  Iniciar sesión
                </ButtonComponent>
              </div>

              {/* Enlace de Registro */}
              <div className="pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs sm:text-sm text-neutral-500">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/registro"
                    className="font-semibold text-[#212121] hover:text-[#00BCD4] underline underline-offset-4 decoration-neutral-300 hover:decoration-[#00BCD4] transition-colors ml-1"
                  >
                    Crear cuenta
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Pie con indicador de seguridad y credenciales seguras */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-neutral-400 font-medium">
          <i className="fas fa-shield-halved text-[#00BCD4] text-xs" />
          <span>Conexión segura TLS · Cifrado bancario</span>
        </div>
      </div>
    </main>
  );
}
