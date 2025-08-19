'use client';

import { Card } from '@/src/components/ui';

export function CalendarLegend() {
  const legendItems = [
    {
      status: 'pending',
      label: '승인 대기',
      color: '#f59e0b',
      description: '관리자 승인이 필요한 예약'
    },
    {
      status: 'confirmed',
      label: '예약 확정',
      color: '#3b82f6',
      description: '승인 완료된 예약'
    },
    {
      status: 'active',
      label: '대여중',
      color: '#10b981',
      description: '현재 대여가 진행중인 예약'
    },
    {
      status: 'completed',
      label: '반납 완료',
      color: '#6b7280',
      description: '반납이 완료된 예약'
    },
    {
      status: 'cancelled',
      label: '취소됨',
      color: '#ef4444',
      description: '취소된 예약'
    }
  ];

  const tips = [
    {
      icon: '🖱️',
      text: '예약을 클릭하여 상세 정보를 확인하세요'
    },
    {
      icon: '⬅️➡️',
      text: '예약을 드래그하여 날짜를 변경할 수 있습니다'
    },
    {
      icon: '📅',
      text: '빈 날짜를 클릭하여 새 예약을 생성하세요'
    },
    {
      icon: '🔍',
      text: '필터를 사용하여 원하는 예약만 표시하세요'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* 범례 - 컴팩트 */}
      <Card variant="bordered" padding="sm">
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0,
          marginBottom: '0.75rem'
        }}>
          📊 예약 상태
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {legendItems.map((item) => (
            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '0.125rem',
                  backgroundColor: item.color,
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#1e293b'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 간단한 가이드 */}
      <Card variant="bordered" padding="sm">
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'rgb(30, 64, 175)',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          💡 사용법
        </h3>
        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
          • 예약 클릭: 상세정보<br/>
          • 드래그: 날짜변경<br/>
          • 필터: 맞춤조회
        </div>
      </Card>

      {/* 통합 정보 */}
      <Card variant="bordered" padding="sm">
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          📈 정보 & 액션
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>예약:</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }} id="calendar-event-count">-</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>기간:</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }} id="calendar-date-range">-</span>
          </div>
        </div>
        
        {/* 빠른 액션을 같은 카드 안에 포함 */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
            {[
              { icon: '📋', text: '오늘예약' },
              { icon: '⚠️', text: '대기목록' },
              { icon: '📊', text: '월간통계' },
              { icon: '🔄', text: '새로고침' }
            ].map((action, index) => (
              <button
                key={index}
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  padding: '0.375rem 0.25rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.125rem',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(30, 64, 175)';
                  e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
