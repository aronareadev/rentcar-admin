'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/src/components/admin';
import { 
  getReservationsByDateRange, 
  getLocationStats,
  updateReservationDates,
  checkReservationConflicts,
  getReservationById
} from '@/src/lib/reservationService';
import { 
  CalendarReservation, 
  CalendarFilter, 
  LocationStats,
  AdminReservation
} from '@/src/types/reservation';
import { CalendarView, CalendarFilters, CalendarLegend, ReservationDetailModal, SimpleCalendarTest } from '@/src/components/calendar';
import { Loading } from '@/src/components/ui';

interface CalendarPageState {
  events: CalendarReservation[];
  loading: boolean;
  error: string | null;
  locationStats: LocationStats[];
  selectedReservation: AdminReservation | null;
  showDetailModal: boolean;
}

export default function CalendarPage() {
  const [state, setState] = useState<CalendarPageState>({
    events: [],
    loading: true,
    error: null,
    locationStats: [],
    selectedReservation: null,
    showDetailModal: false
  });

  const [filters, setFilters] = useState<CalendarFilter>({
    view_type: 'dayGridMonth',
    status: ['pending', 'confirmed', 'active']
  });

  const [currentDateRange, setCurrentDateRange] = useState({
    start: '',
    end: ''
  });

  // 데이터 로딩
  const loadData = async (startDate: string, endDate: string) => {
    console.log('캘린더 데이터 로딩 시작:', { startDate, endDate, filters });
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 실제 API 호출
      const [eventsData, locationData] = await Promise.all([
        getReservationsByDateRange(startDate, endDate, {
          location_id: filters.location_id,
          status: filters.status,
          vehicle_id: filters.vehicle_id
        }),
        getLocationStats()
      ]);

      console.log('캘린더 데이터 로딩 완료:', { 
        eventsCount: eventsData.length, 
        locationsCount: locationData.length,
        events: eventsData.slice(0, 2) // 첫 2개만 로그 출력
      });

      setState(prev => ({
        ...prev,
        events: eventsData,
        locationStats: locationData,
        loading: false
      }));
    } catch (error) {
      console.error('캘린더 데이터 로딩 오류:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '데이터 로딩에 실패했습니다.',
        loading: false
      }));
    }
  };

  // 초기 데이터 로딩 및 필터 변경 시 데이터 재로딩
  useEffect(() => {
    // 초기 로딩 시 기본 날짜 범위 설정 (8월 2025로 설정 - 예약 데이터가 있는 달)
    if (!currentDateRange.start || !currentDateRange.end) {
      const startOfMonth = new Date(2025, 7, 1); // 2025년 8월 1일
      const endOfMonth = new Date(2025, 8, 0);   // 2025년 8월 마지막 날
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      setCurrentDateRange({ start: startDate, end: endDate });
      loadData(startDate, endDate);
    } else {
      // 필터 변경 시 기존 날짜 범위로 재로딩
      loadData(currentDateRange.start, currentDateRange.end);
    }
  }, [filters.location_id, filters.status, filters.vehicle_id]);

  // 예약 이벤트 클릭 핸들러
  const handleEventClick = async (eventId: string) => {
    try {
      const reservation = await getReservationById(eventId);
      if (reservation) {
        setState(prev => ({
          ...prev,
          selectedReservation: reservation,
          showDetailModal: true
        }));
      }
    } catch (error) {
      console.error('예약 상세 조회 오류:', error);
    }
  };

  // 예약 드래그 앤 드롭 핸들러
  const handleEventDrop = async (
    eventId: string,
    newStart: string,
    newEnd: string,
    revert: () => void
  ) => {
    try {
      // 먼저 해당 예약 정보 가져오기
      const reservation = await getReservationById(eventId);
      if (!reservation) {
        revert();
        return;
      }

      // 충돌 검사
      const hasConflict = await checkReservationConflicts(
        reservation.vehicle_id,
        newStart.split('T')[0],
        newEnd.split('T')[0],
        eventId
      );

      if (hasConflict) {
        alert('해당 기간에 동일한 차량의 다른 예약이 있습니다.');
        revert();
        return;
      }

      // 날짜 업데이트
      await updateReservationDates(eventId, newStart, newEnd);
      
      // 성공 메시지
      alert('예약 날짜가 성공적으로 변경되었습니다.');
      
      // 데이터 새로고침
      if (currentDateRange.start && currentDateRange.end) {
        loadData(currentDateRange.start, currentDateRange.end);
      }
    } catch (error) {
      console.error('예약 날짜 변경 오류:', error);
      alert(error instanceof Error ? error.message : '예약 날짜 변경에 실패했습니다.');
      revert();
    }
  };

  // 모달 닫기
  const handleModalClose = () => {
    setState(prev => ({
      ...prev,
      selectedReservation: null,
      showDetailModal: false
    }));
  };

  if (state.loading && !state.events.length) {
    return (
      <PageLayout 
        title="예약 캘린더" 
        description="예약 일정을 한눈에 확인하고 관리하세요"
      >
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="예약 캘린더" 
      description="예약 일정을 한눈에 확인하고 관리하세요"
    >
      {/* 에러 메시지 */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
              <p className="mt-1 text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 메인 레이아웃: 캘린더(왼쪽) + 사이드바(오른쪽) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) 280px', // 캘린더 영역 + 고정 사이드바 너비
          gap: '1.5rem',
          minHeight: '600px'
        }}
        className="calendar-layout"
      >
        
        {/* 왼쪽: 캘린더 메인 영역 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          minHeight: '600px'
        }}>
          <CalendarView
            events={state.events}
            viewType={filters.view_type || 'dayGridMonth'}
            onViewTypeChange={(viewType) => setFilters(prev => ({ ...prev, view_type: viewType }))}
            onDateRangeChange={(start, end) => {
              setCurrentDateRange({ start, end });
              loadData(start, end);
            }}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            loading={state.loading}
          />
        </div>

        {/* 오른쪽: 사이드바 (필터 + 범례) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          height: 'fit-content',
          position: 'sticky',
          top: '2rem'
        }}>
          {/* 필터 섹션 */}
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
            locationStats={state.locationStats}
            loading={state.loading}
          />
          
          {/* 범례 및 정보 섹션 */}
          <CalendarLegend />
        </div>
      </div>

        {/* 예약 상세 모달 */}
        {state.selectedReservation && (
          <ReservationDetailModal
            isOpen={state.showDetailModal}
            onClose={handleModalClose}
            reservation={state.selectedReservation}
            onUpdate={() => {
              // 예약 업데이트 후 캘린더 새로고침
              if (currentDateRange.start && currentDateRange.end) {
                loadData(currentDateRange.start, currentDateRange.end);
              }
            }}
          />
        )}

      {/* 반응형 CSS */}
      <style jsx>{`
        .calendar-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 1.5rem;
          min-height: 600px;
        }
        
        @media (max-width: 1024px) {
          .calendar-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .calendar-layout {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>
    </PageLayout>
  );
}
