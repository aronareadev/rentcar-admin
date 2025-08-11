'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageLayout({ title, description, children, actions }: PageLayoutProps) {
  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* 페이지 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontFamily: "'WantedSans', system-ui, -apple-system, sans-serif",
            fontWeight: '600', 
            color: '#0f172a',
            margin: 0,
            marginBottom: description ? '0.5rem' : 0
          }}>{title}</h1>
          {description && (
            <p style={{ 
              color: '#64748b',
              margin: 0,
              fontSize: '1rem',
              fontFamily: "'WantedSans', system-ui, -apple-system, sans-serif"
            }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions}
          </div>
        )}
      </div>

      {/* 페이지 컨텐츠 */}
      <div style={{ maxWidth: '100rem', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}
