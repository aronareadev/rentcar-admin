'use client';

import { useState } from 'react';
import { CalendarFilter, LocationStats, ReservationStatus } from '@/src/types/reservation';
import { Card } from '@/src/components/ui';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CalendarFiltersProps {
  filters: CalendarFilter;
  onFiltersChange: (filters: CalendarFilter) => void;
  locationStats: LocationStats[];
  loading: boolean;
}

export function CalendarFilters({
  filters,
  onFiltersChange,
  locationStats,
  loading
}: CalendarFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'pending', label: '승인 대기', color: '#f59e0b' },
    { value: 'confirmed', label: '예약 확정', color: '#3b82f6' },
    { value: 'active', label: '대여중', color: '#10b981' },
    { value: 'completed', label: '반납 완료', color: '#6b7280' },
    { value: 'cancelled', label: '취소됨', color: '#ef4444' }
  ];

  const handleStatusToggle = (status: ReservationStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleLocationChange = (locationId: string) => {
    onFiltersChange({ 
      ...filters, 
      location_id: locationId === 'all' ? undefined : locationId 
    });
  };

  const handleVehicleChange = (vehicleId: string) => {
    onFiltersChange({ 
      ...filters, 
      vehicle_id: vehicleId === 'all' ? undefined : vehicleId 
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      view_type: filters.view_type,
      status: ['pending', 'confirmed', 'active']
    });
  };

  const activeFilterCount = [
    filters.location_id ? 1 : 0,
    filters.vehicle_id ? 1 : 0,
    (filters.status?.length !== 3) ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div>
      <Card variant="bordered" padding="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* 필터 헤더 - 컴팩트 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0 
            }}>
              🔍 필터
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                disabled={loading}
              >
                고급
                {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <button
                onClick={resetFilters}
                style={{
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                disabled={loading}
              >
                초기화
              </button>
            </div>
          </div>

          {/* 상태 필터 칩들 - 2줄로 배치 */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {statusOptions.map((option) => {
                const isSelected = filters.status?.includes(option.value as ReservationStatus);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value as ReservationStatus)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: isSelected ? option.color : '#e5e7eb',
                      backgroundColor: isSelected ? `${option.color}20` : '#f9fafb',
                      color: isSelected ? option.color : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                    disabled={loading}
                  >
                    <span 
                      style={{
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        backgroundColor: option.color,
                        marginRight: '0.25rem'
                      }}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 활성 필터 표시 - 컴팩트 */}
          {activeFilterCount > 0 && (
            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.05)',
              border: '1px solid rgba(30, 41, 59, 0.1)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {activeFilterCount}개 적용
              </span>
              <div style={{ display: 'flex', gap: '0.125rem' }}>
                {filters.location_id && (
                  <span style={{
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '0.125rem 0.25rem',
                    borderRadius: '0.125rem',
                    fontSize: '0.625rem'
                  }}>
                    지점
                  </span>
                )}
                {filters.vehicle_id && (
                  <span style={{
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '0.125rem 0.25rem',
                    borderRadius: '0.125rem',
                    fontSize: '0.625rem'
                  }}>
                    차량
                  </span>
                )}
                {(filters.status?.length !== 3) && (
                  <span style={{
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '0.125rem 0.25rem',
                    borderRadius: '0.125rem',
                    fontSize: '0.625rem'
                  }}>
                    상태
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 고급 필터 (접기/펼치기) */}
          {showAdvanced && (
            <div 
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {/* 지점 선택 */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.375rem'
                  }}>
                    지점별 필터
                  </label>
                  <select
                    value={filters.location_id || 'all'}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">전체 지점</option>
                    {locationStats.map((location) => (
                      <option key={location.location_id} value={location.location_id}>
                        {location.location_name} ({location.total_reservations}건)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 차량별 필터 (향후 구현) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.375rem'
                  }}>
                    차량별 필터
                  </label>
                  <select
                    value={filters.vehicle_id || 'all'}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">전체 차량</option>
                    {/* 차량 목록은 선택된 지점에 따라 동적으로 로드 */}
                  </select>
                </div>
              </div>

              {/* 필터 통계 - 컴팩트 */}
              {filters.location_id && (
                <div style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgb(30, 64, 175)',
                    marginBottom: '0.5rem'
                  }}>
                    📍 선택된 지점
                  </h4>
                  {(() => {
                    const selectedLocation = locationStats.find(l => l.location_id === filters.location_id);
                    if (selectedLocation) {
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748b' }}>예약:</span>
                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{selectedLocation.total_reservations}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748b' }}>활성:</span>
                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{selectedLocation.active_reservations}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748b' }}>대기:</span>
                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{selectedLocation.pending_reservations}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748b' }}>차량:</span>
                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{selectedLocation.available_vehicles}/{selectedLocation.total_vehicles}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
