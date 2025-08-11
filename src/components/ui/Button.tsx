import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: {
      backgroundColor: '#1e293b',
      color: 'white',
      border: '1px solid #1e293b',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    secondary: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '1px solid transparent'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1e293b',
      border: '1px solid #1e293b'
    },
    minimal: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '1px solid transparent',
      padding: '0.25rem 0.5rem'
    }
  };

  const hoverStyles = {
    primary: {
      backgroundColor: '#334155',
      borderColor: '#334155'
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      borderColor: '#d1d5db'
    },
    ghost: {
      backgroundColor: '#f9fafb'
    },
    outline: {
      backgroundColor: '#f1f5f9',
      borderColor: '#334155'
    },
    minimal: {
      backgroundColor: '#f3f4f6'
    }
  };

  const sizeStyles = {
    sm: {
      padding: variant === 'minimal' ? '0.25rem 0.5rem' : '0.5rem 0.875rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    md: {
      padding: variant === 'minimal' ? '0.375rem 0.75rem' : '0.625rem 1.125rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    lg: {
      padding: variant === 'minimal' ? '0.5rem 1rem' : '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500'
    }
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    fontFamily: "'WantedSans', system-ui, -apple-system, sans-serif",
    transition: 'all 0.15s ease-in-out',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '-0.025em',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? hoverStyles[variant] : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={className}
      style={baseStyle}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '0.5rem'
            }}
          />
          처리중...
        </div>
      ) : (
        <>
          {leftIcon && <span style={{ marginRight: '0.5rem' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ marginLeft: '0.5rem' }}>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}