'use client';

import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarReservation } from '@/src/types/reservation';
import { Loading } from '@/src/components/ui';

interface CalendarViewProps {
  events: CalendarReservation[];
  viewType: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth';
  onViewTypeChange: (viewType: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth') => void;
  onDateRangeChange: (start: string, end: string) => void;
  onEventClick: (eventId: string) => void;
  onEventDrop: (eventId: string, newStart: string, newEnd: string, revert: () => void) => void;
  loading: boolean;
}

export function CalendarView({
  events,
  viewType,
  onViewTypeChange,
  onDateRangeChange,
  onEventClick,
  onEventDrop,
  loading
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // 초기 날짜 범위 설정은 상위 컴포넌트에서 처리하므로 제거
  
  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('CalendarView 렌더링:', { 
      eventsCount: events.length, 
      viewType, 
      loading,
      firstEvent: events[0]
    });
  }, [events, viewType, loading]);

  const handleDatesSet = (dateInfo: any) => {
    onDateRangeChange(
      dateInfo.start.toISOString().split('T')[0],
      dateInfo.end.toISOString().split('T')[0]
    );
  };

  const handleEventClick = (clickInfo: any) => {
    onEventClick(clickInfo.event.id);
  };

  const handleEventDrop = (dropInfo: any) => {
    const { event } = dropInfo;
    onEventDrop(
      event.id,
      event.start.toISOString(),
      event.end?.toISOString() || event.start.toISOString(),
      dropInfo.revert
    );
  };

  const getViewButtons = () => {
    return [
      {
        text: '월간',
        value: 'dayGridMonth' as const,
        active: viewType === 'dayGridMonth'
      },
      {
        text: '주간',
        value: 'timeGridWeek' as const,
        active: viewType === 'timeGridWeek'
      },
      {
        text: '일간',
        value: 'timeGridDay' as const,
        active: viewType === 'timeGridDay'
      },
      {
        text: '목록',
        value: 'listMonth' as const,
        active: viewType === 'listMonth'
      }
    ];
  };

  if (loading && events.length === 0) {
    return (
      <div className="h-96 flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* 뷰 컨트롤 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#1e293b',
          margin: 0 
        }}>
          예약 일정
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {getViewButtons().map((button) => (
            <button
              key={button.value}
              onClick={() => onViewTypeChange(button.value)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: button.active ? 'rgb(30, 64, 175)' : '#d1d5db',
                backgroundColor: button.active ? 'rgb(30, 64, 175)' : 'white',
                color: button.active ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!button.active) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (!button.active) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 오버레이 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex justify-center items-center">
            <Loading />
          </div>
        )}

        {/* FullCalendar */}
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '' // 뷰 버튼은 커스텀으로 구현
            }}
            initialView={viewType}
            height="auto"
            locale="ko"
            firstDay={1} // 월요일 시작
            weekNumbers={false}
            dayMaxEvents={3} // 하루에 표시할 최대 이벤트 수
            moreLinkClick="popover"
            events={events}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            datesSet={handleDatesSet}
            editable={true} // 드래그 앤 드롭 활성화
            droppable={false}
            eventResizableFromStart={false}
            eventDurationEditable={true}
            // 시간 설정
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // 모든 요일
              startTime: '09:00',
              endTime: '18:00'
            }}
            // 이벤트 렌더링 커스터마이징
            eventContent={(eventInfo) => {
              const { event } = eventInfo;
              const props = event.extendedProps;
              
              return (
                <div className="p-1 text-xs">
                  <div className="font-medium truncate">{event.title}</div>
                  {props.vehicle_number && (
                    <div className="opacity-90 truncate">{props.vehicle_number}</div>
                  )}
                  {viewType !== 'dayGridMonth' && props.total_amount && (
                    <div className="opacity-80">₩{props.total_amount.toLocaleString()}</div>
                  )}
                </div>
              );
            }}
            // 날짜 클릭 시 새 예약 생성 (향후 구현)
            dateClick={(dateInfo) => {
              // console.log('Date clicked:', dateInfo.dateStr);
              // 새 예약 생성 모달 열기 로직
            }}
            // 시간 슬롯 클릭 시 새 예약 생성 (향후 구현)
            select={(selectInfo) => {
              // console.log('Time slot selected:', selectInfo);
              // 새 예약 생성 모달 열기 로직
            }}
            selectable={true}
            selectMirror={true}
            // 주말 스타일링
            weekendsVisible={true}
            // 툴팁 설정
            eventMouseEnter={(mouseEnterInfo) => {
              const { event, el } = mouseEnterInfo;
              const props = event.extendedProps;
              
              // 간단한 툴팁 구현
              el.title = [
                `예약번호: ${props.reservation_number}`,
                `고객: ${event.title}`,
                `차량: ${props.vehicle_number || ''}`,
                `픽업지점: ${props.pickup_location || ''}`,
                `금액: ₩${props.total_amount?.toLocaleString() || '0'}`,
                `상태: ${getStatusText(props.status)}`
              ].join('\\n');
            }}
          />
        </div>
      </div>

      {/* 캘린더 스타일링 */}
      <style jsx global>{`
        .calendar-container .fc {
          font-family: inherit;
        }
        
        .calendar-container .fc-button {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #374151;
          font-weight: 500;
        }
        
        .calendar-container .fc-button:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        
        .calendar-container .fc-button-primary:not(:disabled).fc-button-active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .calendar-container .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }
        
        .calendar-container .fc-daygrid-event {
          border-radius: 4px;
          border: none;
          padding: 2px 4px;
          margin: 1px 0;
        }
        
        .calendar-container .fc-timegrid-event {
          border-radius: 4px;
          border: none;
        }
        
        .calendar-container .fc-list-event {
          border-radius: 4px;
        }
        
        .calendar-container .fc-day-today {
          background-color: #fef3cd !important;
        }
        
        .calendar-container .fc-event:hover {
          filter: brightness(0.9);
          cursor: pointer;
        }
        
        .calendar-container .fc-col-header-cell {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .calendar-container .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
        }
        
        .calendar-container .fc-more-link {
          color: #6366f1;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '승인 대기';
    case 'confirmed': return '예약 확정';
    case 'active': return '대여중';
    case 'completed': return '반납 완료';
    case 'cancelled': return '취소됨';
    default: return status;
  }
}
