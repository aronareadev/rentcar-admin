'use client';

import { useState } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/src/components/ui';
import { AdminReservation } from '@/src/types/reservation';

interface ApprovalActionsProps {
  reservation: AdminReservation;
  onApprove: (reservationId: string, notes?: string) => void;
  onReject: (reservationId: string, notes?: string) => void;
  disabled?: boolean;
}

export function ApprovalActions({ 
  reservation, 
  onApprove, 
  onReject, 
  disabled = false 
}: ApprovalActionsProps) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(reservation.id, approvalNotes);
      setShowApprovalForm(false);
      setApprovalNotes('');
    } catch (error) {
      console.error('승인 처리 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(reservation.id, rejectionNotes);
      setShowRejectionForm(false);
      setRejectionNotes('');
    } catch (error) {
      console.error('거부 처리 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(reservation.id, '승인됨');
    } catch (error) {
      console.error('빠른 승인 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(reservation.id, '거부됨');
    } catch (error) {
      console.error('빠른 거부 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (reservation.status !== 'pending') {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 빠른 액션 버튼들 */}
      {!showApprovalForm && !showRejectionForm && (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleQuickApprove}
            disabled={disabled || isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4 mr-1" />
            빠른 승인
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowApprovalForm(true)}
            disabled={disabled || isProcessing}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            메모와 승인
          </Button>
          <Button
            size="sm"
            onClick={handleQuickReject}
            disabled={disabled || isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <X className="h-4 w-4 mr-1" />
            거부
          </Button>
        </div>
      )}

      {/* 승인 폼 */}
      {showApprovalForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-green-800">예약 승인</h4>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="승인 사유나 특별한 안내사항을 입력하세요 (선택사항)"
            rows={3}
            className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
          />
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? '처리중...' : '승인하기'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowApprovalForm(false);
                setApprovalNotes('');
              }}
              disabled={isProcessing}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 거부 폼 */}
      {showRejectionForm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-red-800">예약 거부</h4>
          <textarea
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            placeholder="거부 사유를 입력하세요"
            rows={3}
            required
            className="w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
          />
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleReject}
              disabled={isProcessing || !rejectionNotes.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? '처리중...' : '거부하기'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowRejectionForm(false);
                setRejectionNotes('');
              }}
              disabled={isProcessing}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

