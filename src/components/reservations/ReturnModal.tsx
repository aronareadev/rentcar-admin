'use client';

import { useState } from 'react';
import { X, Car, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Button, Input } from '@/src/components/ui';
import { AdminReservation } from '@/src/types/reservation';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (returnData: ReturnData) => void;
  reservation: AdminReservation;
}

interface ReturnData {
  actualReturnTime: string;
  condition: string;
  mileage: string;
  returnNotes: string;
  notes: string;
}

export default function ReturnModal({ isOpen, onClose, onConfirm, reservation }: ReturnModalProps) {
  const [formData, setFormData] = useState<ReturnData>({
    actualReturnTime: new Date().toISOString().slice(0, 16), // 현재 시간으로 기본값
    condition: 'good',
    mileage: '',
    returnNotes: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.actualReturnTime || !formData.condition) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(formData);
    } catch (error) {
      console.error('반납 처리 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`반납 처리 실패: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReturnData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const conditionOptions = [
    { value: 'excellent', label: '매우 양호', color: 'text-green-600' },
    { value: 'good', label: '양호', color: 'text-blue-600' },
    { value: 'fair', label: '보통', color: 'text-yellow-600' },
    { value: 'poor', label: '불량', color: 'text-red-600' },
    { value: 'damaged', label: '손상', color: 'text-red-700' }
  ];

  const getCurrentConditionLabel = () => {
    const option = conditionOptions.find(opt => opt.value === formData.condition);
    return option ? option.label : '양호';
  };

  const getCurrentConditionColor = () => {
    const option = conditionOptions.find(opt => opt.value === formData.condition);
    return option ? option.color : 'text-blue-600';
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
      <div 
        className="bg-white w-full overflow-hidden flex flex-col"
        style={{
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '600px',
          maxHeight: '85vh'
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
            <Car style={{ width: '1.25rem', height: '1.25rem' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>차량 반납 처리</h2>
              <p className="text-sm opacity-80">
                예약번호: {reservation.reservation_number}
              </p>
            </div>
          </div>
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

        {/* 예약 정보 요약 */}
        <div 
          style={{
            backgroundColor: 'rgba(30, 64, 175, 0.02)',
            border: '1px solid rgba(30, 64, 175, 0.1)',
            padding: '1rem',
            margin: '1rem',
            borderRadius: '0.5rem'
          }}
        >
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
              <span className="text-gray-500">차량번호:</span>
              <span className="ml-2 font-medium text-gray-900">{reservation.vehicles?.vehicle_number}</span>
            </div>
            <div>
              <span className="text-gray-500">예정 반납일:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(reservation.end_date).toLocaleDateString('ko-KR')} {reservation.end_time}
              </span>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form 
          onSubmit={handleSubmit} 
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1
          }}
          className="space-y-6"
        >
          {/* 실제 반납 시간 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              실제 반납 시간 <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.actualReturnTime}
              onChange={(e) => handleInputChange('actualReturnTime', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* 차량 상태 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 mr-2 text-gray-400" />
              차량 상태 <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className={`mt-2 text-sm ${getCurrentConditionColor()}`}>
              현재 선택: {getCurrentConditionLabel()}
            </div>
          </div>

          {/* 주행거리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반납 시 주행거리 (km)
            </label>
            <Input
              type="number"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              placeholder="예: 12345"
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              차량 계기판의 총 주행거리를 입력해주세요
            </p>
          </div>

          {/* 반납 메모 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2 text-gray-400" />
              반납 상세 메모
            </label>
            <textarea
              value={formData.returnNotes}
              onChange={(e) => handleInputChange('returnNotes', e.target.value)}
              placeholder="차량 외관/내부 상태, 연료량, 특이사항 등을 기록해주세요"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* 관리자 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 메모 (내부용)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="내부 관리용 메모를 입력하세요"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* 경고 메시지 (손상된 경우) */}
          {(formData.condition === 'poor' || formData.condition === 'damaged') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    차량 상태 주의 필요
                  </h4>
                  <p className="text-sm text-yellow-700">
                    차량 상태가 불량/손상으로 표시되었습니다. 
                    반납 메모에 상세한 손상 내역을 기록해주시고, 
                    필요시 정비팀에 연락하시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              marginTop: '1rem',
              borderTop: '2px solid rgba(30, 64, 175, 0.1)'
            }}
          >
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </>
              ) : (
                <>
                  <Car className="w-4 h-4 mr-2" />
                  반납 완료 처리
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
