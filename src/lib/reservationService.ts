'use client';

import { supabase } from './supabase';
import { 
  AdminReservation, 
  ReservationFilter, 
  ReservationStats,
  LocationStats,
  PaginatedReservations,
  ReservationUpdateData,
  ApprovalData,
  CalendarReservation,
  RecentReservation,
  ReservationStatus
} from '@/src/types/reservation';

/**
 * 모든 예약 조회 (필터링, 페이징 지원)
 */
export const getAllReservations = async (filter: ReservationFilter = {}): Promise<PaginatedReservations> => {
  try {
    const {
      status = [],
      payment_status = [],
      start_date,
      end_date,
      search,
      vehicle_id,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 20
    } = filter;

    let query = supabase
      .from('reservations')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        ),
        pickup_location:vehicle_locations!pickup_location_id (id, name, address),
        return_location:vehicle_locations!return_location_id (id, name, address)
      `);

    // 상태 필터
    if (status.length > 0) {
      query = query.in('status', status);
    }

    // 결제 상태 필터
    if (payment_status.length > 0) {
      query = query.in('payment_status', payment_status);
    }

    // 날짜 범위 필터
    if (start_date) {
      query = query.gte('start_date', start_date);
    }
    if (end_date) {
      query = query.lte('end_date', end_date);
    }

    // 차량 필터
    if (vehicle_id) {
      query = query.eq('vehicle_id', vehicle_id);
    }

    // 검색 (고객명, 이메일, 예약번호)
    if (search) {
      query = query.or(`guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,reservation_number.ilike.%${search}%`);
    }

    // 정렬
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // 총 개수 조회 (페이징용)
    const { count } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true });

    // 페이징 적용
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error('예약 조회 오류:', error);
      throw new Error('예약 목록 조회에 실패했습니다.');
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('예약 서비스 오류:', error);
    throw error;
  }
};

/**
 * 대기중인 예약만 조회
 */
export const getPendingReservations = async (): Promise<AdminReservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }); // 오래된 순서대로

    if (error) {
      console.error('대기 예약 조회 오류:', error);
      throw new Error('대기중인 예약 조회에 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('대기 예약 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 승인
 */
export const approveReservation = async (
  reservationId: string, 
  approvalData: ApprovalData
): Promise<AdminReservation> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        approved_by: approvalData.approved_by,
        approved_at: new Date().toISOString(),
        admin_notes: approvalData.admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        )
      `)
      .single();

    if (error) {
      console.error('예약 승인 오류:', error);
      throw new Error('예약 승인에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('예약 승인 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 거부
 */
export const rejectReservation = async (
  reservationId: string, 
  approvalData: ApprovalData
): Promise<AdminReservation> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        approved_by: approvalData.approved_by,
        approved_at: new Date().toISOString(),
        admin_notes: approvalData.admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        )
      `)
      .single();

    if (error) {
      console.error('예약 거부 오류:', error);
      throw new Error('예약 거부에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('예약 거부 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 정보 수정
 */
export const updateReservation = async (
  reservationId: string,
  updateData: ReservationUpdateData
): Promise<AdminReservation> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        )
      `)
      .single();

    if (error) {
      console.error('예약 수정 오류:', error);
      throw new Error('예약 정보 수정에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('예약 수정 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 상세 조회
 */
export const getReservationById = async (reservationId: string): Promise<AdminReservation | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        )
      `)
      .eq('id', reservationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 예약을 찾을 수 없음
      }
      console.error('예약 조회 오류:', error);
      throw new Error('예약 조회에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('예약 조회 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 통계 조회
 */
export const getReservationStats = async (): Promise<ReservationStats> => {
  try {
    // 전체 예약 통계
    const { data: allReservations, error: allError } = await supabase
      .from('reservations')
      .select('status, total_amount, created_at');

    if (allError) {
      console.error('통계 조회 오류:', allError);
      throw new Error('예약 통계 조회에 실패했습니다.');
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);

    // 통계 계산
    const stats = allReservations?.reduce((acc, reservation) => {
      const createdAt = new Date(reservation.created_at);
      
      // 상태별 카운트
      acc[`${reservation.status}_count`] = (acc[`${reservation.status}_count`] || 0) + 1;
      
      // 매출 계산 (확정된 예약만)
      if (reservation.status === 'confirmed' || reservation.status === 'completed') {
        acc.total_revenue += reservation.total_amount || 0;
      }
      
      // 기간별 예약 수
      if (createdAt.toISOString().split('T')[0] === todayStr) {
        acc.today_reservations++;
      }
      if (createdAt >= weekAgo) {
        acc.this_week_reservations++;
      }
      if (createdAt >= monthAgo) {
        acc.this_month_reservations++;
      }
      
      return acc;
    }, {
      total_reservations: allReservations?.length || 0,
      pending_count: 0,
      confirmed_count: 0,
      active_count: 0,
      completed_count: 0,
      cancelled_count: 0,
      total_revenue: 0,
      today_reservations: 0,
      this_week_reservations: 0,
      this_month_reservations: 0
    });

    return stats;
  } catch (error) {
    console.error('예약 통계 서비스 오류:', error);
    throw error;
  }
};

/**
 * 날짜별 예약 조회 (캘린더용)
 */
export const getReservationsByDateRange = async (
  startDate: string,
  endDate: string,
  filters?: {
    location_id?: string;
    status?: ReservationStatus[];
    vehicle_id?: string;
  }
): Promise<CalendarReservation[]> => {
  try {
    let query = supabase
      .from('reservations')
      .select(`
        id,
        reservation_number,
        guest_name,
        start_date,
        end_date,
        start_time,
        end_time,
        status,
        total_amount,
        pickup_location_id,
        return_location_id,
        vehicles (
          id,
          brand,
          model,
          vehicle_number,
          location_id,
          vehicle_brands (name)
        ),
        pickup_location:vehicle_locations!pickup_location_id (name),
        return_location:vehicle_locations!return_location_id (name)
      `)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .in('status', ['pending', 'confirmed', 'active']);

    // 지점 필터
    if (filters?.location_id) {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('location_id', filters.location_id);
      
      if (vehicles && vehicles.length > 0) {
        const vehicleIds = vehicles.map(v => v.id);
        query = query.in('vehicle_id', vehicleIds);
      } else {
        return []; // 해당 지점에 차량이 없으면 빈 배열 반환
      }
    }

    // 차량 필터
    if (filters?.vehicle_id) {
      query = query.eq('vehicle_id', filters.vehicle_id);
    }

    // 상태 필터
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('캘린더 예약 조회 오류:', error);
      throw new Error('캘린더 예약 조회에 실패했습니다.');
    }

    // FullCalendar 형태로 데이터 변환
    return (data || []).map(reservation => ({
      id: reservation.id,
      title: `${reservation.guest_name}`,
      start: `${reservation.start_date}T${reservation.start_time || '09:00'}`,
      end: `${reservation.end_date}T${reservation.end_time || '18:00'}`,
      status: reservation.status,
      vehicle_info: `${reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand || ''} ${reservation.vehicles?.model || ''}`,
      customer_info: reservation.guest_name,
      total_amount: reservation.total_amount,
      // FullCalendar 추가 속성
      extendedProps: {
        reservation_number: reservation.reservation_number,
        vehicle_number: reservation.vehicles?.vehicle_number,
        pickup_location: reservation.pickup_location?.name,
        return_location: reservation.return_location?.name,
        total_amount: reservation.total_amount,
        status: reservation.status
      },
      // 상태별 색상
      backgroundColor: getReservationColor(reservation.status),
      borderColor: getReservationColor(reservation.status),
      textColor: '#ffffff'
    }));
  } catch (error) {
    console.error('캘린더 예약 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 상태별 색상 반환
 */
const getReservationColor = (status: ReservationStatus): string => {
  switch (status) {
    case 'pending':
      return '#f59e0b'; // 노란색 (대기)
    case 'confirmed':
      return '#3b82f6'; // 파란색 (확정)
    case 'active':
      return '#10b981'; // 초록색 (대여중)
    case 'completed':
      return '#6b7280'; // 회색 (완료)
    case 'cancelled':
      return '#ef4444'; // 빨간색 (취소)
    default:
      return '#6b7280';
  }
};

/**
 * 예약 날짜/시간 수정 (드래그 앤 드롭용)
 */
export const updateReservationDates = async (
  reservationId: string,
  newStart: string,
  newEnd: string
): Promise<AdminReservation> => {
  try {
    const startDate = newStart.split('T')[0];
    const endDate = newEnd.split('T')[0];
    const startTime = newStart.includes('T') ? newStart.split('T')[1].substring(0, 5) : '09:00';
    const endTime = newEnd.includes('T') ? newEnd.split('T')[1].substring(0, 5) : '18:00';

    const { data, error } = await supabase
      .from('reservations')
      .update({
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        ),
        pickup_location:vehicle_locations!pickup_location_id (id, name, address),
        return_location:vehicle_locations!return_location_id (id, name, address)
      `)
      .single();

    if (error) {
      console.error('예약 날짜 수정 오류:', error);
      throw new Error('예약 날짜 수정에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('예약 날짜 수정 서비스 오류:', error);
    throw error;
  }
};

/**
 * 차량 예약 충돌 검사
 */
export const checkReservationConflicts = async (
  vehicleId: string,
  startDate: string,
  endDate: string,
  excludeReservationId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('reservations')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .in('status', ['confirmed', 'active'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`); // 기간 겹치는지 확인

    // 특정 예약 제외 (수정 시)
    if (excludeReservationId) {
      query = query.neq('id', excludeReservationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('예약 충돌 검사 오류:', error);
      throw new Error('예약 충돌 검사에 실패했습니다.');
    }

    return (data || []).length > 0; // 충돌이 있으면 true
  } catch (error) {
    console.error('예약 충돌 검사 서비스 오류:', error);
    throw error;
  }
};

/**
 * 최근 예약 조회 (대시보드용)
 */
export const getRecentReservations = async (limit: number = 10): Promise<RecentReservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        reservation_number,
        guest_name,
        start_date,
        status,
        total_amount,
        created_at,
        vehicles (
          brand,
          model,
          vehicle_brands (name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('최근 예약 조회 오류:', error);
      throw new Error('최근 예약 조회에 실패했습니다.');
    }

    return (data || []).map(reservation => ({
      id: reservation.id,
      reservation_number: reservation.reservation_number,
      guest_name: reservation.guest_name,
      vehicle_brand: reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand || '',
      vehicle_model: reservation.vehicles?.model || '',
      start_date: reservation.start_date,
      status: reservation.status,
      total_amount: reservation.total_amount,
      created_at: reservation.created_at
    }));
  } catch (error) {
    console.error('최근 예약 서비스 오류:', error);
    throw error;
  }
};

/**
 * 예약 상태 일괄 변경
 */
export const bulkUpdateReservationStatus = async (
  reservationIds: string[],
  status: string,
  approvalData?: ApprovalData
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (approvalData) {
      updateData.approved_by = approvalData.approved_by;
      updateData.approved_at = new Date().toISOString();
      updateData.admin_notes = approvalData.admin_notes;
    }

    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .in('id', reservationIds);

    if (error) {
      console.error('일괄 상태 변경 오류:', error);
      throw new Error('예약 상태 일괄 변경에 실패했습니다.');
    }
  } catch (error) {
    console.error('일괄 상태 변경 서비스 오류:', error);
    throw error;
  }
};

/**
 * 차량 반납 처리 전용 함수
 */
export const processVehicleReturn = async (
  reservationId: string,
  returnData: {
    actualReturnTime: string;
    condition: string;
    mileage?: string;
    returnNotes?: string;
    notes?: string;
  }
): Promise<AdminReservation> => {
  try {
    // 반납 정보를 admin_notes에 통합해서 저장 (기존 스키마 호환)
    const returnInfo = [
      `=== 반납 처리 정보 ===`,
      `반납 시간: ${returnData.actualReturnTime}`,
      `차량 상태: ${returnData.condition}`,
      returnData.mileage ? `주행거리: ${returnData.mileage}km` : '',
      returnData.returnNotes ? `반납 메모: ${returnData.returnNotes}` : '',
      returnData.notes ? `관리자 메모: ${returnData.notes}` : ''
    ].filter(Boolean).join('\n');

    const updateData: any = {
      status: 'completed',
      updated_at: new Date().toISOString(),
      admin_notes: returnInfo
    };

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        ),
        pickup_location:vehicle_locations!pickup_location_id (id, name, address),
        return_location:vehicle_locations!return_location_id (id, name, address)
      `)
      .single();

    if (error) {
      console.error('반납 처리 오류:', error);
      throw new Error('반납 처리에 실패했습니다.');
    }

    // 차량 상태를 사용 가능으로 변경 (에러 방지를 위해 try-catch 처리)
    if (data.vehicle_id) {
      try {
        await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', data.vehicle_id);
      } catch (vehicleUpdateError) {
        console.warn('차량 상태 업데이트 실패 (예약 상태는 정상 처리됨):', vehicleUpdateError);
      }
    }

    return data;
  } catch (error) {
    console.error('반납 처리 서비스 오류:', error);
    throw error;
  }
};

/**
 * 차량 인수 처리 (confirmed -> active)
 */
export const processVehiclePickup = async (
  reservationId: string,
  pickupData: {
    actualPickupTime: string;
    pickupNotes?: string;
    startMileage?: string;
    notes?: string;
  }
): Promise<AdminReservation> => {
  try {
    // 인수 정보를 admin_notes에 통합해서 저장 (기존 스키마 호환)
    const pickupInfo = [
      `=== 차량 인수 정보 ===`,
      `인수 시간: ${pickupData.actualPickupTime}`,
      pickupData.startMileage ? `시작 주행거리: ${pickupData.startMileage}km` : '',
      pickupData.pickupNotes ? `인수 메모: ${pickupData.pickupNotes}` : '',
      pickupData.notes ? `관리자 메모: ${pickupData.notes}` : ''
    ].filter(Boolean).join('\n');

    const updateData: any = {
      status: 'active',
      updated_at: new Date().toISOString(),
      admin_notes: pickupInfo
    };

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        ),
        pickup_location:vehicle_locations!pickup_location_id (id, name, address),
        return_location:vehicle_locations!return_location_id (id, name, address)
      `)
      .single();

    if (error) {
      console.error('차량 인수 처리 오류:', error);
      throw new Error('차량 인수 처리에 실패했습니다.');
    }

    // 차량 상태를 대여중으로 변경 (에러 방지를 위해 try-catch 처리)
    if (data.vehicle_id) {
      try {
        await supabase
          .from('vehicles')
          .update({ status: 'rented' })
          .eq('id', data.vehicle_id);
      } catch (vehicleUpdateError) {
        console.warn('차량 상태 업데이트 실패 (예약 상태는 정상 처리됨):', vehicleUpdateError);
      }
    }

    return data;
  } catch (error) {
    console.error('차량 인수 처리 서비스 오류:', error);
    throw error;
  }
};

/**
 * 지점별 통계 조회
 */
export const getLocationStats = async (): Promise<LocationStats[]> => {
  try {
    // 1. 모든 지점 정보 가져오기
    const { data: locations, error: locError } = await supabase
      .from('vehicle_locations')
      .select('id, name, address');

    if (locError) {
      console.error('지점 조회 오류:', locError);
      throw new Error('지점 정보를 불러오는 중 오류가 발생했습니다.');
    }

    // 2. 각 지점별 통계 계산
    const locationStats: LocationStats[] = [];

    for (const location of locations) {
      // 해당 지점의 차량들 조회
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id, status')
        .eq('location_id', location.id);

      if (vehicleError) {
        console.error(`지점 ${location.name} 차량 조회 오류:`, vehicleError);
        continue;
      }

      const vehicleIds = vehicles.map(v => v.id);
      const availableVehicles = vehicles.filter(v => v.status === 'available').length;

      // 해당 지점의 예약 통계 조회
      let totalReservations = 0;
      let activeReservations = 0;
      let pendingReservations = 0;
      let totalRevenue = 0;

      if (vehicleIds.length > 0) {
        const { data: reservations, error: resError } = await supabase
          .from('reservations')
          .select('status, total_amount, pickup_location_id')
          .in('vehicle_id', vehicleIds)
          .eq('pickup_location_id', location.id); // pickup_location_id와 지점 ID 매칭

        if (!resError && reservations) {
          totalReservations = reservations.length;
          activeReservations = reservations.filter(r => r.status === 'active').length;
          pendingReservations = reservations.filter(r => r.status === 'pending').length;
          totalRevenue = reservations.reduce((sum, r) => sum + r.total_amount, 0);
        }
      }

      locationStats.push({
        location_id: location.id,
        location_name: location.name,
        location_address: location.address,
        total_reservations: totalReservations,
        active_reservations: activeReservations,
        pending_reservations: pendingReservations,
        total_revenue: totalRevenue,
        available_vehicles: availableVehicles,
        total_vehicles: vehicles.length
      });
    }

    return locationStats;
  } catch (error) {
    console.error('지점별 통계 서비스 오류:', error);
    throw error;
  }
};

/**
 * 특정 지점의 예약 목록 조회
 */
export const getReservationsByLocation = async (
  locationId: string, 
  filter: ReservationFilter = {}
): Promise<PaginatedReservations> => {
  try {
    // 해당 지점의 차량 ID들 조회
    const { data: vehicles, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('location_id', locationId);

    if (vehicleError) {
      console.error('지점 차량 조회 오류:', vehicleError);
      throw new Error('지점 차량 정보를 불러오는 중 오류가 발생했습니다.');
    }

    const vehicleIds = vehicles.map(v => v.id);

    if (vehicleIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: filter.page || 1,
        limit: filter.limit || 10,
        total_pages: 0
      };
    }

    // 해당 지점 차량들의 예약 조회
    let query = supabase
      .from('reservations')
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          year,
          color,
          daily_rate,
          vehicle_number,
          vehicle_brands (name),
          vehicle_categories (name),
          vehicle_locations (name, address)
        ),
        pickup_location:vehicle_locations!pickup_location_id (id, name, address),
        return_location:vehicle_locations!return_location_id (id, name, address)
      `)
      .in('vehicle_id', vehicleIds);

    // 필터 적용
    if (filter.status?.length) {
      query = query.in('status', filter.status);
    }
    if (filter.payment_status?.length) {
      query = query.in('payment_status', filter.payment_status);
    }
    if (filter.start_date) {
      query = query.gte('start_date', filter.start_date);
    }
    if (filter.end_date) {
      query = query.lte('end_date', filter.end_date);
    }

    // 검색 필터
    if (filter.search) {
      query = query.or(`guest_name.ilike.%${filter.search}%,guest_email.ilike.%${filter.search}%,reservation_number.ilike.%${filter.search}%`);
    }

    // 정렬
    const sortBy = filter.sort_by || 'created_at';
    const sortOrder = filter.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 총 개수 조회
    const { count, error: countError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .in('vehicle_id', vehicleIds);

    if (countError) {
      console.error('지점 예약 개수 조회 오류:', countError);
      throw new Error('예약 개수를 조회하는 중 오류가 발생했습니다.');
    }

    // 페이징
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('지점 예약 조회 오류:', error);
      throw new Error('지점 예약을 조회하는 중 오류가 발생했습니다.');
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('지점별 예약 조회 서비스 오류:', error);
    throw error;
  }
};
