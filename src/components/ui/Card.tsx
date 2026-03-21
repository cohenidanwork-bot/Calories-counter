import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ padding = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        padding && 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
