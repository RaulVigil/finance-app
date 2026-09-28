import React, { useId, useState } from "react";

export const InputComponent = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  icon,
  rightElement,
  error,
  helperText,
  showToggle = false,
  showPassword = false,
  onTogglePassword,
  disabled = false,
  required = false,
  autoComplete,
  id,
  name,
  labelRight,
  className = "",
  inputClassName = "",
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const computedType = showToggle ? (showPassword ? "text" : "password") : type;

  const renderLeftIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <i className={`fas fa-${icon} text-xs sm:text-sm`} />;
    }
    return icon;
  };

  return (
    <div className={`w-full text-left ${className}`}>
      {/* Label superior */}
      {(label || labelRight) && (
        <div className="flex items-center justify-between mb-1.5">
          {label ? (
            <label
              htmlFor={inputId}
              className="text-[11px] sm:text-xs font-semibold text-neutral-600 tracking-wider uppercase select-none transition-colors"
            >
              {label}
              {required && <span className="text-[#00BCD4] ml-1 font-bold">*</span>}
            </label>
          ) : <div />}
          {labelRight && (
            <div className="text-xs text-neutral-500">
              {labelRight}
            </div>
          )}
        </div>
      )}

      {/* Contenedor con altura fija e idéntica (h-11 sm:h-12) */}
      <div
        className={`relative flex items-center h-11 sm:h-12 rounded-lg bg-white transition-all duration-150 border overflow-hidden box-border ${
          error
            ? "border-rose-400 ring-1 ring-rose-400/50 bg-rose-50/10"
            : isFocused
            ? "border-[#212121] ring-1 ring-[#212121] shadow-[0_2px_8px_-2px_rgba(0,188,212,0.18)]"
            : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/40"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-neutral-100" : ""}`}
      >
        {/* Indicador arquitectónico vertical en cyan al enfocar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ${
            error
              ? "bg-rose-500"
              : isFocused
              ? "bg-[#00BCD4] opacity-100"
              : "bg-transparent opacity-0"
          }`}
        />

        {/* Ícono izquierdo */}
        {icon && (
          <div
            className={`pl-3.5 pr-1 flex items-center justify-center transition-colors duration-150 shrink-0 select-none ${
              error
                ? "text-rose-500"
                : isFocused
                ? "text-[#212121]"
                : "text-neutral-400"
            }`}
          >
            {renderLeftIcon()}
          </div>
        )}

        {/* Input nativo 100% compatible con autofill y dots estilizados por CSS */}
        <input
          id={inputId}
          name={name}
          type={computedType}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-full py-0 px-3.5 bg-transparent text-[#212121] outline-none disabled:cursor-not-allowed ${
            computedType === "password"
              ? "tracking-[0.35em] text-base font-bold select-none placeholder:tracking-normal placeholder:font-normal"
              : "text-sm sm:text-[15px] font-normal tracking-normal"
          } placeholder:text-neutral-400 placeholder:font-light ${inputClassName}`}
          {...rest}
        />

        {/* Toggle para mostrar/ocultar contraseña */}
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={disabled}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="px-3 py-1.5 mr-1 text-neutral-400 hover:text-[#212121] transition-colors cursor-pointer select-none rounded hover:bg-neutral-100 text-xs font-medium shrink-0 flex items-center justify-center"
          >
            <i
              className={`fas ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              } text-xs transition-transform duration-150`}
            />
          </button>
        )}

        {/* Elemento derecho personalizado */}
        {!showToggle && rightElement && (
          <div className="pr-3 flex items-center shrink-0">
            {rightElement}
          </div>
        )}
      </div>

      {/* Mensaje de error estilizado */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 text-xs font-medium animate-fadeIn">
          <i className="fas fa-circle-exclamation text-[11px] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Texto de ayuda */}
      {!error && helperText && (
        <p className="mt-1 text-[11px] text-neutral-400 font-normal">{helperText}</p>
      )}
    </div>
  );
};

export default InputComponent;
