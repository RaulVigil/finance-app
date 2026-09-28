import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Genera un color de gradiente determinístico basado en el nombre
function getGradient(name = "") {
  const gradients = [
    "from-violet-500 via-purple-600 to-indigo-700",
    "from-cyan-400 via-[#00BCD4] to-blue-600",
    "from-emerald-400 via-teal-500 to-cyan-600",
    "from-rose-400 via-pink-500 to-fuchsia-600",
    "from-amber-400 via-orange-500 to-red-500",
    "from-blue-400 via-indigo-500 to-purple-600",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

function InfoRow({ icon, label, value, accent = false }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.06] last:border-0">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          accent
            ? "bg-[#00BCD4]/15 text-[#00BCD4]"
            : "bg-white/[0.06] text-neutral-400"
        }`}
      >
        <i className={`fas ${icon} text-xs`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
          {label}
        </p>
        <p className="text-sm text-white font-medium truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Perfil() {
  const { user, saldoActual, logout } = useAuthStore();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleLogout = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    logout();
    navigate("/");
  };

  if (!user) return null;

  const gradient = getGradient(user.nombre);
  const initials = user.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const saldo = Number(saldoActual || 0);
  const saldoPositivo = saldo >= 0;

  const memberSince = (() => {
    const now = new Date();
    return now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  })();

  return (
    <div className="space-y-5 pb-12">

      {/* ── HERO CARD: AVATAR + IDENTIDAD ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6)] p-6">

        {/* Glow ambiental */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${gradient}`}
        />

        {/* Línea superior decorativa */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00BCD4] to-transparent`}
        />

        <div className="relative flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/[0.15]`}
          >
            {initials}
          </div>

          {/* Nombre */}
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {user.nombre}
            </h2>
            <p className="text-sm text-neutral-400 mt-0.5">{user.email}</p>
          </div>

          {/* Badge tipo usuario */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/15 border border-[#00BCD4]/30 text-[#00BCD4] text-[11px] font-bold uppercase tracking-wider">
            <i className="fas fa-shield-halved text-[10px]" />
            {user.tipo_usuario || "Usuario"}
          </span>
        </div>
      </div>

      {/* ── SALDO DESTACADO ──────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 border shadow-lg ${
          saldoPositivo
            ? "bg-emerald-500/[0.08] border-emerald-500/25"
            : "bg-rose-500/[0.08] border-rose-500/25"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-1">
              Saldo Disponible
            </p>
            <p
              className={`text-3xl font-black tabular-nums tracking-tight ${
                saldoPositivo ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {saldoPositivo ? "" : "-"}$
              {Math.abs(saldo).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Actualizado con tus últimas operaciones
            </p>
          </div>

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              saldoPositivo
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            <i
              className={`fas ${
                saldoPositivo ? "fa-wallet" : "fa-triangle-exclamation"
              } text-xl`}
            />
          </div>
        </div>

        {/* Barra decorativa */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[2px] ${
            saldoPositivo
              ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
              : "bg-gradient-to-r from-transparent via-rose-400 to-transparent"
          }`}
        />
      </div>

      {/* ── INFORMACIÓN DE LA CUENTA ─────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[#14161F] border border-white/[0.08] overflow-hidden shadow-sm">
        {/* Header de la sección */}
        <div className="px-5 pt-4 pb-2 border-b border-white/[0.06]">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <i className="fas fa-id-card text-[#00BCD4]" />
            Datos de la Cuenta
          </p>
        </div>

        <div className="px-5 py-1">
          <InfoRow
            icon="fa-user"
            label="Nombre completo"
            value={user.nombre}
            accent
          />
          <InfoRow
            icon="fa-envelope"
            label="Correo electrónico"
            value={user.email}
          />
          <InfoRow
            icon="fa-fingerprint"
            label="ID de usuario"
            value={`#${user.usuario_id}`}
          />
          <InfoRow
            icon="fa-calendar-check"
            label="Miembro desde"
            value={memberSince}
          />
        </div>
      </div>

      {/* ── ACCIONES RÁPIDAS ─────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[#14161F] border border-white/[0.08] overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-2 border-b border-white/[0.06]">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <i className="fas fa-sliders text-[#00BCD4]" />
            Configuración
          </p>
        </div>

        <div className="p-3 space-y-1.5">
          {/* Editar perfil — por ahora informativo */}
          <button
            type="button"
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-500 cursor-not-allowed transition"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <i className="fas fa-user-pen text-xs" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Editar perfil</p>
              <p className="text-[10px] text-neutral-600">Próximamente disponible</p>
            </div>
            <i className="fas fa-lock text-xs text-neutral-700" />
          </button>

          {/* Cambiar contraseña — por ahora informativo */}
          <button
            type="button"
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-500 cursor-not-allowed transition"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <i className="fas fa-key text-xs" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Cambiar contraseña</p>
              <p className="text-[10px] text-neutral-600">Próximamente disponible</p>
            </div>
            <i className="fas fa-lock text-xs text-neutral-700" />
          </button>
        </div>
      </div>

      {/* ── CERRAR SESIÓN ────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[#14161F] border border-white/[0.08] overflow-hidden shadow-sm p-3">
        {confirming ? (
          <div className="space-y-2 animate-in fade-in duration-200">
            <p className="text-center text-sm text-neutral-300 font-medium py-1">
              ¿Confirmas que deseas cerrar sesión?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="py-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-sm font-bold text-neutral-300 hover:bg-white/[0.1] transition cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-sm font-black text-rose-400 hover:bg-rose-500/30 transition cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
              >
                Sí, salir
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/35 transition cursor-pointer active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center group-hover:bg-rose-500/25 transition">
              <i className="fas fa-right-from-bracket text-xs" />
            </div>
            <span className="flex-1 text-left text-sm font-bold">
              Cerrar sesión
            </span>
            <i className="fas fa-chevron-right text-xs text-rose-400/50" />
          </button>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <div className="text-center py-2">
        <p className="text-[11px] text-neutral-600">
          FinanceApp · <span className="text-neutral-700">v1.0</span>
        </p>
      </div>
    </div>
  );
}
