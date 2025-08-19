'use client';

import { useState } from 'react';
import { AdminReservation, ApprovalData } from '@/src/types/reservation';
import { Card, Button } from '@/src/components/ui';
import { StatusBadge } from '@/src/components/reservations';
import { approveReservation, rejectReservation } from '@/src/lib/reservationService';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: AdminReservation;
  onUpdate: () => void; // 예약 업데이트 후 호출되는 콜백
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onUpdate
}: ReservationDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  if (!isOpen) return null;

  const handleApprovalSubmit = async () => {
    if (approvalType === 'reject' && !adminNotes.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const approvalData: ApprovalData = {
        approved_by: 'admin',
        admin_notes: adminNotes.trim()
      };

      if (approvalType === 'approve') {
        await approveReservation(reservation.id, approvalData);
        alert('예약이 승인되었습니다.');
      } else {
        await rejectReservation(reservation.id, approvalData);
        alert('예약이 거부되었습니다.');
      }

      setShowApprovalForm(false);
      setAdminNotes('');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('예약 처리 오류:', error);
      alert(error instanceof Error ? error.message : '예약 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ animation: 'fadeInUp 0.3s ease-out' }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          {/* 헤더 */}
          <div className="flex justify-between items-start p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">예약 상세 정보</h2>
              <p className="text-sm text-gray-500 mt-1">
                예약번호: {reservation.reservation_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 상태 및 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약 상태</label>
                <StatusBadge status={reservation.status} type="reservation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
                <StatusBadge status={reservation.payment_status} type="payment" />
              </div>
            </div>

            {/* 고객 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">고객 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">이름:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">전화번호:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.guest_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">이메일:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.guest_email}</span>
                </div>
              </div>
            </div>

            {/* 차량 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">차량 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">차량:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">연식:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.vehicles?.year}년</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">색상:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.vehicles?.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">차량번호:</span>
                  <span className="text-sm font-medium text-gray-900">{reservation.vehicles?.vehicle_number}</span>
                </div>
              </div>
            </div>

            {/* 예약 상세 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">예약 상세</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">대여 시작:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(reservation.start_date)} {formatTime(reservation.start_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">반납 예정:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(reservation.end_date)} {formatTime(reservation.end_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">픽업 지점:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {reservation.pickup_location?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">반납 지점:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {reservation.return_location?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 금액:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {formatCurrency(reservation.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 메모 */}
            {(reservation.notes || reservation.admin_notes) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">메모</h3>
                <div className="space-y-3">
                  {reservation.notes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">고객 메모</h4>
                      <p className="text-sm text-blue-800">{reservation.notes}</p>
                    </div>
                  )}
                  {reservation.admin_notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">관리자 메모</h4>
                      <p className="text-sm text-gray-700">{reservation.admin_notes}</p>
                      {reservation.approved_by && reservation.approved_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          처리자: {reservation.approved_by} | 
                          처리일: {new Date(reservation.approved_at).toLocaleString('ko-KR')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 승인/거부 폼 */}
            {showApprovalForm && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">
                  예약 {approvalType === 'approve' ? '승인' : '거부'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">
                      {approvalType === 'approve' ? '승인 메모 (선택사항)' : '거부 사유 (필수)'}
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder={
                        approvalType === 'approve' 
                          ? '승인 처리 관련 메모를 입력하세요...'
                          : '거부 사유를 입력하세요...'
                      }
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleApprovalSubmit}
                      disabled={loading}
                      className={
                        approvalType === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {loading ? '처리중...' : (approvalType === 'approve' ? '승인 확정' : '거부 확정')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowApprovalForm(false);
                        setAdminNotes('');
                      }}
                      disabled={loading}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {reservation.status === 'pending' && (
              <>
                <Button
                  onClick={() => {
                    setApprovalType('approve');
                    setShowApprovalForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading || showApprovalForm}
                >
                  승인
                </Button>
                <Button
                  onClick={() => {
                    setApprovalType('reject');
                    setShowApprovalForm(true);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading || showApprovalForm}
                >
                  거부
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              닫기
            </Button>
          </div>
        </Card>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

