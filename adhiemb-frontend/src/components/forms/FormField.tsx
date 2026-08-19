import { ReactNode, InputHTMLAttributes, forwardRef } from 'react';
import { Input } from '../ui/Input';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  name?: string;
  register?: any;
  registration?: any;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, register, registration, name, ...props },
  ref
) {
  const reg = registration || (register && name ? register(name) : {});
  return (
    <Input
      label={label}
      error={error}
      ref={ref}
      {...reg}
      {...props}
    />
  );
});
