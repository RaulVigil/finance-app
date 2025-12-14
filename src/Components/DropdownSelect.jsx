import { useState } from "react";

export default function DropdownSelect({
  label,
  placeholder = "Selecciona una opción",
  items = [],
  value,
  onChange,
  loading = false,
  emptyText = "No hay opciones disponibles",
  allowEmpty = false,
  emptyLabel = "Sin selección",
  getKey,
  getLabel,
}) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((i) => getKey(i) === value);

  return (
    <div className="relative space-y-1">
      {label && (
        <p className="text-sm text-gray-500">{label}</p>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#2c295a]/30 transition"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? getLabel(selectedItem) : placeholder}
        </span>

        <i
          className={`fas fa-chevron-down text-sm transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left transition hover:bg-[#f2f0ff] ${
                !value
                  ? "bg-[#eceaff] text-[#2c295a] font-medium"
                  : "text-gray-700"
              }`}
            >
              {emptyLabel}
            </button>
          )}

          {loading ? (
            <p className="p-3 text-sm text-gray-400">
              Cargando...
            </p>
          ) : items.length === 0 ? (
            <p className="p-3 text-sm text-gray-400">
              {emptyText}
            </p>
          ) : (
            items.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => {
                  onChange(getKey(item));
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left transition hover:bg-[#f2f0ff] ${
                  value === getKey(item)
                    ? "bg-[#eceaff] text-[#2c295a] font-medium"
                    : "text-gray-700"
                }`}
              >
                {getLabel(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
