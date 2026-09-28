import React from "react";

export const ButtonComponent = ({
  children,
  type = "button",
  variant = "primary",
  size = "lg",
  isLoading = false,
  loadingText,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  onClick,
  className = "",
  style = {},
  ...rest
}) => {
  const variantStyles = {
    primary:
      "bg-[#212121] text-white hover:bg-[#141414] active:bg-black shadow-xs hover:shadow-md border border-neutral-800/40 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
    accent:
      "bg-[#00BCD4] text-white font-semibold hover:bg-[#00acc1] active:bg-[#0097a7] shadow-xs hover:shadow-md border border-cyan-600/30",
    outline:
      "bg-white text-[#212121] border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100",
    secondary:
      "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-transparent",
    ghost:
      "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent",
  };

  const sizeStyles = {
    sm: "py-2 px-3 text-xs rounded-lg gap-1.5",
    md: "py-2.5 px-4 text-sm rounded-lg gap-2 font-medium",
    lg: "py-3 px-5 text-sm sm:text-base rounded-lg gap-2 font-semibold tracking-wide",
  };

  const isDisabled = disabled || isLoading;

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <i className={`fas fa-${icon} text-xs`} />;
    }
    return icon;
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isLoading}
      style={style}
      className={`relative inline-flex items-center justify-center font-sans select-none transition-all duration-150 cursor-pointer outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#00BCD4] focus-visible:ring-offset-2 ${
        fullWidth ? "w-full" : "w-auto"
      } ${variantStyles[variant] || variantStyles.primary} ${
        sizeStyles[size] || sizeStyles.lg
      } ${
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none shadow-none"
          : ""
      } ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs sm:text-sm">{loadingText || "Cargando..."}</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{renderIcon(leftIcon)}</span>}
          <span>{children}</span>
          {rightIcon && (
            <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
              {renderIcon(rightIcon)}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default ButtonComponent;
