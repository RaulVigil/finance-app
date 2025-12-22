import usePagarTransaccion from "../hooks/usePagarTransaccion";

const formatFecha = (fecha) => {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function TransactionCard({ tx, onPaid }) {
  const isIngreso = tx.tipo === "Ingreso";
  const { pagar, loading } = usePagarTransaccion();

  const handlePagar = async () => {
    const res = await pagar(tx.transaccion_id);
    if (res.success && onPaid) {
      onPaid();
    }
  };

  return (
    <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div>
        <p className="font-medium text-gray-900">{tx.descripcion}</p>
        <p className="text-xs text-gray-500">
          {/* {tx.categoria} ·  */}
          {formatFecha(tx.fecha)}
        </p>
      </div>

      <div className="text-right space-y-1">
        <p
          className={`font-bold ${
            isIngreso ? "text-green-600" : "text-red-500"
          }`}
        >
          {isIngreso ? "+" : "-"}${Number(tx.monto).toFixed(2)}
        </p>

        {tx.estado === "pagado" ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            pagado
          </span>
        ) : (
          <>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              pendiente
            </span>

            <button
              onClick={handlePagar}
              disabled={loading}
              className="block mt-1 text-xs px-3 py-1 rounded-lg bg-[#2c295a] text-white disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Pagar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
