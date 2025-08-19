export interface AdminReservation {
  id: string;
  reservation_number: string;
  vehicle_id: string;
  customer_id?: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  pickup_location_id: string;
  return_location_id: string;
  status: ReservationStatus;
  total_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  
  // 인수/반납 관련 필드 (향후 확장용 - 현재는 admin_notes에 통합 저장)
  actual_pickup_time?: string;
  pickup_notes?: string;
  start_mileage?: number;
  actual_return_time?: string;
  return_notes?: string;
  return_condition?: string;
  return_mileage?: number;
  
  created_at: string;
  updated_at: string;
  
  // 관계형 데이터
  vehicles?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    daily_rate: number;
    vehicle_number: string;
    vehicle_brands?: { name: string };
    vehicle_categories?: { name: string };
    vehicle_locations?: { name: string; address: string };
  };
  pickup_location?: {
    id: string;
    name: string;
    address: string;
  };
  return_location?: {
    id: string;
    name: string;
    address: string;
  };
}

export type ReservationStatus = 
  | 'pending'     // 예약 신청 (대기중)
  | 'confirmed'   // 예약 확정 (승인됨)
  | 'active'      // 대여중
  | 'completed'   // 반납 완료
  | 'cancelled';  // 취소됨

export type PaymentStatus = 
  | 'pending'     // 결제 대기
  | 'paid'        // 결제 완료
  | 'refunded';   // 환불 완료

export interface ReservationFilter {
  status?: ReservationStatus[];
  payment_status?: PaymentStatus[];
  start_date?: string;
  end_date?: string;
  search?: string; // 고객명, 이메일, 예약번호 검색
  vehicle_id?: string;
  sort_by?: 'created_at' | 'start_date' | 'total_amount' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReservationStats {
  total_reservations: number;
  pending_count: number;
  confirmed_count: number;
  active_count: number;
  completed_count: number;
  cancelled_count: number;
  total_revenue: number;
  today_reservations: number;
  this_week_reservations: number;
  this_month_reservations: number;
}

// 지점별 통계
export interface LocationStats {
  location_id: string;
  location_name: string;
  location_address: string;
  total_reservations: number;
  active_reservations: number;
  pending_reservations: number;
  total_revenue: number;
  available_vehicles: number;
  total_vehicles: number;
}

// 지점별 필터
export interface LocationFilter {
  location_id?: string;
  location_name?: string;
}

export interface PaginatedReservations {
  data: AdminReservation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ReservationUpdateData {
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  total_amount?: number;
  notes?: string;
  admin_notes?: string;
  status?: ReservationStatus;
  payment_status?: PaymentStatus;
}

export interface ApprovalData {
  approved_by: string;
  admin_notes?: string;
}

// 캘린더 뷰용 데이터 (FullCalendar 호환)
export interface CalendarReservation {
  id: string;
  title: string; // 고객명
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  status: ReservationStatus;
  vehicle_info: string;
  customer_info: string;
  total_amount: number;
  // FullCalendar 스타일링
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  // 추가 데이터 (extendedProps)
  extendedProps?: {
    reservation_number: string;
    vehicle_number?: string;
    pickup_location?: string;
    return_location?: string;
    total_amount: number;
    status: ReservationStatus;
  };
}

// 캘린더 필터 옵션
export interface CalendarFilter {
  location_id?: string;
  status?: ReservationStatus[];
  vehicle_id?: string;
  view_type?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth';
}

// 대시보드용 최근 예약
export interface RecentReservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  vehicle_brand: string;
  vehicle_model: string;
  start_date: string;
  status: ReservationStatus;
  total_amount: number;
  created_at: string;
}
