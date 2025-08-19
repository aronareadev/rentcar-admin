'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarReservation } from '@/src/types/reservation';

interface SimpleCalendarTestProps {
  events: CalendarReservation[];
}

export function SimpleCalendarTest({ events }: SimpleCalendarTestProps) {
  console.log('SimpleCalendarTest 렌더링:', { events });

  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h2>캘린더 테스트</h2>
      <p>이벤트 개수: {events.length}</p>
      
      <div style={{ height: '600px', border: '1px solid #ccc' }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView='dayGridMonth'
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          eventClick={(info) => {
            alert(`클릭된 이벤트: ${info.event.title}`);
          }}
        />
      </div>
    </div>
  );
}

