import React from 'react'

interface InputComponentProps {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: string
  error?: string
  showToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
  disabled?: boolean
}

export const InputComponent: React.FC<InputComponentProps> = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon,
  error,
  showToggle = false,
  showPassword = false,
  onTogglePassword,
  disabled = false,
}) => {
  return (
    <div>
      <div className="relative group">
        {icon && (
          <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <i className={`fas fa-${icon}`} />
          </div>
        )}
        <input
          type={showToggle && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={disabled}
          >
            <i className={`${showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}`} />
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
          <i className="fas fa-exclamation-circle" />
          {error}
        </div>
      )}
    </div>
  )
}
