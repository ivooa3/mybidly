import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  tooltip?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, tooltip, className, type, step, inputMode, ...props }, ref) => {
    // Automatically set inputMode for number inputs on mobile devices
    let autoInputMode = inputMode
    if (type === 'number' && !inputMode) {
      // If step includes decimal (e.g., "0.01") or no step specified, use decimal
      // Otherwise use numeric for integer-only fields
      autoInputMode = step && step !== '1' ? 'decimal' : 'numeric'
    }

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            {tooltip && (
              <div className="group relative inline-block">
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-50 pointer-events-none whitespace-normal">
                  {tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          step={step}
          inputMode={autoInputMode}
          className={clsx(
            'block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900',
            'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
