import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'green' | 'blue' | 'amber' | 'orange' | 'purple' | 'pink' | 'red';
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, color = 'green', size = 'sm' }: ProgressBarProps) {
  const clamped = Math.min(value, 100);
  return (
    <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500', {
          'bg-green-500': color === 'green',
          'bg-blue-500': color === 'blue',
          'bg-amber-500': color === 'amber',
          'bg-orange-500': color === 'orange',
          'bg-purple-500': color === 'purple',
          'bg-pink-500': color === 'pink',
          'bg-red-500': color === 'red',
        })}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
