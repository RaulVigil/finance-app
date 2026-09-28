import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputComponent } from "../../Components/InputComponent";
import { ButtonComponent } from "../../Components/ButtonComponent";
import LogoHorizontal from "../../assets/logo-horizontal.svg";
import Api from "../../Services/api";
import useAuthStore from "../../store/useAuthStore";

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
      newErrors.nombre = "Ingresa tu nombre completo";
    }

    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!password.trim()) {
      newErrors.password = "Crea una contraseña segura";
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

      loginStore(response.data.data);
      navigate("/app");
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Error de conexión con el servidor. Intenta de nuevo." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0C0D10] relative font-sans text-[#212121] overflow-hidden select-none">
      {/* Fondo oscuro técnico con movimiento orgánico usando #212121 y #00BCD4 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] rounded-full blur-[100px] opacity-25 animate-float-1"
          style={{ background: "radial-gradient(circle, #00BCD4 0%, rgba(0, 188, 212, 0) 70%)" }}
        />
        <div
          className="absolute -bottom-28 -left-20 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full blur-[110px] opacity-35 animate-float-2"
          style={{ background: "radial-gradient(circle, #212121 20%, #15171C 80%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full blur-[90px] animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(0, 188, 212, 0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(12, 13, 16, 0.8) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Monolito con acento superior */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-white/20 sm:border-neutral-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300">
          <div className="h-[3.5px] w-full bg-[#212121] relative">
            <div className="absolute left-6 top-0 bottom-0 w-14 bg-[#00BCD4] shadow-[0_0_10px_#00BCD4]" />
          </div>

          <div className="p-6 sm:p-8">
            {/* Logo horizontal prominente */}
            <div className="flex justify-center mb-6 sm:mb-7">
              <img
                src={LogoHorizontal}
                alt="FinanceApp"
                className="w-[210px] sm:w-[250px] max-w-[85%] h-auto object-contain drop-shadow-xs transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>

            {/* Encabezado limpio */}
            <div className="mb-6 text-left">
              <h1 className="text-xl font-bold text-[#212121] tracking-tight">
                Crear cuenta
              </h1>
              <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
                Comienza a gestionar y optimizar tus finanzas
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/90 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
                  <i className="fas fa-circle-exclamation text-rose-500 text-xs mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{errors.general}</span>
                </div>
              )}

              {/* Input Nombre */}
              <InputComponent
                label="Nombre completo"
                type="text"
                placeholder="Ej: Raúl Vigil"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: null }));
                }}
                icon="user"
                error={errors.nombre}
                autoComplete="name"
                required
              />

              {/* Input Correo */}
              <InputComponent
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                icon="lock"
                error={errors.password}
                showToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
                required
              />

              {/* Botón Crear Cuenta */}
              <div className="pt-2">
                <ButtonComponent
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Creando cuenta..."
                  rightIcon="arrow-right"
                >
                  Crear cuenta
                </ButtonComponent>
              </div>

              {/* Enlace de Iniciar Sesión */}
              <div className="pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-[#212121] hover:text-[#00BCD4] underline underline-offset-4 decoration-neutral-300 hover:decoration-[#00BCD4] transition-colors ml-1"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Pie institucional */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <i className="fas fa-shield-halved text-[10px]" />
          <span>Tus datos están protegidos y encriptados</span>
        </div>
      </div>
    </main>
  );
}
