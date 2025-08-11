'use client';

import { ReactNode } from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'car';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export function Loading({ 
  variant = 'car', 
  size = 'md', 
  text = '로딩 중...', 
  className = '',
  overlay = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: { container: 'w-4 h-4', text: 'text-sm' },
    md: { container: 'w-8 h-8', text: 'text-base' },
    lg: { container: 'w-12 h-12', text: 'text-lg' }
  };

  const containerStyle = overlay ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  } : {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem'
  };

  const cardStyle = overlay ? {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem'
  } : {};

  const renderSpinner = () => (
    <div style={{
      width: size === 'sm' ? '2rem' : size === 'md' ? '3rem' : '4rem',
      height: size === 'sm' ? '2rem' : size === 'md' ? '3rem' : '4rem',
      border: '3px solid #e2e8f0',
      borderTop: '3px solid rgb(30, 64, 175)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );

  const renderDots = () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size === 'sm' ? '0.5rem' : size === 'md' ? '0.75rem' : '1rem',
            height: size === 'sm' ? '0.5rem' : size === 'md' ? '0.75rem' : '1rem',
            backgroundColor: 'rgb(30, 64, 175)',
            borderRadius: '50%',
            animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div style={{
      width: size === 'sm' ? '2rem' : size === 'md' ? '3rem' : '4rem',
      height: size === 'sm' ? '2rem' : size === 'md' ? '3rem' : '4rem',
      backgroundColor: 'rgb(30, 64, 175)',
      borderRadius: '50%',
      animation: 'pulse 2s ease-in-out infinite'
    }} />
  );

  const renderCar = () => (
    <div style={{
      position: 'relative',
      width: size === 'sm' ? '4.5rem' : size === 'md' ? '6rem' : '8rem',
      height: size === 'sm' ? '2.5rem' : size === 'md' ? '3.5rem' : '4.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 도로 배경 */}
      <div style={{
        position: 'absolute',
        bottom: size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : '1.25rem',
        left: '0',
        right: '0',
        height: '4px',
        background: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        {/* 도로 점선 애니메이션 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '1px',
          background: 'repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 8px, transparent 8px, transparent 16px)',
          transform: 'translateY(-50%)',
          animation: 'roadMove 1s linear infinite'
        }} />
      </div>
      
      {/* 차량 그림자 */}
      <div style={{
        position: 'absolute',
        bottom: size === 'sm' ? '0.5rem' : size === 'md' ? '0.75rem' : '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: size === 'sm' ? '2.25rem' : size === 'md' ? '3rem' : '3.75rem',
        height: '6px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        animation: 'shadowMove 2s ease-in-out infinite'
      }} />
      
      {/* 차량 본체 */}
      <div style={{
        position: 'absolute',
        bottom: size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: size === 'sm' ? '2.25rem' : size === 'md' ? '3rem' : '3.75rem',
        height: size === 'sm' ? '1.25rem' : size === 'md' ? '1.75rem' : '2.25rem',
        backgroundColor: 'rgb(30, 64, 175)',
        borderRadius: '0.375rem 0.375rem 0.25rem 0.25rem',
        animation: 'carBounce 2s ease-in-out infinite',
        boxShadow: '0 2px 8px rgba(30, 64, 175, 0.3)',
        overflow: 'hidden'
      }}>
        {/* 차량 하이라이트 */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          right: '50%',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '0.125rem',
          animation: 'shine 2s ease-in-out infinite'
        }} />
        
        {/* 차량 창문 */}
        <div style={{
          position: 'absolute',
          top: '3px',
          left: '4px',
          right: '4px',
          height: '45%',
          backgroundColor: 'rgba(96, 165, 250, 0.8)',
          borderRadius: '0.25rem 0.25rem 0 0',
          border: '1px solid rgba(30, 64, 175, 0.3)'
        }} />
        
        {/* 차량 전조등 */}
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '2px',
          width: '3px',
          height: '3px',
          backgroundColor: '#fbbf24',
          borderRadius: '50%',
          animation: 'blink 2s ease-in-out infinite'
        }} />
        
        {/* 바퀴 */}
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          left: size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px',
          width: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
          height: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
          backgroundColor: '#1f2937',
          borderRadius: '50%',
          border: '1px solid #374151',
          animation: 'wheelSpin 0.6s linear infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            height: '40%',
            backgroundColor: '#6b7280',
            borderRadius: '50%'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          right: size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px',
          width: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
          height: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
          backgroundColor: '#1f2937',
          borderRadius: '50%',
          border: '1px solid #374151',
          animation: 'wheelSpin 0.6s linear infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            height: '40%',
            backgroundColor: '#6b7280',
            borderRadius: '50%'
          }} />
        </div>
      </div>

      {/* 배기가스 파티클 */}
      <div style={{
        position: 'absolute',
        bottom: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : '1.75rem',
        left: size === 'sm' ? '0.25rem' : size === 'md' ? '0.5rem' : '0.75rem',
        width: '4px',
        height: '4px',
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderRadius: '50%',
        animation: 'exhaust1 1.5s ease-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : '1.75rem',
        left: size === 'sm' ? '0.25rem' : size === 'md' ? '0.5rem' : '0.75rem',
        width: '3px',
        height: '3px',
        backgroundColor: 'rgba(156, 163, 175, 0.4)',
        borderRadius: '50%',
        animation: 'exhaust2 1.8s ease-out infinite 0.3s'
      }} />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'car': return renderCar();
      default: return renderSpinner();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        
        @keyframes carBounce {
          0%, 100% { 
            transform: translateX(-50%) translateY(0px); 
          }
          25% { 
            transform: translateX(-50%) translateY(-2px); 
          }
          50% { 
            transform: translateX(-50%) translateY(0px); 
          }
          75% { 
            transform: translateX(-50%) translateY(-1px); 
          }
        }
        
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes roadMove {
          from { transform: translateX(0px); }
          to { transform: translateX(-16px); }
        }
        
        @keyframes shadowMove {
          0%, 100% { 
            transform: translateX(-50%) scale(1); 
            opacity: 0.1; 
          }
          25% { 
            transform: translateX(-50%) scale(0.9); 
            opacity: 0.15; 
          }
          50% { 
            transform: translateX(-50%) scale(1); 
            opacity: 0.1; 
          }
          75% { 
            transform: translateX(-50%) scale(0.95); 
            opacity: 0.12; 
          }
        }
        
        @keyframes shine {
          0%, 100% { 
            opacity: 0.4; 
            transform: translateX(0px); 
          }
          50% { 
            opacity: 0.8; 
            transform: translateX(5px); 
          }
        }
        
        @keyframes blink {
          0%, 80%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 2px #fbbf24; 
          }
          90% { 
            opacity: 0.3; 
            box-shadow: 0 0 0px #fbbf24; 
          }
        }
        
        @keyframes exhaust1 {
          0% { 
            transform: translateX(0px) translateY(0px) scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateX(-8px) translateY(-4px) scale(1.2); 
            opacity: 0.3; 
          }
          100% { 
            transform: translateX(-16px) translateY(-8px) scale(1.5); 
            opacity: 0; 
          }
        }
        
        @keyframes exhaust2 {
          0% { 
            transform: translateX(0px) translateY(0px) scale(1); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateX(-10px) translateY(-6px) scale(1.3); 
            opacity: 0.2; 
          }
          100% { 
            transform: translateX(-20px) translateY(-12px) scale(1.8); 
            opacity: 0; 
          }
        }
      `}</style>
      
      <div style={containerStyle} className={className}>
        {overlay && <div style={cardStyle}>
          {renderLoader()}
          {text && (
            <p style={{
              margin: 0,
              fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : '1.125rem',
              fontWeight: '500',
              color: 'rgb(30, 64, 175)',
              textAlign: 'center'
            }}>
              {text}
            </p>
          )}
        </div>}
        
        {!overlay && (
          <>
            {renderLoader()}
            {text && (
              <p style={{
                margin: 0,
                fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : '1.125rem',
                fontWeight: '500',
                color: 'rgb(30, 64, 175)',
                textAlign: 'center'
              }}>
                {text}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

// 특정 용도별 로딩 컴포넌트들
export function PageLoading({ text = '페이지를 불러오는 중...' }) {
  return <Loading variant="car" size="lg" text={text} />;
}

export function ButtonLoading({ text = '처리 중...' }) {
  return <Loading variant="car" size="sm" text={text} />;
}

export function OverlayLoading({ text = '잠시만 기다려주세요...' }) {
  return <Loading variant="car" size="lg" text={text} overlay />;
}

export function FormLoading({ text = '저장 중...' }) {
  return <Loading variant="car" size="md" text={text} />;
}
