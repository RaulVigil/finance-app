import { useState, useRef, useEffect } from "react";

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
  const dropdownRef = useRef(null);

  const selectedItem = items.find((i) => getKey(i) === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition cursor-pointer shadow-inner ${
          open
            ? "border-[#00BCD4]/70 bg-[#141620] ring-1 ring-[#00BCD4]/30"
            : "border-white/[0.1] bg-[#12141A] hover:border-white/[0.2]"
        }`}
      >
        <span className={`text-sm truncate ${value ? "text-white font-medium" : "text-neutral-500"}`}>
          {value ? getLabel(selectedItem) : placeholder}
        </span>

        <i
          className={`fas fa-chevron-down text-xs text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
            open ? "rotate-180 text-[#00BCD4]" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-[#161822] rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.85)] border border-white/[0.12] max-h-60 overflow-y-auto p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl text-left transition cursor-pointer flex items-center justify-between ${
                !value
                  ? "bg-[#00BCD4]/15 text-[#00BCD4] font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span>{emptyLabel}</span>
              {!value && <i className="fas fa-check text-xs text-[#00BCD4]" />}
            </button>
          )}

          {loading ? (
            <div className="p-4 text-xs text-neutral-400 text-center flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin text-[#00BCD4]" />
              <span>Cargando opciones...</span>
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-xs text-neutral-500 text-center">
              {emptyText}
            </p>
          ) : (
            items.map((item) => {
              const itemKey = getKey(item);
              const isSelected = value === itemKey;
              return (
                <button
                  key={itemKey}
                  type="button"
                  onClick={() => {
                    onChange(itemKey);
                    setOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl text-left transition cursor-pointer flex items-center justify-between my-0.5 ${
                    isSelected
                      ? "bg-[#00BCD4]/15 text-[#00BCD4] font-bold shadow-sm"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="truncate">{getLabel(item)}</span>
                  {isSelected && <i className="fas fa-check text-xs text-[#00BCD4]" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
