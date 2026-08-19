import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className,
  delay = 500
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, delay);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          localValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        className="glass border-transparent focus:border-primary-500 rounded-full"
      />
    </div>
  );
}
