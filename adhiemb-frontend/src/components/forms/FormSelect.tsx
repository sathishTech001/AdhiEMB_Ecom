import { SelectHTMLAttributes, forwardRef } from 'react';
import { Select } from '../ui/Select';

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  name?: string;
  register?: any;
  registration?: any;
  options?: { label: string; value: string | number }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, helperText, placeholder, register, registration, name, options, ...props },
  ref
) {
  const reg = registration || (register && name ? register(name) : {});
  const resolvedRef = ref || (props as any).ref || reg.ref;
  return (
    <Select
      label={label}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      name={name || reg.name}
      options={options || []}
      ref={resolvedRef}
      {...reg}
      {...props}
    />
  );
});
