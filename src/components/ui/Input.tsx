import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Input({
  error,
  label,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontFamily: "'WantedSans', system-ui, -apple-system, sans-serif",
    lineHeight: '1.5',
    color: '#374151',
    backgroundColor: '#ffffff',
    backgroundImage: 'none',
    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.15s ease-in-out',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.5 : 1,
  };

  const focusStyle = {
    outline: 'none',
    borderColor: error ? '#ef4444' : '#6b7280',
    boxShadow: error 
      ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
      : '0 0 0 3px rgba(107, 114, 128, 0.1)',
  };

  const leftIconStyle = {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: '#9ca3af',
  };

  const rightIconStyle = {
    position: 'absolute' as const,
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: '#9ca3af',
  };

  return (
    <div className="relative">
      {label && (
        <label 
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ marginBottom: '0.5rem' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div style={leftIconStyle}>
            {leftIcon}
          </div>
        )}
        <input
          className={className}
          style={{
            ...baseStyle,
            paddingLeft: leftIcon ? '2.5rem' : '1rem',
            paddingRight: rightIcon ? '2.5rem' : '1rem',
          }}
          onFocus={(e) => {
            Object.assign(e.target.style, focusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div style={rightIconStyle}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p 
          className="mt-1 text-sm text-red-600"
          style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#ef4444' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
