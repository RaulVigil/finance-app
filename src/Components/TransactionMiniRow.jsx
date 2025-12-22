const formatFecha = (fecha) => {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function TransactionMiniRow({ tx }) {
  const isIngreso = tx.tipo === "Ingreso";

  return (
    <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
      <div>
        <p className="text-sm text-gray-700">{tx.descripcion}</p>
        <p className="text-xs text-gray-400">{formatFecha(tx.fecha)}</p>

      </div>

      <p
        className={`text-sm font-semibold ${
          isIngreso ? "text-green-600" : "text-red-500"
        }`}
      >
        {isIngreso ? "+" : "-"}${Number(tx.monto).toFixed(2)}
      </p>
    </div>
  );
}
