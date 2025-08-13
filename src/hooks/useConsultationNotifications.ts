import { useState, useEffect } from 'react';
import { consultationService, Consultation } from '../lib/consultationService';

export const useConsultationNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestConsultations, setLatestConsultations] = useState<Consultation[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // 초기 데이터 로드
    loadUnreadConsultations();

    // 실시간 구독 설정
    const subscription = consultationService.subscribeToChanges((payload: any) => {
      console.log('🔔 Consultation realtime event:', payload);
      
      if (payload.eventType === 'INSERT' || payload.event === 'INSERT') {
        // 새로운 상담이 등록되었을 때
        const newConsultation = payload.new as Consultation;
        
        // 중복 방지: 이미 존재하는 상담인지 확인
        setLatestConsultations(prev => {
          const exists = prev.some(consultation => consultation.id === newConsultation.id);
          if (exists) {
            console.log('이미 존재하는 상담, 중복 추가 방지:', newConsultation.id);
            return prev;
          }
          return [newConsultation, ...prev.slice(0, 4)];
        });
        
        // 읽지 않은 상담 카운트도 중복 증가 방지
        setUnreadCount(prev => {
          // 새로운 상담이고 읽지 않은 상태일 때만 카운트 증가
          if (!newConsultation.is_read) {
            return prev + 1;
          }
          return prev;
        });
        setShowNotification(true);
        
        // 브라우저 알림 (권한이 있을 경우)
        if (Notification.permission === 'granted') {
          new Notification('🔔 새로운 상담이 접수되었습니다', {
            body: `${newConsultation.customer_name}님의 "${newConsultation.subject}" 문의`,
            icon: '/favicon.ico',
            tag: 'consultation-notification',
            requireInteraction: true
          });
        }
        
        // 브라우저 탭 제목 변경으로 시각적 알림
        const originalTitle = document.title;
        document.title = `🔔 새 상담 | ${originalTitle}`;
        setTimeout(() => {
          document.title = originalTitle;
        }, 10000);
        
        // 5초 후 알림 숨김
        setTimeout(() => setShowNotification(false), 5000);
        
      } else if (payload.eventType === 'UPDATE' || payload.event === 'UPDATE') {
        // 상담이 업데이트되었을 때 (읽음 처리 등)
        const updatedConsultation = payload.new as Consultation;
        const oldConsultation = payload.old;
        
        console.log('📝 상담 업데이트:', { old: oldConsultation, new: updatedConsultation });
        
        // 읽음 상태 변경 시 카운트 업데이트 및 목록에서 제거
        if (updatedConsultation.is_read && !oldConsultation.is_read) {
          console.log('✅ 상담 읽음 처리됨, 알림에서 제거:', updatedConsultation.id);
          setUnreadCount(prev => Math.max(0, prev - 1));
          // 읽음 처리된 상담을 최신 알림 목록에서 완전히 제거
          setLatestConsultations(prev => 
            prev.filter(consultation => consultation.id !== updatedConsultation.id)
          );
        } else {
          // 다른 업데이트는 정보만 갱신
          setLatestConsultations(prev => 
            prev.map(consultation => 
              consultation.id === updatedConsultation.id 
                ? updatedConsultation
                : consultation
            )
          );
        }
      }
    });

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUnreadConsultations = async () => {
    try {
      const unreadConsultations = await consultationService.getUnread();
      setUnreadCount(unreadConsultations.length);
      setLatestConsultations(unreadConsultations.slice(0, 5));
    } catch (error) {
      console.error('Failed to load unread consultations:', error);
    }
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  return {
    unreadCount,
    latestConsultations,
    showNotification,
    dismissNotification,
    refreshData: loadUnreadConsultations
  };
};
