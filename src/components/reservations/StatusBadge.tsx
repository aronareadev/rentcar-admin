'use client';

import { ReservationStatus, PaymentStatus } from '@/src/types/reservation';

interface StatusBadgeProps {
  status: ReservationStatus | PaymentStatus;
  type?: 'reservation' | 'payment';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type = 'reservation', size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status) {
        case 'pending':
          return {
            label: '결제 대기',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
          };
        case 'paid':
          return {
            label: '결제 완료',
            className: 'bg-green-100 text-green-800 border-green-200'
          };
        case 'refunded':
          return {
            label: '환불 완료',
            className: 'bg-gray-100 text-gray-800 border-gray-200'
          };
        default:
          return {
            label: status,
            className: 'bg-gray-100 text-gray-800 border-gray-200'
          };
      }
    }

    // reservation status
    switch (status) {
      case 'pending':
        return {
          label: '승인 대기',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'confirmed':
        return {
          label: '예약 확정',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'active':
        return {
          label: '대여중',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'completed':
        return {
          label: '반납 완료',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'cancelled':
        return {
          label: '취소됨',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status, type);
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}

