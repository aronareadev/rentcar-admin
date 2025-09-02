'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X,
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Edit,
  Download,
  User
} from 'lucide-react';
import { Button, Loading } from '@/src/components/ui';
import { StatusBadge } from './StatusBadge';
import { 
  getReservationById, 
  updateReservation,
  approveReservation,
  rejectReservation,
  processVehicleReturn 
} from '@/src/lib/reservationService';
import { AdminReservation } from '@/src/types/reservation';
import ReturnModal from './ReturnModal';
import StatusUpdateModal from './StatusUpdateModal';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  onReservationUpdate?: () => void;
}

export default function ReservationDetailModal({ 
  isOpen, 
  onClose, 
  reservationId,
  onReservationUpdate 
}: ReservationDetailModalProps) {
  const [reservation, setReservation] = useState<AdminReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalType, setStatusModalType] = useState<'approve' | 'reject' | 'edit'>('edit');

  // 예약 정보 로드
  useEffect(() => {
    const loadReservation = async () => {
      if (!isOpen || !reservationId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getReservationById(reservationId);
        if (!data) {
          setError('예약을 찾을 수 없습니다.');
          return;
        }
        setReservation(data);
      } catch (err) {
        console.error('예약 상세 조회 실패:', err);
        setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [isOpen, reservationId]);

  // 모달 닫기 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setReservation(null);
      setLoading(true);
      setError(null);
      setReturnModalOpen(false);
      setStatusModalOpen(false);
    }
  }, [isOpen]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 시간 포맷팅
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 대여 일수 계산
  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 반납 처리
  const handleReturnComplete = async (returnData: any) => {
    try {
      await processVehicleReturn(reservationId, returnData);

      // 예약 정보 다시 로드
      const updatedReservation = await getReservationById(reservationId);
      setReservation(updatedReservation);
      setReturnModalOpen(false);
      
      // 부모 컴포넌트에 업데이트 알림
      onReservationUpdate?.();
      
      alert('반납 처리가 완료되었습니다.');
    } catch (error) {
      console.error('반납 처리 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`반납 처리 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // 상태 변경 처리
  const handleStatusUpdate = async (updateData: any) => {
    try {
      if (statusModalType === 'approve') {
        await approveReservation(reservationId, updateData);
      } else if (statusModalType === 'reject') {
        await rejectReservation(reservationId, updateData);
      } else {
        await updateReservation(reservationId, updateData);
      }

      // 예약 정보 다시 로드
      const updatedReservation = await getReservationById(reservationId);
      setReservation(updatedReservation);
      setStatusModalOpen(false);
      
      // 부모 컴포넌트에 업데이트 알림
      onReservationUpdate?.();
      
      alert('예약 상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`상태 업데이트 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // 승인 모달 열기
  const openApprovalModal = () => {
    setStatusModalType('approve');
    setStatusModalOpen(true);
  };

  // 거부 모달 열기
  const openRejectModal = () => {
    setStatusModalType('reject');
    setStatusModalOpen(true);
  };

  // 편집 모달 열기
  const openEditModal = () => {
    setStatusModalType('edit');
    setStatusModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full overflow-hidden flex flex-col"
                            style={{
                      borderRadius: '0.75rem',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      maxWidth: '800px',
                      maxHeight: '90vh'
                    }}
      >
        {/* 헤더 */}
        <div 
          className="flex items-center justify-between text-white"
          style={{
            backgroundColor: 'rgb(30, 64, 175)',
            padding: '1rem 1.5rem',
            borderTopLeftRadius: '0.75rem',
            borderTopRightRadius: '0.75rem'
          }}
        >
          <div className="flex items-center space-x-3">
            <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                예약 상세
              </h2>

            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 액션 버튼들 - 헤더에서 제거하고 컨텐츠로 이동 */}
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>

        {/* 내용 */}
                            <div 
                      style={{
                        padding: '2rem',
                        overflowY: 'auto',
                        flex: 1
                      }}
                    >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading size="lg" />
            </div>
          ) : error || !reservation ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <div>
              {/* 예약번호 */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(30, 64, 175, 0.05)',
                  border: '1px solid rgba(30, 64, 175, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                                            marginBottom: '1.5rem'
                }}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem' }}>예약 상세:</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                    {reservation.reservation_number}
                  </span>
                </div>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  <StatusBadge status={reservation.status} />
                  <StatusBadge status={reservation.payment_status} type="payment" />
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  borderTop: '2px solid rgba(30, 64, 175, 0.1)',
                                            marginBottom: '1.5rem'
                }}
              >
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
                  다운로드
                </Button>
                {reservation.status === 'pending' && (
                  <>
                    <Button 
                      size="sm"
                      onClick={openApprovalModal}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle size={16} />
                      <span className="ml-1">승인</span>
                    </Button>
                    <Button 
                      size="sm"
                      onClick={openRejectModal}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle size={16} />
                      <span className="ml-1">거부</span>
                    </Button>
                  </>
                )}
                {reservation.status === 'active' && (
                  <Button 
                    size="sm"
                    onClick={() => setReturnModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <RotateCcw size={16} />
                    <span className="ml-1">반납 처리</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={openEditModal}>
                  <Edit size={16} />
                  <span className="ml-1">수정</span>
                </Button>
              </div>

              {/* 예약 현황 */}
              <div 
                style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                                            marginBottom: '1.5rem'
                }}
              >
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                    예약 현황
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(reservation.total_amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        총 {getDaysCount(reservation.start_date, reservation.end_date)}일
                      </div>
                    </div>
                  </div>
                </div>

                {/* 승인 정보 */}
                {reservation.approved_by && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          처리자: {reservation.approved_by}
                        </div>
                        <div className="text-sm text-gray-500">
                          처리일: {formatDate(reservation.approved_at!)}
                        </div>
                      </div>
                      {reservation.admin_notes && (
                        <div className="text-sm text-gray-600 max-w-md">
                          메모: {reservation.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 상세 정보 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* 고객 정보 */}
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      고객 정보
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">이름:</span>
                      <span className="font-medium text-gray-900">{reservation.guest_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">연락처:</span>
                      <span className="text-gray-900">{reservation.guest_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">이메일:</span>
                      <span className="text-gray-900 text-xs">{reservation.guest_email}</span>
                    </div>
                  </div>
                </div>

                {/* 차량 정보 */}
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <Car className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      차량 정보
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">
                        {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {reservation.vehicles?.year}년 • {reservation.vehicles?.color}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">차량번호:</span>
                      <span className="font-medium text-gray-900">{reservation.vehicles?.vehicle_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">일일요금:</span>
                      <span className="text-gray-900">{formatCurrency(reservation.vehicles?.daily_rate || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 대여 정보 */}
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      대여 정보
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">대여 기간</div>
                      <div className="font-medium text-gray-900 text-xs">
                        {formatDate(reservation.start_date)} ~ {formatDate(reservation.end_date)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">시간:</span>
                      <span className="text-gray-900">
                        {formatTime(reservation.start_time)} ~ {formatTime(reservation.end_time)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 장소 정보 */}
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      픽업/반납 장소
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">픽업:</div>
                      <div className="font-medium text-gray-900 text-xs">
                        {reservation.pickup_location?.name || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">반납:</div>
                      <div className="font-medium text-gray-900 text-xs">
                        {reservation.return_location?.name || '정보 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 요청사항 */}
              {reservation.notes && (
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                                              marginBottom: '1.5rem'
                  }}
                >
                  <div className="flex items-center mb-3">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      고객 요청사항
                    </h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{reservation.notes}</p>
                  </div>
                </div>
              )}

              {/* 반납 정보 (반납 완료된 경우) */}
              {reservation.status === 'completed' && reservation.admin_notes && reservation.admin_notes.includes('=== 반납 처리 정보 ===') && (
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                                              marginBottom: '1.5rem'
                  }}
                >
                  <div className="flex items-center mb-3">
                    <RotateCcw className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                      반납 정보
                    </h4>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{reservation.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* 예약 히스토리 */}
              <div 
                style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '1.5rem',
                                            marginBottom: '1.5rem'
                }}
              >
                <div className="flex items-center mb-3">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(30, 64, 175)', marginLeft: '0.5rem' }}>
                    예약 히스토리
                  </h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">예약 신청</div>
                      <div className="text-sm text-gray-500">{formatDate(reservation.created_at)}</div>
                    </div>
                    <StatusBadge status="pending" size="sm" />
                  </div>
                  
                  {reservation.approved_at && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">
                          {reservation.status === 'cancelled' ? '예약 거부' : '예약 승인'}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(reservation.approved_at)}</div>
                      </div>
                      <StatusBadge status={reservation.status === 'cancelled' ? 'cancelled' : 'confirmed'} size="sm" />
                    </div>
                  )}
                  
                  {reservation.status === 'active' && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">대여 시작</div>
                        <div className="text-sm text-gray-500">{formatDate(reservation.start_date)}</div>
                      </div>
                      <StatusBadge status="active" size="sm" />
                    </div>
                  )}
                  
                  {reservation.status === 'completed' && (
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-900">반납 완료</div>
                        <div className="text-sm text-gray-500">{formatDate(reservation.updated_at)}</div>
                      </div>
                      <StatusBadge status="completed" size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 반납 처리 모달 */}
        {reservation && (
          <ReturnModal
            isOpen={returnModalOpen}
            onClose={() => setReturnModalOpen(false)}
            onConfirm={handleReturnComplete}
            reservation={reservation}
          />
        )}

        {/* 상태 업데이트 모달 */}
        {reservation && (
          <StatusUpdateModal
            isOpen={statusModalOpen}
            onClose={() => setStatusModalOpen(false)}
            onConfirm={handleStatusUpdate}
            type={statusModalType}
            reservation={reservation}
          />
        )}
      </motion.div>
    </div>
  );
}
