import { SelectHTMLAttributes, forwardRef } from 'react';
import { Select } from '../ui/Select';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  name?: string;
  register?: any;
  registration?: any;
  options?: { label: string; value: string | number }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, register, registration, name, options, ...props },
  ref
) {
  const reg = registration || (register && name ? register(name) : {});
  return (
    <Select
      label={label}
      error={error}
      options={options || []}
      ref={ref}
      {...reg}
      {...props}
    />
  );
});
