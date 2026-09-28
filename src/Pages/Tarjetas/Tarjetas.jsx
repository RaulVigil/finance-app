import { useState, useEffect, useMemo } from "react";
import useTarjetas from "./useTarjetas";
import useCategorias from "../Transactions/useCategorias";
import Api from "../../Services/api";
import { toast } from "react-toastify";
import LogoEmblem from "../../Components/LogoEmblem";
import Modal from "../../Components/Modal";

const inputBase =
  "w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner [color-scheme:dark]";


// ── Componente Chip EMV ultra-realista ──────────────────────────────────────
function ChipEMV() {
  return (
    <div className="w-8 h-6 sm:w-9 sm:h-6.5 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm select-none shrink-0">
      <div className="w-full h-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 rounded-[3px] relative overflow-hidden flex items-center justify-center">
        <div className="w-full h-[1px] bg-amber-700/50 absolute top-2" />
        <div className="w-full h-[1px] bg-amber-700/50 absolute bottom-2" />
        <div className="h-full w-[1px] bg-amber-700/50 absolute left-2.5" />
        <div className="h-full w-[1px] bg-amber-700/50 absolute right-2.5" />
        <div className="w-2.5 h-2 rounded-[2px] border border-amber-800/50 bg-amber-400/80 z-10" />
      </div>
    </div>
  );
}

// ── Badge de Red de Tarjeta (Visa, Mastercard, Amex, FinTech) ───────────────
function CardNetworkBadge({ nombre = "", banco = "" }) {
  const combined = `${nombre} ${banco}`.toLowerCase();
  if (combined.includes("visa")) {
    return (
      <span className="font-black italic text-base sm:text-lg tracking-tighter text-white select-none pr-1">
        <span className="text-[#00BCD4] mr-0.5">/</span>VISA
      </span>
    );
  }
  if (combined.includes("master") || combined.includes("mc")) {
    return (
      <div className="flex -space-x-2 items-center select-none shrink-0 pr-1">
        <div className="w-5 h-5 rounded-full bg-rose-500/90 shadow-sm" />
        <div className="w-5 h-5 rounded-full bg-amber-400/90 shadow-sm" />
      </div>
    );
  }
  if (combined.includes("amex") || combined.includes("american")) {
    return (
      <span className="font-extrabold text-[10px] uppercase tracking-wider text-cyan-300 border border-cyan-400/40 bg-cyan-950/40 px-1.5 py-0.5 rounded select-none">
        AMEX
      </span>
    );
  }
  return (
    <div className="w-6 h-6 opacity-75 shrink-0">
      <LogoEmblem className="w-full h-full" circleColor="#00BCD4" dotColor="#FFFFFF" />
    </div>
  );
}

// ── Tarjeta de crédito visual ultra-moderna ──────────────────────────────────
function TarjetaCard({ tarjeta, onSelect, index = 0 }) {
  const limite = Number(tarjeta.limite_credito);
  const utilizado = Number(tarjeta.saldo_utilizado);
  const disponible = Number(tarjeta.saldo_disponible);
  const pct = limite > 0 ? Math.min(100, Math.round((utilizado / limite) * 100)) : 0;
  const isActive = tarjeta.estado === "Activa";

  // Gradientes premium para dar variedad de plásticos
  const gradients = [
    "from-[#1F232E] via-[#14161F] to-[#0D0E13]", // Obsidian Titanio
    "from-[#182330] via-[#111A24] to-[#0A1017]", // Zafiro Profundo
    "from-[#251D29] via-[#19141D] to-[#0F0B12]", // Amatista Dark
    "from-[#1A2624] via-[#121C1A] to-[#0A1110]", // Esmeralda FinTech
  ];
  const bgGradient = gradients[index % gradients.length];
  const lastFour = String(tarjeta.tarjeta_id || "1").padStart(4, "0");

  return (
    <div
      onClick={() => onSelect(tarjeta)}
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${bgGradient} border border-white/[0.12] hover:border-white/[0.25] shadow-[0_14px_34px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_40px_rgba(0,188,212,0.18)] transition-all duration-300 cursor-pointer group active:scale-[0.99]`}
    >
      {/* Glow de acento según uso */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all group-hover:opacity-30"
        style={{ background: pct > 80 ? "#F43F5E" : pct > 50 ? "#F59E0B" : "#00BCD4" }}
      />

      {/* Marca de agua */}
      <div className="absolute -right-6 -bottom-8 w-44 h-44 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none select-none text-white transform -rotate-12 transition-all">
        <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Fila 1: Banco, Nombre y Logo de Red */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00BCD4]">
              {tarjeta.banco || "Tarjeta de Crédito"}
            </span>
            <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-cyan-200 transition">
              {tarjeta.nombre}
            </h3>
          </div>

          <CardNetworkBadge nombre={tarjeta.nombre} banco={tarjeta.banco} />
        </div>

        {/* Fila 2: Chip EMV + Contactless + Número de Tarjeta Enmascarado */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5">
            <ChipEMV />
            <i className="fas fa-wifi text-neutral-400 text-xs rotate-90" />
          </div>

          <div className="font-mono text-xs tracking-[0.2em] text-neutral-400 group-hover:text-neutral-200 transition select-none">
            •••• •••• •••• <span className="text-white font-bold">{lastFour}</span>
          </div>
        </div>

        {/* Fila 3: Saldo Disponible Hero & Límite */}
        <div className="pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Cupo disponible
          </p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-light text-emerald-400 select-none">$</span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
              {disponible.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-neutral-400 ml-2">
              / ${limite.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Fila 4: Barra de Uso con Porcentaje */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-neutral-400 font-medium">
              Utilizado: <strong className="text-white">${utilizado.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
            </span>
            <span
              className={`font-bold tabular-nums ${
                pct > 80 ? "text-rose-400" : pct > 50 ? "text-amber-400" : "text-[#00BCD4]"
              }`}
            >
              {pct}% usado
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                pct > 80
                  ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                  : pct > 50
                  ? "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                  : "bg-[#00BCD4] shadow-[0_0_8px_#00BCD4]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Fila 5: Footer con Fechas de Corte/Pago y Estado */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            {tarjeta.dia_corte && (
              <span className="flex items-center gap-1.5 text-[11px]">
                <i className="fas fa-scissors text-[10px] text-neutral-500" />
                <span>Corte día {tarjeta.dia_corte}</span>
              </span>
            )}
            {tarjeta.dia_pago && (
              <span className="flex items-center gap-1.5 text-[11px]">
                <i className="fas fa-calendar-check text-[10px] text-[#00BCD4]" />
                <span>Pago día {tarjeta.dia_pago}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-400 shadow-[0_0_6px_#10B981]" : "bg-neutral-600"
              }`}
            />
            <span className="text-[10px] font-semibold text-neutral-300">
              {tarjeta.estado || "Activa"}
            </span>
            <i className="fas fa-chevron-right text-[10px] text-neutral-500 group-hover:translate-x-0.5 transition-transform ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detalle de Tarjeta (Vista Expandida en Obsidian FinTech) ──────────────────
function TarjetaDetalle({ tarjeta: initial, categorias, onBack, onRefetch }) {
  const [tarjeta, setTarjeta] = useState(initial);
  const [modal, setModal] = useState(null); // "gasto" | "pagar" | "cuota" | "editar"
  const [transacciones, setTransacciones] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [gastosPendientes, setGastosPendientes] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(true);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos"); // "todos" | "cargos" | "abonos"

  useEffect(() => {
    Api.get(`tarjetas/${tarjeta.tarjeta_id}`)
      .then((r) => {
        setTarjeta(r.data.tarjeta);
        setTransacciones(r.data.transacciones || []);
        setDeudas(r.data.deudas_cuotas || []);
        setGastosPendientes(r.data.gastos_pendientes || []);
      })
      .finally(() => setLoadingDetalle(false));
  }, [tarjeta.tarjeta_id]);

  const limite = Number(tarjeta.limite_credito || 0);
  const utilizado = Number(tarjeta.saldo_utilizado || 0);
  const disponible = Number(tarjeta.saldo_disponible || 0);
  const pct = limite > 0 ? Math.min(100, Math.round((utilizado / limite) * 100)) : 0;
  const lastFour = String(tarjeta.tarjeta_id || "1").padStart(4, "0");

  // Conteo y filtrado de transacciones
  const cargosCount = useMemo(() => transacciones.filter((t) => !t.es_abono).length, [transacciones]);
  const abonosCount = useMemo(() => transacciones.filter((t) => t.es_abono).length, [transacciones]);

  const filteredTransacciones = useMemo(() => {
    if (filtroTipo === "cargos") return transacciones.filter((t) => !t.es_abono);
    if (filtroTipo === "abonos") return transacciones.filter((t) => t.es_abono);
    return transacciones;
  }, [transacciones, filtroTipo]);

  // Planes de financiamiento con saldo pendiente
  const planesActivos = useMemo(() => {
    return deudas.filter((d) => d.estado !== "Pagada" && Number(d.saldo_pendiente) > 0);
  }, [deudas]);

  // ── Registrar gasto con tarjeta ──
  async function handleGasto() {
    if (!form.monto || !form.categoria_id) {
      toast.error("Monto y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      // Una sola llamada: el backend registra la transacción Y crea el gasto pendiente
      await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/gasto`, {
        monto: Number(form.monto),
        categoria_id: Number(form.categoria_id),
        descripcion: form.descripcion || null,
        fecha: new Date().toISOString().split("T")[0],
        reponer_gasto: form.reponerGasto !== false,
      });

      toast.success("Gasto registrado con la tarjeta");

      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setTransacciones(r.data.transacciones || []);
      setGastosPendientes(r.data.gastos_pendientes || []);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al registrar el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Pagar tarjeta ──
  async function handlePagar() {
    setSaving(true);
    try {
      await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/pagar`, {
        monto: form.monto ? Number(form.monto) : undefined,
        categoria_id: form.categoria_id || undefined,
        deuda_id: form.deuda_id ? Number(form.deuda_id) : undefined,
        descripcion: form.descripcion || undefined,
      });
      toast.success("✅ Pago de tarjeta registrado exitosamente");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setTransacciones(r.data.transacciones || []);
      setDeudas(r.data.deudas_cuotas || []);
      setGastosPendientes(r.data.gastos_pendientes || []);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al pagar la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  // ── Registrar cuota tasa 0 ──
  async function handleCuota() {
    if (!form.nombre_deuda || !form.monto_total_inicial || !form.cuota_mensual) {
      toast.error("Nombre, monto total y cuota mensual son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/cuota`, form);
      toast.success("Compra a cuotas registrada");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setDeudas(r.data.deudas_cuotas || []);
      setGastosPendientes(r.data.gastos_pendientes || []);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al registrar la cuota");
    } finally {
      setSaving(false);
    }
  }

  // ── Editar tarjeta ──
  async function handleEditar() {
    if (!form.nombre) {
      toast.error("El nombre de la tarjeta es obligatorio");
      return;
    }
    setSaving(true);
    try {
      await Api.put(`tarjetas/${tarjeta.tarjeta_id}`, {
        nombre: form.nombre,
        banco: form.banco || null,
        dia_corte: form.dia_corte ? Number(form.dia_corte) : null,
        dia_pago: form.dia_pago ? Number(form.dia_pago) : null,
        estado: form.estado || "Activa",
      });
      toast.success("Tarjeta actualizada correctamente");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al actualizar la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  // ── Eliminar tarjeta ──
  async function handleEliminar() {
    if (utilizado > 0) {
      toast.error(`No puedes eliminar la tarjeta mientras tenga saldo pendiente ($${utilizado.toFixed(2)})`);
      return;
    }
    if (!window.confirm("¿Seguro que deseas eliminar esta tarjeta de crédito? Esta acción no se puede deshacer.")) {
      return;
    }
    setSaving(true);
    try {
      await Api.delete(`tarjetas/${tarjeta.tarjeta_id}`);
      toast.success("Tarjeta eliminada correctamente");
      setModal(null);
      onRefetch();
      onBack();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al eliminar la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Barra superior de navegación */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition cursor-pointer active:scale-95"
        >
          <i className="fas fa-arrow-left text-xs" />
          <span>Mis tarjetas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                nombre: tarjeta.nombre || "",
                banco: tarjeta.banco || "",
                dia_corte: tarjeta.dia_corte || "",
                dia_pago: tarjeta.dia_pago || "",
                estado: tarjeta.estado || "Activa",
              });
              setModal("editar");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition cursor-pointer active:scale-95"
          >
            <i className="fas fa-pen-to-square text-[11px]" />
            <span>Editar</span>
          </button>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              tarjeta.estado === "Activa"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            ● {tarjeta.estado || "Activa"}
          </span>
        </div>
      </div>

      {/* TARJETA HERO METÁLICA DE LA TARJETA */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#1F232E] via-[#14161F] to-[#0D0E13] border border-white/[0.14] shadow-[0_24px_50px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Glow de acento */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: pct > 80 ? "#F43F5E" : pct > 50 ? "#F59E0B" : "#00BCD4" }}
        />

        {/* Marca de agua */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        <div className="relative z-10 space-y-5">
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#00BCD4]">
                {tarjeta.banco || "Tarjeta de Crédito"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {tarjeta.nombre}
              </h2>
            </div>

            <CardNetworkBadge nombre={tarjeta.nombre} banco={tarjeta.banco} />
          </div>

          {/* Chip EMV + Contactless + Número de Tarjeta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ChipEMV />
              <i className="fas fa-wifi text-neutral-400 text-xs rotate-90" />
            </div>

            <div className="font-mono text-sm tracking-[0.25em] text-neutral-400 select-none">
              •••• •••• •••• <span className="text-white font-bold">{lastFour}</span>
            </div>
          </div>

          {/* Cifra Disponible Hero */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Saldo Disponible
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-light text-emerald-400 select-none">$</span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
                {disponible.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Subtarjetas de métricas: Límite & Utilizado */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Límite de crédito
              </span>
              <p className="text-base sm:text-lg font-black text-white tabular-nums">
                ${limite.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Saldo Utilizado
              </span>
              <p
                className={`text-base sm:text-lg font-black tabular-nums ${
                  utilizado > 0 ? "text-rose-400" : "text-neutral-400"
                }`}
              >
                ${utilizado.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Barra de progreso de cupo */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Nivel de utilización de la línea</span>
              <span
                className={`font-bold tabular-nums ${
                  pct > 80 ? "text-rose-400" : pct > 50 ? "text-amber-400" : "text-[#00BCD4]"
                }`}
              >
                {pct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct > 80
                    ? "bg-rose-500 shadow-[0_0_10px_#F43F5E]"
                    : pct > 50
                    ? "bg-amber-400 shadow-[0_0_10px_#F59E0B]"
                    : "bg-[#00BCD4] shadow-[0_0_10px_#00BCD4]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Fechas de corte y pago */}
          {(tarjeta.dia_corte || tarjeta.dia_pago) && (
            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
              {tarjeta.dia_corte && (
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-scissors text-[10px] text-neutral-500" />
                  <span>Corte: <strong>Día {tarjeta.dia_corte}</strong> de cada mes</span>
                </span>
              )}
              {tarjeta.dia_pago && (
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-calendar-check text-[10px] text-[#00BCD4]" />
                  <span>Pago: <strong>Día {tarjeta.dia_pago}</strong> de cada mes</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DOCK DE ACCIONES RÁPIDAS FINTECH */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Botón 1: Registrar Gasto */}
        <button
          type="button"
          onClick={() => {
            setForm({ reponerGasto: true });
            setModal("gasto");
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#14161F] hover:bg-[#181B26] border border-white/[0.08] hover:border-rose-500/30 flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 flex items-center justify-center transition shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <i className="fas fa-arrow-trend-down text-sm" />
          </div>
          <span className="text-xs font-bold text-neutral-200 group-hover:text-white text-center">
            Gasto Tarjeta
          </span>
        </button>

        {/* Botón 2: Pagar Tarjeta */}
        <button
          type="button"
          onClick={() => {
            setForm({ monto: utilizado > 0 ? utilizado : "" });
            setModal("pagar");
          }}
          disabled={utilizado <= 0}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#14161F] hover:bg-[#181B26] border border-white/[0.08] hover:border-emerald-500/30 flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 flex items-center justify-center transition shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <i className="fas fa-money-bill-wave text-sm" />
          </div>
          <span className="text-xs font-bold text-neutral-200 group-hover:text-white text-center">
            Pagar Tarjeta
          </span>
        </button>

        {/* Botón 3: Compra a Cuotas / Tasa 0 */}
        <button
          type="button"
          onClick={() => {
            setForm({});
            setModal("cuota");
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#14161F] hover:bg-[#181B26] border border-white/[0.08] hover:border-cyan-500/30 flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-[#00BCD4] border border-cyan-500/25 flex items-center justify-center transition shadow-[0_0_12px_rgba(0,188,212,0.15)]">
            <i className="fas fa-layer-group text-sm" />
          </div>
          <span className="text-xs font-bold text-neutral-200 group-hover:text-white text-center">
            Tasa 0 / Cuotas
          </span>
        </button>
      </div>

      {/* PLANES A CUOTAS / TASA 0% */}
      {deudas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <i className="fas fa-layer-group text-xs text-[#00BCD4]" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Planes a Cuotas / Tasa 0 ({deudas.length})
              </p>
            </div>
            <span className="text-[10px] font-bold text-cyan-300 bg-[#00BCD4]/10 border border-[#00BCD4]/25 px-2 py-0.5 rounded-full">
              Financiamiento Activo
            </span>
          </div>

          <div className="space-y-3">
            {deudas.map((d) => {
              const total = Number(d.monto_total_inicial || 0);
              const pendiente = Number(d.saldo_pendiente || 0);
              const cuota = Number(d.cuota_mensual || 0);
              const pagado = Math.max(0, total - pendiente);
              const pctPlan = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0;
              const isPagada = d.estado === "Pagada" || pendiente <= 0;
              const cuotasTotales = cuota > 0 ? Math.ceil(total / cuota) : 0;
              const cuotasPagadas = cuota > 0 ? Math.min(cuotasTotales, Math.floor(pagado / cuota)) : 0;
              const cuotasFaltantes = cuotasTotales - cuotasPagadas;

              return (
                <div
                  key={d.deuda_id}
                  className="bg-[#13151B]/85 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 space-y-3 shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/15 text-[#00BCD4] border border-[#00BCD4]/25 flex items-center justify-center shrink-0">
                        <i className="fas fa-layer-group text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base text-white truncate">
                          {d.nombre_deuda}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-[#00BCD4] bg-[#00BCD4]/10 px-2 py-0.5 rounded-full border border-[#00BCD4]/20">
                            Tasa 0%
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              isPagada ? "text-neutral-500" : "text-emerald-400"
                            }`}
                          >
                            ● {isPagada ? "Completado" : "En curso"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                        Por Liquidar
                      </p>
                      <p
                        className={`font-black text-base tabular-nums ${
                          isPagada ? "text-neutral-500" : "text-white"
                        }`}
                      >
                        ${pendiente.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{pctPlan}% amortizado</span>
                      {cuotasTotales > 0 && (
                        <span className="text-neutral-400 font-medium">
                          {cuotasPagadas} de {cuotasTotales} cuotas
                        </span>
                      )}
                    </div>

                    <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00BCD4] to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pctPlan}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
                      <span>
                        Abonado: <strong className="text-neutral-200">${pagado.toFixed(2)}</strong>
                      </span>
                      <span>
                        Total: <strong className="text-neutral-200">${total.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Cuota, meses restantes y acción rápida */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400 pt-2 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <i className="far fa-calendar-check text-[#00BCD4]" />
                        Cuota: <strong className="text-white">${cuota.toFixed(2)} / mes</strong>
                      </span>
                      {!isPagada && cuotasFaltantes > 0 && (
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          Resta {cuotasFaltantes} {cuotasFaltantes === 1 ? "mes" : "meses"}
                        </span>
                      )}
                    </div>

                    {!isPagada && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            deuda_id: d.deuda_id,
                            monto: cuota > 0 && pendiente > cuota ? cuota : pendiente,
                          });
                          setModal("pagar");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 font-bold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-xs self-end sm:self-auto shadow-sm"
                      >
                        <i className="fas fa-money-bill-wave text-[10px]" />
                        <span>Abonar a este plan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GASTOS PENDIENTES (CONSUMOS NORMALES A REPONER) */}
      {gastosPendientes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <i className="fas fa-receipt text-xs text-rose-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Consumos por Reponer ({gastosPendientes.filter(g => g.estado === "pendiente").length})
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {gastosPendientes.map((g) => {
              const isPagado = g.estado === "pagado";
              const mesesNombres = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
              const mesName = mesesNombres[g.mes - 1] || g.mes;

              return (
                <div
                  key={g.gasto_id}
                  className={`bg-[#13151B]/85 border rounded-2xl p-3.5 flex justify-between items-center gap-3 transition shadow-sm ${
                    isPagado ? "border-emerald-500/20 opacity-70" : "border-white/[0.08] hover:border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPagado
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                      }`}
                    >
                      <i className={`fas ${isPagado ? "fa-check" : "fa-cart-shopping"} text-xs`} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className={`text-sm font-bold truncate ${isPagado ? "text-neutral-400" : "text-white"}`}>
                        {g.nombre}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-neutral-400">Mes: {mesName} {g.anio}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            isPagado
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                              : "bg-rose-500/10 text-rose-300 border-rose-500/25"
                          }`}
                        >
                          {isPagado ? "Repuesto" : "Pendiente de pago"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-black tabular-nums ${
                        isPagado ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      ${Number(g.monto).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORIAL DE MOVIMIENTOS CON ESTA TARJETA */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <i className="fas fa-clock-rotate-left text-xs text-[#00BCD4]" />
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Movimientos con esta tarjeta
            </p>
          </div>

          {/* Filtros Píldora: Todos / Compras / Abonos */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
            <button
              type="button"
              onClick={() => setFiltroTipo("todos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroTipo === "todos"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Todos ({transacciones.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("cargos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroTipo === "cargos"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Compras ({cargosCount})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("abonos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroTipo === "abonos"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Abonos ({abonosCount})
            </button>
          </div>
        </div>

        {loadingDetalle ? (
          <div className="py-8 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
            <i className="fas fa-circle-notch fa-spin text-[#00BCD4]" />
            <span>Cargando movimientos...</span>
          </div>
        ) : filteredTransacciones.length === 0 ? (
          <div className="bg-[#13151B]/60 rounded-2xl border border-white/[0.06] p-7 text-center text-neutral-400 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
              <i className="fas fa-receipt text-base" />
            </div>
            <p className="font-bold text-white text-xs">
              {filtroTipo === "cargos"
                ? "Sin compras registradas con esta tarjeta"
                : filtroTipo === "abonos"
                ? "Sin pagos o abonos registrados aún"
                : "Sin movimientos con esta tarjeta"}
            </p>
            <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
              Las transacciones aparecerán organizadas en este historial conforme las vayas realizando.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransacciones.map((tx) => (
              <div
                key={tx.transaccion_id}
                className="bg-[#13151B]/85 hover:bg-[#181B22] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-3.5 flex justify-between items-center gap-3 transition shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.es_abono
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                    }`}
                  >
                    <i className={`fas ${tx.es_abono ? "fa-arrow-down" : "fa-arrow-trend-down"} text-xs`} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-white truncate">
                      {tx.descripcion || tx.categoria || "Movimiento"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-neutral-400">{tx.fecha}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          tx.es_abono
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/25"
                        }`}
                      >
                        {tx.es_abono ? "Abono / Pago" : "Cargo a tarjeta"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-black tabular-nums ${
                      tx.es_abono ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.es_abono ? "+" : "-"}${Number(tx.monto).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: Registrar gasto con tarjeta ── */}
      {modal === "gasto" && (
        <Modal
          title="Registrar gasto con tarjeta"
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          <div className="p-3 rounded-2xl bg-[#00BCD4]/10 border border-[#00BCD4]/25 text-xs text-[#00BCD4] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <i className="fas fa-info-circle text-[11px]" /> Consumo de crédito
            </p>
            <p className="text-neutral-300">
              Este gasto reduce el cupo disponible de la tarjeta. <strong>No descuenta de tu cuenta corriente</strong> hasta que realices el pago.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Monto de la compra</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00BCD4] font-bold text-sm">$</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                autoFocus
                className={`${inputBase} pl-8 text-base font-bold`}
                value={form.monto || ""}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Categoría</label>
            <select
              className={inputBase}
              value={form.categoria_id || ""}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="" className="bg-[#161822]">Selecciona categoría</option>
              {categorias.map((c) => (
                <option key={c.categoria_id} value={c.categoria_id} className="bg-[#161822]">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Descripción / Comercio</label>
            <input
              placeholder="Ej. Supermercado, Restaurante, Combustible..."
              className={inputBase}
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          {/* Toggle para auto-reponer en Gastos del Mes */}
          <label className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] cursor-pointer group">
            <input
              type="checkbox"
              checked={form.reponerGasto ?? true}
              onChange={(e) => setForm({ ...form, reponerGasto: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-[#00BCD4] accent-[#00BCD4] bg-[#12141A] border-white/[0.2] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-white group-hover:text-[#00BCD4] transition">
                Agregar a "Por Pagar" en Gastos del Mes
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Aparecerá en tu checklist mensual para recordarte reponer el dinero antes de la fecha de corte.
              </p>
            </div>
          </label>

          <button
            type="button"
            onClick={handleGasto}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Guardando..." : "Registrar gasto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Pagar tarjeta ── */}
      {modal === "pagar" && (
        <Modal
          title="Pagar tarjeta de crédito"
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <i className="fas fa-info-circle text-[11px]" /> Abono a la tarjeta
            </p>
            <p className="text-neutral-300">
              Este pago <strong>descuenta de tu saldo actual de efectivo</strong> y libera cupo disponible en tu tarjeta.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12141A] border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-neutral-400">Saldo utilizado total:</span>
            <span className="text-lg font-black text-rose-400 tabular-nums">
              ${utilizado.toFixed(2)}
            </span>
          </div>

          {/* Selector de destino del pago (general vs planes activos) */}
          {planesActivos.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium block">
                Destino del abono
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {/* Opción 1: Saldo general */}
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      deuda_id: null,
                      monto: utilizado > 0 ? utilizado : "",
                    });
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                    !form.deuda_id
                      ? "bg-[#00BCD4]/10 border-[#00BCD4]/60 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.15]"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <i className="fas fa-credit-card text-[#00BCD4]" />
                    <span>Abono general a la línea</span>
                  </span>
                  <span className="font-bold tabular-nums text-rose-400">${utilizado.toFixed(2)}</span>
                </button>

                {/* Opción 2+: Cada plan de financiamiento activo */}
                {planesActivos.map((p) => {
                  const isSelected = Number(form.deuda_id) === Number(p.deuda_id);
                  const pendiente = Number(p.saldo_pendiente || 0);
                  const cuota = Number(p.cuota_mensual || 0);
                  return (
                    <button
                      key={p.deuda_id}
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          deuda_id: p.deuda_id,
                          monto: cuota > 0 && pendiente > cuota ? cuota : pendiente,
                        });
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="flex items-center gap-1.5 font-bold text-white truncate">
                          <i className="fas fa-layer-group text-xs text-[#00BCD4]" />
                          {p.nombre_deuda}
                        </span>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          Cuota: ${cuota.toFixed(2)} / mes
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 block uppercase font-medium">Por liquidar</span>
                        <span className="font-bold tabular-nums text-emerald-400">${pendiente.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="text-neutral-400 font-medium">Monto a abonar / pagar</label>
              <div className="flex items-center gap-2">
                {form.deuda_id ? (
                  (() => {
                    const selPlan = planesActivos.find((p) => Number(p.deuda_id) === Number(form.deuda_id));
                    if (!selPlan) return null;
                    const pPendiente = Number(selPlan.saldo_pendiente || 0);
                    const pCuota = Number(selPlan.cuota_mensual || 0);
                    return (
                      <>
                        {pCuota > 0 && pPendiente > pCuota && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, monto: pCuota })}
                            className="text-[#00BCD4] font-bold hover:underline cursor-pointer"
                          >
                            Cuota (${pCuota.toFixed(2)})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, monto: pPendiente })}
                          className="text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Liquidar (${pPendiente.toFixed(2)})
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, monto: utilizado })}
                    className="text-[#00BCD4] font-bold hover:underline cursor-pointer"
                  >
                    Pagar total (${utilizado.toFixed(2)})
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">$</span>
              <input
                type="number"
                step="any"
                placeholder={utilizado.toFixed(2)}
                className={`${inputBase} pl-8 text-base font-bold`}
                value={form.monto || ""}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Categoría del egreso</label>
            <select
              className={inputBase}
              value={form.categoria_id || "7"}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="" className="bg-[#161822]">Selecciona categoría</option>
              {categorias.map((c) => (
                <option key={c.categoria_id} value={c.categoria_id} className="bg-[#161822]">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePagar}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Procesando pago..." : "Confirmar pago a la tarjeta"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Cuotas / Tasa 0 ── */}
      {modal === "cuota" && (
        <Modal
          title="Compra a cuotas / Tasa 0"
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-[#00BCD4] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <i className="fas fa-info-circle text-[11px]" /> Plan de Financiamiento
            </p>
            <p className="text-neutral-300">
              Crea un compromiso mensual vinculado a esta tarjeta para llevar el control exacto de tus cuotas pagadas y restantes.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Nombre de la compra</label>
            <input
              placeholder="Ej: Laptop Asus Tasa 0, Celular..."
              className={inputBase}
              value={form.nombre_deuda || ""}
              onChange={(e) => setForm({ ...form, nombre_deuda: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">Monto total</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className={inputBase}
                value={form.monto_total_inicial || ""}
                onChange={(e) => setForm({ ...form, monto_total_inicial: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">Cuota mensual</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className={inputBase}
                value={form.cuota_mensual || ""}
                onChange={(e) => setForm({ ...form, cuota_mensual: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Fecha límite (opcional)</label>
            <input
              type="date"
              className={inputBase}
              value={form.fecha_vencimiento || ""}
              onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={handleCuota}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Guardando..." : "Registrar compra a cuotas"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Editar / Configurar Tarjeta ── */}
      {modal === "editar" && (
        <Modal
          title="Configurar Tarjeta de Crédito"
          onClose={() => {
            setModal(null);
            setForm({});
          }}
        >
          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Nombre de la tarjeta
            </label>
            <input
              placeholder="Ej: Clásica Banco Agrícola, Platinum BBVA..."
              className={inputBase}
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Banco emisor (opcional)
            </label>
            <input
              placeholder="Ej: Banco Agrícola, BAC, Cuscatlán..."
              className={inputBase}
              value={form.banco || ""}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Día de corte
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ej: 15"
                className={inputBase}
                value={form.dia_corte || ""}
                onChange={(e) => setForm({ ...form, dia_corte: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Día de pago
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ej: 5"
                className={inputBase}
                value={form.dia_pago || ""}
                onChange={(e) => setForm({ ...form, dia_pago: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Estado de la tarjeta
            </label>
            <select
              className={inputBase}
              value={form.estado || "Activa"}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="Activa" className="bg-[#161822]">Activa</option>
              <option value="Bloqueada" className="bg-[#161822]">Bloqueada temporalmente</option>
              <option value="Inactiva" className="bg-[#161822]">Inactiva</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleEditar}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Guardando cambios..." : "Guardar Cambios"}
          </button>

          {/* Zona de peligro: Eliminar Tarjeta */}
          <div className="pt-3 border-t border-white/[0.08] mt-2">
            <button
              type="button"
              onClick={handleEliminar}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <i className="fas fa-trash text-xs" />
              <span>Eliminar esta tarjeta</span>
            </button>
            <p className="text-[10px] text-neutral-500 text-center mt-1">
              Solo se puede eliminar si no tiene saldo pendiente por liquidar.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL DE TARJETAS ─────────────────────────────────────────────
export default function Tarjetas() {
  const { tarjetas, loading, error, refetch } = useTarjetas();
  const { categorias } = useCategorias();
  const [selected, setSelected] = useState(null);
  const [modalNueva, setModalNueva] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Totales acumulados de crédito
  const { totalLimite, totalDisponible, totalUtilizado, pctGlobal } = useMemo(() => {
    const list = tarjetas || [];
    const tLim = list.reduce((acc, t) => acc + Number(t.limite_credito || 0), 0);
    const tDisp = list.reduce((acc, t) => acc + Number(t.saldo_disponible || 0), 0);
    const tUtil = list.reduce((acc, t) => acc + Number(t.saldo_utilizado || 0), 0);
    const pctG = tLim > 0 ? Math.min(100, Math.round((tUtil / tLim) * 100)) : 0;
    return { totalLimite: tLim, totalDisponible: tDisp, totalUtilizado: tUtil, pctGlobal: pctG };
  }, [tarjetas]);

  async function handleCrearTarjeta() {
    if (!form.nombre || !form.limite_credito) {
      toast.error("Nombre y límite son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson("tarjetas", form);
      toast.success("Tarjeta creada correctamente");
      setModalNueva(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al crear la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  // Si hay una tarjeta seleccionada, renderizar vista de detalle
  if (selected) {
    return (
      <TarjetaDetalle
        tarjeta={selected}
        categorias={categorias}
        onBack={() => {
          setSelected(null);
          refetch();
        }}
        onRefetch={refetch}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-[#14161F] rounded-3xl border border-white/[0.06]" />
        <div className="h-48 bg-[#14161F] rounded-3xl border border-white/[0.06]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-[#13151B] rounded-3xl border border-rose-500/20 p-6 space-y-3">
        <i className="fas fa-triangle-exclamation text-3xl text-rose-400" />
        <p className="font-bold text-white text-sm">Error al cargar tarjetas de crédito</p>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-xl bg-white/[0.08] text-white text-xs font-bold hover:bg-white/[0.12] transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* TARJETA HERO GLOBAL: RESUMEN DE LÍNEA DE CRÉDITO TOTAL */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Glows ambientales */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#00BCD4" }}
        />

        {/* Marca de agua */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BCD4] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BCD4]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                Tarjetas de Crédito
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.06] tracking-wider">
                {tarjetas.length} {tarjetas.length === 1 ? "Tarjeta" : "Tarjetas"}
              </span>
            </div>

            <button
              onClick={() => {
                setForm({});
                setModalNueva(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-plus text-[10px]" />
              <span>Nueva Tarjeta</span>
            </button>
          </div>

          {/* Cifra Disponible Total */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Cupo Disponible Combinado
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-light text-emerald-400 select-none">$</span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
                {totalDisponible.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-neutral-400 ml-2">
                / ${totalLimite.toLocaleString("en-US", { minimumFractionDigits: 0 })} Total
              </span>
            </div>
          </div>

          {/* Subtarjetas: Límite Total & Saldo Utilizado */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Límite Combinado
              </span>
              <p className="text-base font-black text-white tabular-nums">
                ${totalLimite.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Saldo Utilizado Global
              </span>
              <p
                className={`text-base font-black tabular-nums ${
                  totalUtilizado > 0 ? "text-rose-400" : "text-neutral-400"
                }`}
              >
                ${totalUtilizado.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Barra Global de Utilización */}
          {totalLimite > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Uso total de tus líneas de crédito</span>
                <span
                  className={`font-bold tabular-nums ${
                    pctGlobal > 80 ? "text-rose-400" : pctGlobal > 50 ? "text-amber-400" : "text-[#00BCD4]"
                  }`}
                >
                  {pctGlobal}% utilizado
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pctGlobal > 80
                      ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                      : pctGlobal > 50
                      ? "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                      : "bg-[#00BCD4] shadow-[0_0_8px_#00BCD4]"
                  }`}
                  style={{ width: `${pctGlobal}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE TARJETAS REGISTRADAS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Tus Plásticos ({tarjetas.length})
          </p>
          <span className="text-[11px] text-neutral-500">Toca para gestionar</span>
        </div>

        {tarjetas.length === 0 ? (
          <div className="text-center py-14 bg-[#13151B]/60 rounded-3xl border border-white/[0.06] p-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
              <i className="fas fa-credit-card text-xl text-[#00BCD4]" />
            </div>
            <h3 className="font-bold text-white text-sm">Sin tarjetas de crédito registradas</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Agrega tus tarjetas de crédito para controlar límites, compras en cuotas y fechas de corte.
            </p>
            <button
              onClick={() => {
                setForm({});
                setModalNueva(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCD4] text-[#0C0D10] font-bold text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer"
            >
              <i className="fas fa-plus text-[10px]" />
              Agregar primera tarjeta
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {tarjetas.map((t, idx) => (
              <TarjetaCard
                key={t.tarjeta_id}
                tarjeta={t}
                index={idx}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NUEVA TARJETA DE CRÉDITO */}
      {modalNueva && (
        <Modal
          title="Nueva Tarjeta de Crédito"
          onClose={() => {
            setModalNueva(false);
            setForm({});
          }}
        >
          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Nombre de la tarjeta
            </label>
            <input
              placeholder="Ej: Clásica Banco Agrícola, Platinum BBVA..."
              className={inputBase}
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Banco emisor (opcional)
            </label>
            <input
              placeholder="Ej: Banco Agrícola, BAC, Cuscatlán..."
              className={inputBase}
              value={form.banco || ""}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Límite de crédito aprobado
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00BCD4] font-bold text-sm">$</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className={`${inputBase} pl-8 text-base font-bold`}
                value={form.limite_credito || ""}
                onChange={(e) => setForm({ ...form, limite_credito: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Día de corte
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ej: 15"
                className={inputBase}
                value={form.dia_corte || ""}
                onChange={(e) => setForm({ ...form, dia_corte: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Día de pago
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ej: 5"
                className={inputBase}
                value={form.dia_pago || ""}
                onChange={(e) => setForm({ ...form, dia_pago: e.target.value })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCrearTarjeta}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Creando..." : "Crear Tarjeta"}
          </button>
        </Modal>
      )}
    </div>
  );
}
