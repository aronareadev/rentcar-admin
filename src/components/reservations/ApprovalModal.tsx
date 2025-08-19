'use client';

import { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { Button, Card, Input } from '@/src/components/ui';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  type: 'approve' | 'reject';
  reservationNumber: string;
  customerName: string;
}

export const ApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  reservationNumber,
  customerName
}: ApprovalModalProps) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApproval = type === 'approve';
  const title = isApproval ? '예약 승인' : '예약 거부';
  const actionText = isApproval ? '승인' : '거부';
  const iconColor = isApproval ? '#16a34a' : '#dc2626';
  const bgColor = isApproval ? '#dcfce7' : '#fee2e2';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('처리 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
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
          zIndex: 50,
          padding: '1rem',
          animation: 'fadeInUp 0.3s ease-out'
        }}
    >
      <Card 
        variant="bordered" 
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
          backgroundColor: 'white',
          animation: 'fadeInUp 0.4s ease-out 0.1s both'
        }}
      >
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isApproval ? (
                <Check style={{ width: '1.25rem', height: '1.25rem', color: iconColor }} />
              ) : (
                <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: iconColor }} />
              )}
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827', 
                margin: 0 
              }}>
                {title}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                margin: '0.25rem 0 0 0' 
              }}>
                예약번호: {reservationNumber}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            leftIcon={<X size={16} />}
            style={{ padding: '0.5rem' }}
          />
        </div>

        {/* 내용 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#374151', 
            marginBottom: '1rem' 
          }}>
            <strong>{customerName}</strong>님의 예약을 {actionText}하시겠습니까?
          </p>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              관리자 메모 {!isApproval && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isApproval 
                  ? "승인 사유나 특별 사항을 입력하세요 (선택사항)"
                  : "거부 사유를 명확히 입력해주세요"
              }
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            {!isApproval && !notes.trim() && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#dc2626', 
                marginTop: '0.25rem' 
              }}>
                거부 시 사유를 반드시 입력해주세요
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem'
        }}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            variant={isApproval ? "primary" : "outline"}
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApproval && !notes.trim())}
            leftIcon={isApproval ? <Check size={16} /> : <AlertTriangle size={16} />}
            style={{
              backgroundColor: isApproval ? '#16a34a' : '#dc2626',
              borderColor: isApproval ? '#16a34a' : '#dc2626',
              color: 'white'
            }}
          >
            {isSubmitting ? '처리중...' : actionText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
