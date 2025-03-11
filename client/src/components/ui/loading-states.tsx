import React from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'pulse' | 'spinner' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  className,
}: LoadingStateProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-10 w-10';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
            <div className={cn('animate-pulse rounded-full bg-primary', getSize())} />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
          </div>
        );
      case 'skeleton':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-[230px] animate-pulse rounded-md bg-muted"></div>
            {text && <p className="text-sm text-muted-foreground animate-pulse mt-2">{text}</p>}
          </div>
        );
      case 'spinner':
      default:
        return (
          <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
            <Loader2 className={cn('animate-spin text-primary', getSize())} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );
    }
  };

  return renderContent();
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  icon = <ArrowUpRight className="ml-2 h-4 w-4" />,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}