'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Edit, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/src/components/ui';
import { AdminReservation, ReservationStatus } from '@/src/types/reservation';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updateData: any) => void;
  type: 'approve' | 'reject' | 'edit';
  reservation: AdminReservation;
}

export default function StatusUpdateModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  reservation 
}: StatusUpdateModalProps) {
  const [formData, setFormData] = useState({
    admin_notes: '',
    approved_by: 'admin', // 실제로는 로그인된 관리자 ID
    status: reservation.status,
    payment_status: reservation.payment_status,
    total_amount: reservation.total_amount,
    start_date: reservation.start_date,
    end_date: reservation.end_date,
    start_time: reservation.start_time,
    end_time: reservation.end_time
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type !== 'edit' && !formData.admin_notes.trim()) {
      alert('처리 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'approve') {
        await onConfirm({
          approved_by: formData.approved_by,
          admin_notes: formData.admin_notes
        });
      } else if (type === 'reject') {
        await onConfirm({
          approved_by: formData.approved_by,
          admin_notes: formData.admin_notes
        });
      } else {
        // edit mode
        await onConfirm({
          status: formData.status,
          payment_status: formData.payment_status,
          total_amount: formData.total_amount,
          start_date: formData.start_date,
          end_date: formData.end_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          admin_notes: formData.admin_notes
        });
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`상태 업데이트 실패: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getModalConfig = () => {
    switch (type) {
      case 'approve':
        return {
          title: '예약 승인',
          description: '예약을 승인하시겠습니까?',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-100',
          buttonText: '승인하기',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'reject':
        return {
          title: '예약 거부',
          description: '예약을 거부하시겠습니까?',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-100',
          buttonText: '거부하기',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'edit':
        return {
          title: '예약 정보 수정',
          description: '예약 정보를 수정합니다',
          icon: <Edit className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-100',
          buttonText: '수정하기',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          title: '상태 변경',
          description: '',
          icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-100',
          buttonText: '변경하기',
          buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const config = getModalConfig();

  const statusOptions = [
    { value: 'pending', label: '승인 대기' },
    { value: 'confirmed', label: '예약 확정' },
    { value: 'active', label: '대여중' },
    { value: 'completed', label: '반납 완료' },
    { value: 'cancelled', label: '취소됨' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: '결제 대기' },
    { value: 'paid', label: '결제 완료' },
    { value: 'refunded', label: '환불 완료' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-500">
                예약번호: {reservation.reservation_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 예약 정보 요약 */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">고객명:</span>
              <span className="ml-2 font-medium text-gray-900">{reservation.guest_name}</span>
            </div>
            <div>
              <span className="text-gray-500">차량:</span>
              <span className="ml-2 font-medium text-gray-900">
                {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
              </span>
            </div>
            <div>
              <span className="text-gray-500">대여기간:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(reservation.start_date).toLocaleDateString('ko-KR')} ~ {new Date(reservation.end_date).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">총 금액:</span>
              <span className="ml-2 font-medium text-gray-900">
                {reservation.total_amount.toLocaleString('ko-KR')}원
              </span>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {config.description && (
            <div className="text-gray-700">
              {config.description}
            </div>
          )}

          {/* 편집 모드일 때만 상세 필드 표시 */}
          {type === 'edit' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 예약 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약 상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 결제 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    결제 상태
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => handleInputChange('payment_status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {paymentStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 시작일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 시작 시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 종료 시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 총 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  총 금액 (원)
                </label>
                <Input
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* 관리자 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'edit' ? '관리자 메모' : '처리 사유'} 
              {type !== 'edit' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => handleInputChange('admin_notes', e.target.value)}
              placeholder={
                type === 'approve' ? '승인 사유를 입력하세요' :
                type === 'reject' ? '거부 사유를 입력하세요' :
                '수정 사유나 관리자 메모를 입력하세요'
              }
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required={type !== 'edit'}
            />
          </div>

          {/* 경고 메시지 (거부할 때) */}
          {type === 'reject' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    예약 거부 확인
                  </h4>
                  <p className="text-sm text-red-700">
                    예약을 거부하면 고객에게 알림이 전송되며, 
                    이 작업은 되돌릴 수 없습니다. 
                    명확한 거부 사유를 작성해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={config.buttonClass}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </>
              ) : (
                <>
                  {config.icon}
                  <span className="ml-2">{config.buttonText}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
