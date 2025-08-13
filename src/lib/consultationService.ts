import { supabase } from './supabase';

export interface Consultation {
  id: string;
  consultation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  type?: 'general' | 'booking' | 'technical' | 'complaint';
  subject: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  rental_start_date?: string;
  rental_end_date?: string;
  preferred_vehicle?: string;
  admin_memo?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConsultationData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  subject: string;
  content: string;
  rental_start_date?: string;
  rental_end_date?: string;
  preferred_vehicle?: string;
}

export const consultationService = {
  // 상담 신청 생성
  async create(data: CreateConsultationData): Promise<Consultation> {
    const consultation_number = `CONS${Date.now()}`;
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert([{
        consultation_number,
        ...data,
        type: 'general' as const,
        status: 'pending' as const,
        priority: 'normal' as const,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return consultation as Consultation;
  },

  // 모든 상담 조회 (관리자용)
  async getAll(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Consultation[];
  },

  // 날짜 범위로 상담 조회
  async getByDateRange(startDate?: string, endDate?: string): Promise<Consultation[]> {
    let query = supabase
      .from('consultations')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      // 종료일은 해당 날짜의 23:59:59까지 포함하도록 처리
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Consultation[];
  },

  // 읽지 않은 상담 조회
  async getUnread(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Consultation[];
  },

  // 상담 읽음 처리
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  // 상담 상태 업데이트
  async updateStatus(id: string, status: Consultation['status'], admin_memo?: string): Promise<void> {
    const updateData: any = { status };
    if (admin_memo !== undefined) {
      updateData.admin_memo = admin_memo;
    }

    const { error } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  // 특정 상담 조회
  async getById(id: string): Promise<Consultation | null> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Consultation;
  },

  // 상담 삭제
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 실시간 구독 설정 - 실패시 폴링으로 자동 전환하는 이중 안전장치 시스템
  subscribeToChanges(callback: (payload: any) => void) {
    console.log('🚀 Starting basic realtime subscription...');
    
    // 폴링 방식 백업 변수 선언 - 실시간 구독이 실패할 경우 사용
    let pollingInterval: NodeJS.Timeout;
    let lastCheck = new Date().toISOString();
    
    const startPolling = () => {
      console.log('📊 Starting polling fallback...');
      // 5초마다 새로운 상담 데이터를 직접 조회하는 폴링 시스템
      pollingInterval = setInterval(async () => {
        try {
          // 마지막 체크 이후 생성된 새로운 상담들만 조회
          const { data } = await supabase
            .from('consultations')
            .select('*')
            .gte('created_at', lastCheck)
            .order('created_at', { ascending: false });
          
          // 새로운 데이터가 있으면 실시간 이벤트처럼 콜백 호출
          if (data && data.length > 0) {
            console.log(`폴링으로 ${data.length}개의 새로운 상담 발견`);
            data.forEach(consultation => {
              callback({
                eventType: 'INSERT',
                event: 'INSERT',
                new: consultation,
                old: null,
                source: 'polling' // 폴링에서 온 데이터임을 표시
              });
            });
            // 다음 체크를 위해 마지막 확인 시간 업데이트
            lastCheck = new Date().toISOString();
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // 5초마다 새로운 데이터 확인
    };
    
    // 고유한 채널명 생성으로 기존 채널과의 충돌 방지
    const channelName = `consultations_${Date.now()}`;
    console.log('📡 Creating channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', // 모든 데이터베이스 이벤트 감지 (INSERT, UPDATE, DELETE)
          schema: 'public', 
          table: 'consultations' 
        }, 
        (payload) => {
          console.log('🔌 Realtime payload received:', payload);
          // 실시간 구독이 성공적으로 작동하면 폴링 백업 시스템 중지
          if (pollingInterval) {
            clearInterval(pollingInterval);
            console.log('📊 Stopping polling - realtime working');
          }
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription successful');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          // 실시간 구독 실패시 폴링 백업 시스템으로 자동 전환
          console.warn(`⚠️ Realtime failed (${status}), switching to polling`);
          startPolling();
        }
        
        if (err) {
          console.error('❌ Subscription error:', err);
          // 에러 발생시에도 폴링 백업 시스템 시작
          startPolling();
        }
      });
    
    // 10초 대기 후 실시간 구독이 여전히 실패상태면 폴링 시작
    setTimeout(() => {
      if (channel.state !== 'joined') {
        console.warn('⏰ Realtime timeout, starting polling backup');
        startPolling();
      }
    }, 10000);
    
    // 채널 객체 반환 - 정리 시 폴링도 함께 중지하도록 unsubscribe 메서드 확장
    return {
      ...channel,
      unsubscribe: () => {
        // 컴포넌트 언마운트시 폴링 인터벌도 함께 정리
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        return channel.unsubscribe();
      }
    };
  }
};
