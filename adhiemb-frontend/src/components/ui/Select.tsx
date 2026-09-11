import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/types/common.types';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, placeholder, options, id, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={selectId}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              {label}
            </label>
            {helperText && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{helperText}</span>
            )}
          </div>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 transition-all',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        >
          {placeholder && !options.some((opt) => opt.value === '') && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
