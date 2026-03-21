import clsx from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          'text-green-700 bg-green-100': variant === 'green',
          'text-yellow-700 bg-yellow-100': variant === 'yellow',
          'text-red-700 bg-red-100': variant === 'red',
          'text-gray-600 bg-gray-100': variant === 'gray',
          'text-blue-700 bg-blue-100': variant === 'blue',
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-2.5 py-1': size === 'md',
        }
      )}
    >
      {label}
    </span>
  );
}
