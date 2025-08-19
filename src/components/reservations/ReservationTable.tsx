'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Check, 
  X, 
  Edit, 
  Phone, 
  Mail, 
  Calendar,
  Car,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/src/components/ui';
import { StatusBadge } from './StatusBadge';
import { AdminReservation, PaginatedReservations } from '@/src/types/reservation';

interface ReservationTableProps {
  reservations: PaginatedReservations;
  onApprove: (reservationId: string) => void;
  onReject: (reservationId: string) => void;
  onEdit: (reservation: AdminReservation) => void;
  onView: (reservation: AdminReservation) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ReservationTable({
  reservations,
  onApprove,
  onReject,
  onEdit,
  onView,
  onPageChange,
  isLoading = false
}: ReservationTableProps) {
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReservations(reservations.data.map(r => r.id));
    } else {
      setSelectedReservations([]);
    }
  };

  const handleSelectReservation = (reservationId: string, checked: boolean) => {
    if (checked) {
      setSelectedReservations(prev => [...prev, reservationId]);
    } else {
      setSelectedReservations(prev => prev.filter(id => id !== reservationId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">예약 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!reservations.data.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">예약이 없습니다</h3>
          <p className="text-gray-500">필터 조건을 변경하거나 새로운 예약을 기다려 보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedReservations.length === reservations.data.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                전체 선택 ({selectedReservations.length}개 선택됨)
              </span>
            </label>
          </div>
          {selectedReservations.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                일괄 승인
              </Button>
              <Button size="sm" variant="outline">
                일괄 거부
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                선택
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                예약번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                차량정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                대여기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                신청일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.data.map((reservation, index) => (
              <motion.tr
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                {/* 선택 체크박스 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedReservations.includes(reservation.id)}
                    onChange={(e) => handleSelectReservation(reservation.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                {/* 예약번호 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.reservation_number}
                  </div>
                </td>

                {/* 고객정보 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.guest_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-3">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {reservation.guest_phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {reservation.guest_email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 차량정보 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.vehicles?.year}년 • {reservation.vehicles?.color}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 대여기간 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(reservation.start_date)} ~ {formatDate(reservation.end_date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getDaysCount(reservation.start_date, reservation.end_date)}일
                  </div>
                </td>

                {/* 금액 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(reservation.total_amount)}
                  </div>
                  <StatusBadge status={reservation.payment_status} type="payment" size="sm" />
                </td>

                {/* 상태 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={reservation.status} />
                </td>

                {/* 신청일 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reservation.created_at)}
                </td>

                {/* 작업 */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {reservation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApprove(reservation.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReject(reservation.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(reservation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(reservation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            전체 {reservations.total}개 중 {((reservations.page - 1) * reservations.limit) + 1}-
            {Math.min(reservations.page * reservations.limit, reservations.total)}개 표시
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(reservations.page - 1)}
              disabled={reservations.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700">
              {reservations.page} / {reservations.total_pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(reservations.page + 1)}
              disabled={reservations.page >= reservations.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

