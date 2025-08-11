import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default',
  hover = false 
}: CardProps) {
  const paddingStyles = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const variantStyles = {
    default: {
      backgroundColor: '#ffffff',
      border: '1px solid #f3f4f6',
      boxShadow: 'none',
    },
    bordered: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: '#ffffff',
      border: '1px solid #f3f4f6',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    }
  };

  const hoverStyles = {
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    bordered: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const baseStyle = {
    borderRadius: '0.5rem',
    transition: 'all 0.15s ease-in-out',
    ...variantStyles[variant],
  };

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        padding: paddingStyles[padding],
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = hoverStyles[variant];
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div 
      className={className}
      style={{
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1rem',
        marginBottom: '1rem'
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 
      className={className}
      style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#111827'
      }}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div 
      className={className}
      style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '1rem',
        marginTop: '1rem'
      }}
    >
      {children}
    </div>
  );
}