import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300': variant === 'secondary',
          'text-gray-600 hover:bg-gray-100 focus:ring-gray-300': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
          'text-sm px-3 py-2 min-h-[36px]': size === 'sm',
          'text-base px-4 py-2.5 min-h-[44px]': size === 'md',
          'text-base px-6 py-3 min-h-[52px]': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Analyzing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
