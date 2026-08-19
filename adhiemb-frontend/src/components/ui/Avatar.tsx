import { forwardRef } from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 dark:from-primary-900/50 dark:to-primary-800/50 dark:text-primary-300 font-semibold shadow-sm overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt || name || 'Avatar'} 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{name ? getInitials(name) : 'U'}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
