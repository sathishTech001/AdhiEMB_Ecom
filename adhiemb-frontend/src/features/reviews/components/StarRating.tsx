import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const currentDisplayValue = hoverValue !== null ? hoverValue : value;

  const getLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentDisplayValue;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={cn(
                'rounded-sm transition-all transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
              )}
            >
              <Star
                className={cn(
                  starSizes[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600'
                )}
              />
            </button>
          );
        })}
      </div>

      {showLabel && currentDisplayValue > 0 && (
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 min-w-[70px]">
          {getLabel(currentDisplayValue)}
        </span>
      )}
    </div>
  );
}
