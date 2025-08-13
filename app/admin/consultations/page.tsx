'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input, Select, Loading } from '@/src/components/ui';
import { consultationService, Consultation } from '../../../src/lib/consultationService';
import { useToast } from '@/src/hooks/useToast';
import { 
  MessageSquare,
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User
} from 'lucide-react';

export default function ConsultationsPage() {
  const { showSuccess, showError } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 데이터 로드 및 실시간 구독
  useEffect(() => {
    loadConsultations();
    
    // 실시간 구독 설정
    console.log('📄 Setting up page-level subscription...');
    const subscription = consultationService.subscribeToChanges((payload: any) => {
      console.log('💬 Consultation page realtime update:', payload);
      
      if (payload.eventType === 'INSERT' || payload.event === 'INSERT') {
        // 새로운 상담 추가 - 중복 방지
        const newConsultation = payload.new as Consultation;
        setConsultations(prev => {
          const exists = prev.some(consultation => consultation.id === newConsultation.id);
          if (exists) {
            console.log('중복 상담 추가 방지:', newConsultation.id);
            return prev;
          }
          return [newConsultation, ...prev];
        });
      } else if (payload.eventType === 'UPDATE' || payload.event === 'UPDATE') {
        // 기존 상담 업데이트
        const updatedConsultation = payload.new as Consultation;
        setConsultations(prev => 
          prev.map(consultation => 
            consultation.id === updatedConsultation.id 
              ? updatedConsultation 
              : consultation
          )
        );
      } else if (payload.eventType === 'DELETE' || payload.event === 'DELETE') {
        // 상담 삭제
        const deletedId = payload.old.id;
        setConsultations(prev => 
          prev.filter(consultation => consultation.id !== deletedId)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      // 날짜 필터가 있으면 날짜 범위로 조회, 없으면 전체 조회
      const data = (startDate || endDate) 
        ? await consultationService.getByDateRange(startDate, endDate)
        : await consultationService.getAll();
      setConsultations(data);
    } catch (error) {
      console.error('Failed to load consultations:', error);
      showError('상담 데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 필터 변경시 데이터 다시 로드
  useEffect(() => {
    loadConsultations();
  }, [startDate, endDate]);

  // 날짜 필터 초기화
  const handleResetDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  // 오늘 날짜로 설정
  const handleSetToday = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  };

  // 상담 읽음 처리
  const handleMarkAsRead = async (id: string) => {
    try {
      await consultationService.markAsRead(id);
      setConsultations(prev => 
        prev.map(consultation => 
          consultation.id === id 
            ? { ...consultation, is_read: true }
            : consultation
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
      showError('읽음 처리에 실패했습니다.');
    }
  };

  // 상담 상태 업데이트
  const handleStatusUpdate = async (id: string, status: Consultation['status']) => {
    try {
      await consultationService.updateStatus(id, status);
      setConsultations(prev => 
        prev.map(consultation => 
          consultation.id === id 
            ? { ...consultation, status }
            : consultation
        )
      );
      showSuccess('상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update status:', error);
      showError('상태 업데이트에 실패했습니다.');
    }
  };

  // 상담 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 상담을 삭제하시겠습니까?')) return;
    
    try {
      await consultationService.delete(id);
      setConsultations(prev => prev.filter(consultation => consultation.id !== id));
      showSuccess('상담이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete consultation:', error);
      showError('상담 삭제에 실패했습니다.');
    }
  };

  // 상세보기 모달
  const handleViewDetail = async (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
    
    // 읽지 않은 상담이면 읽음 처리
    if (!consultation.is_read) {
      await handleMarkAsRead(consultation.id);
    }
  };

  // 필터링된 상담 목록
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = searchQuery === '' || 
      consultation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.customer_phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === '' || consultation.status === statusFilter;
    const matchesUnread = !showOnlyUnread || !consultation.is_read;
    
    return matchesSearch && matchesStatus && matchesUnread;
  });

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fee2e2', color: '#dc2626', icon: AlertCircle };
      case 'in_progress':
        return { bg: '#dbeafe', color: '#2563eb', icon: Clock };
      case 'resolved':
        return { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle };
      case 'closed':
        return { bg: '#f3f4f6', color: '#6b7280', icon: XCircle };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: Clock };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'in_progress': return '진행중';
      case 'resolved': return '해결됨';
      case 'closed': return '종료됨';
      default: return status;
    }
  };

  const unreadCount = consultations.filter(c => !c.is_read).length;

  if (loading) {
    return (
      <PageLayout
        title="상담 관리"
        description="고객 상담 요청을 관리하고 응답하세요"
      >
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="상담 관리"
      description={`총 ${consultations.length}개의 상담이 등록되어 있습니다 ${unreadCount > 0 ? `(읽지 않음: ${unreadCount}개)` : ''}`}
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <Bell style={{ width: '1rem', height: '1rem' }} />
              읽지 않음 {unreadCount}개
            </div>
          )}
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            style={{
              borderColor: showOnlyUnread ? 'rgb(30, 64, 175)' : '#e5e7eb',
              color: showOnlyUnread ? 'rgb(30, 64, 175)' : '#6b7280'
            }}
          >
            {showOnlyUnread ? '전체 보기' : '읽지 않음만'}
          </Button>
        </div>
      }
    >
      <Card className="border border-gray-200 shadow-lg">
        <div style={{ padding: '1.5rem' }}>
          {/* 검색 및 필터 영역 */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '1rem', 
                height: '1rem', 
                color: '#6b7280' 
              }} />
              <input
                type="text"
                placeholder="고객명, 연락처, 상담내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="in_progress">진행중</option>
              <option value="resolved">해결됨</option>
              <option value="closed">종료됨</option>
            </Select>
          </div>

          {/* 날짜 필터 영역 */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                날짜 필터:
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>시작일:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>종료일:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetToday}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  borderColor: '#3b82f6',
                  color: '#3b82f6'
                }}
              >
                오늘
              </Button>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDateFilter}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    borderColor: '#d1d5db',
                    color: '#6b7280'
                  }}
                >
                  전체
                </Button>
              )}
            </div>
            
            {(startDate || endDate) && (
              <div style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {startDate && endDate 
                  ? `${startDate} ~ ${endDate}` 
                  : startDate 
                    ? `${startDate} 이후` 
                    : `${endDate} 이전`}
              </div>
            )}
          </div>

          {/* 상담 목록 */}
          {filteredConsultations.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <MessageSquare style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#d1d5db' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {consultations.length === 0 ? '등록된 상담이 없습니다' : '검색 결과가 없습니다'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {consultations.length === 0 
                  ? '고객이 상담을 신청하면 여기에 표시됩니다'
                  : '검색 조건을 변경해보세요'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredConsultations.map((consultation) => {
                const statusStyle = getStatusStyle(consultation.status);
                const StatusIcon = statusStyle.icon;
                
                return (
                  <div 
                    key={consultation.id}
                    style={{
                      border: consultation.is_read ? '1px solid #e5e7eb' : '2px solid #3b82f6',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      backgroundColor: consultation.is_read ? 'white' : '#eff6ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleViewDetail(consultation)}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'start' }}>
                      {/* 상담 정보 */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                            {consultation.customer_name}
                          </h3>
                          {!consultation.is_read && (
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone style={{ width: '0.875rem', height: '0.875rem' }} />
                            {consultation.customer_phone}
                          </div>
                          {consultation.customer_email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail style={{ width: '0.875rem', height: '0.875rem' }} />
                              {consultation.customer_email}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                            {new Date(consultation.created_at).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        
                        <p style={{ 
                          margin: 0, 
                          color: '#374151',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {consultation.content}
                        </p>
                      </div>
                      
                      {/* 상태 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        <StatusIcon style={{ width: '1rem', height: '1rem' }} />
                        {getStatusLabel(consultation.status)}
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(consultation.id, 
                              consultation.status === 'pending' ? 'in_progress' : 
                              consultation.status === 'in_progress' ? 'resolved' : 'pending'
                            );
                          }}
                          style={{
                            borderColor: '#e5e7eb',
                            color: '#6b7280'
                          }}
                        >
                          {consultation.status === 'pending' ? '진행' : 
                           consultation.status === 'in_progress' ? '해결' : '재오픈'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(consultation.id);
                          }}
                          style={{
                            borderColor: '#fee2e2',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedConsultation && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div style={{
              backgroundColor: 'rgb(30, 64, 175)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                상담 상세정보
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  color: 'white',
                  padding: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* 모달 내용 */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(30, 64, 175)' }}>
                    고객 정보
                  </h3>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div><strong>이름:</strong> {selectedConsultation.customer_name}</div>
                    <div><strong>연락처:</strong> {selectedConsultation.customer_phone}</div>
                    {selectedConsultation.customer_email && (
                      <div><strong>이메일:</strong> {selectedConsultation.customer_email}</div>
                    )}
                    <div><strong>접수일시:</strong> {new Date(selectedConsultation.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(30, 64, 175)' }}>
                    상담 내용
                  </h3>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedConsultation.content}
                  </div>
                </div>

                {(selectedConsultation.rental_start_date || selectedConsultation.rental_end_date || selectedConsultation.preferred_vehicle) && (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(30, 64, 175)' }}>
                      대여 희망 정보
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                      {selectedConsultation.rental_start_date && (
                        <div><strong>대여 희망일:</strong> {selectedConsultation.rental_start_date}</div>
                      )}
                      {selectedConsultation.rental_end_date && (
                        <div><strong>반납 예정일:</strong> {selectedConsultation.rental_end_date}</div>
                      )}
                      {selectedConsultation.preferred_vehicle && (
                        <div><strong>선호 차종:</strong> {selectedConsultation.preferred_vehicle}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailModal(false)}
              >
                닫기
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  const status = selectedConsultation.status === 'pending' ? 'in_progress' : 
                               selectedConsultation.status === 'in_progress' ? 'resolved' : 'pending';
                  handleStatusUpdate(selectedConsultation.id, status);
                  setShowDetailModal(false);
                }}
              >
                {selectedConsultation.status === 'pending' ? '진행 처리' : 
                 selectedConsultation.status === 'in_progress' ? '해결 처리' : '재오픈'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
