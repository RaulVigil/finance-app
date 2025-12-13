export default function TransactionCard({ tx }) {
  const isIngreso = tx.tipo === "Ingreso";

  return (
    <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div>
        <p className="font-medium text-gray-900">{tx.descripcion}</p>
        <p className="text-xs text-gray-500">
          {tx.categoria} · {tx.fecha}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`font-bold ${
            isIngreso ? "text-green-600" : "text-red-500"
          }`}
        >
          {isIngreso ? "+" : "-"}${Number(tx.monto).toFixed(2)}
        </p>

        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            tx.estado === "pagado"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {tx.estado}
        </span>
      </div>
    </div>
  );
}
