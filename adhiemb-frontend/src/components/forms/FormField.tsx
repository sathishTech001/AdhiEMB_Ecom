import { ReactNode, InputHTMLAttributes, forwardRef } from 'react';
import { Input } from '../ui/Input';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  name?: string;
  register?: any;
  registration?: any;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, helperText, register, registration, name, ...props },
  ref
) {
  const reg = registration || (register && name ? register(name) : {});
  const resolvedRef = ref || (props as any).ref || reg.ref;
  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      name={name || reg.name}
      ref={resolvedRef}
      {...reg}
      {...props}
    />
  );
});
