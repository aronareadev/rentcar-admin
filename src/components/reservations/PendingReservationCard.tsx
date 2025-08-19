'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Car, 
  MapPin,
  DollarSign,
  User,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui';
import { StatusBadge } from './StatusBadge';
import { ApprovalActions } from './ApprovalActions';
import { AdminReservation } from '@/src/types/reservation';

interface PendingReservationCardProps {
  reservation: AdminReservation;
  onApprove: (reservationId: string, notes?: string) => void;
  onReject: (reservationId: string, notes?: string) => void;
  index?: number;
}

export function PendingReservationCard({ 
  reservation, 
  onApprove, 
  onReject, 
  index = 0 
}: PendingReservationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
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

  const getTimeSinceCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}분 전`;
    }
  };

  const isUrgent = () => {
    const created = new Date(reservation.created_at);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated > 24; // 24시간 이상 대기중이면 긴급
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden ${isUrgent() ? 'border-orange-200 bg-orange-50' : ''}`}>
        <CardContent className="p-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {reservation.reservation_number}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <StatusBadge status={reservation.status} size="sm" />
                  <span className="text-sm text-gray-500">
                    {getTimeSinceCreated(reservation.created_at)} 신청
                  </span>
                  {isUrgent() && (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">긴급</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 고객 정보 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                고객 정보
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-16 text-gray-500">이름:</div>
                  <div className="font-medium">{reservation.guest_name}</div>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <div className="w-14 text-gray-500">연락처:</div>
                  <div>{reservation.guest_phone}</div>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <div className="w-14 text-gray-500">이메일:</div>
                  <div className="break-all">{reservation.guest_email}</div>
                </div>
              </div>
            </div>

            {/* 차량 및 예약 정보 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Car className="h-4 w-4 mr-2" />
                차량 정보
              </h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
                  </div>
                  <div className="text-gray-500">
                    {reservation.vehicles?.year}년 • {reservation.vehicles?.color} • {reservation.vehicles?.daily_rate?.toLocaleString()}원/일
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <div>{formatDate(reservation.start_date)} ~ {formatDate(reservation.end_date)}</div>
                      <div className="text-gray-500">
                        {getDaysCount(reservation.start_date, reservation.end_date)}일간
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      픽업: {reservation.start_time} | 반납: {reservation.end_time}
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      {reservation.pickup_location} → {reservation.return_location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 요금 정보 및 액션 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                요금 정보
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>일일 요금</span>
                  <span>{formatCurrency(reservation.vehicles?.daily_rate || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>대여 일수</span>
                  <span>{getDaysCount(reservation.start_date, reservation.end_date)}일</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>총 금액</span>
                  <span className="text-blue-600">{formatCurrency(reservation.total_amount)}</span>
                </div>
                <StatusBadge status={reservation.payment_status} type="payment" size="sm" />
              </div>

              {/* 요청사항 */}
              {reservation.notes && (
                <div>
                  <h5 className="font-medium text-gray-900 flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    요청사항
                  </h5>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    {reservation.notes}
                  </div>
                </div>
              )}

              {/* 승인/거부 액션 */}
              <ApprovalActions
                reservation={reservation}
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

