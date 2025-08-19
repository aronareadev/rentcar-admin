'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Bell,
  Filter,
  SortAsc,
  Users
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { PendingReservationCard } from '@/src/components/reservations/PendingReservationCard';
import { 
  getPendingReservations, 
  approveReservation, 
  rejectReservation,
  bulkUpdateReservationStatus
} from '@/src/lib/reservationService';
import { AdminReservation } from '@/src/types/reservation';

export default function PendingReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'start_date' | 'total_amount'>('created_at');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 대기중인 예약 조회
  const fetchPendingReservations = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingReservations();
      setReservations(data);
    } catch (error) {
      console.error('대기 예약 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    fetchPendingReservations();
  }, []);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingReservations();
    setRefreshing(false);
  };

  // 예약 승인
  const handleApprove = async (reservationId: string, notes?: string) => {
    try {
      await approveReservation(reservationId, {
        approved_by: 'admin', // TODO: 실제 관리자 ID로 교체
        admin_notes: notes || '승인됨'
      });
      await fetchPendingReservations();
    } catch (error) {
      console.error('예약 승인 실패:', error);
    }
  };

  // 예약 거부
  const handleReject = async (reservationId: string, notes?: string) => {
    try {
      await rejectReservation(reservationId, {
        approved_by: 'admin', // TODO: 실제 관리자 ID로 교체
        admin_notes: notes || '거부됨'
      });
      await fetchPendingReservations();
    } catch (error) {
      console.error('예약 거부 실패:', error);
    }
  };

  // 일괄 승인
  const handleBulkApprove = async () => {
    if (selectedReservations.length === 0) return;
    
    try {
      await bulkUpdateReservationStatus(selectedReservations, 'confirmed', {
        approved_by: 'admin',
        admin_notes: '일괄 승인됨'
      });
      setSelectedReservations([]);
      await fetchPendingReservations();
    } catch (error) {
      console.error('일괄 승인 실패:', error);
    }
  };

  // 일괄 거부
  const handleBulkReject = async () => {
    if (selectedReservations.length === 0) return;
    
    try {
      await bulkUpdateReservationStatus(selectedReservations, 'cancelled', {
        approved_by: 'admin',
        admin_notes: '일괄 거부됨'
      });
      setSelectedReservations([]);
      await fetchPendingReservations();
    } catch (error) {
      console.error('일괄 거부 실패:', error);
    }
  };

  // 긴급 예약 여부 확인 (24시간 이상 대기)
  const isUrgentReservation = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated > 24;
  };

  // 필터링된 예약 목록
  const filteredReservations = reservations
    .filter(reservation => {
      if (showUrgentOnly) {
        return isUrgentReservation(reservation.created_at);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'start_date':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'total_amount':
          return b.total_amount - a.total_amount;
        default:
          return 0;
      }
    });

  // 통계 계산
  const urgentCount = reservations.filter(r => isUrgentReservation(r.created_at)).length;
  const todayCount = reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.created_at.split('T')[0] === today;
  }).length;
  const totalAmount = reservations.reduce((sum, r) => sum + r.total_amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-orange-500" />
            승인 대기 예약
          </h1>
          <p className="text-gray-600 mt-1">
            고객이 신청한 예약을 검토하고 승인 또는 거부할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            새로고침
          </Button>
          <Button
            variant="outline"
            leftIcon={<Bell />}
          >
            알림 설정
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 대기</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {reservations.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">긴급 처리</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {urgentCount}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 신청</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {todayCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">대기 금액</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {totalAmount.toLocaleString()}원
                </p>
              </div>
              <div className="text-purple-500 text-lg font-bold">₩</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <Button
              size="sm"
              variant={showUrgentOnly ? "default" : "outline"}
              onClick={() => setShowUrgentOnly(!showUrgentOnly)}
            >
              긴급만 보기
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="created_at">신청일 순</option>
              <option value="start_date">대여일 순</option>
              <option value="total_amount">금액 순</option>
            </select>
          </div>
        </div>

        {selectedReservations.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedReservations.length}개 선택됨
            </span>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              일괄 승인
            </Button>
            <Button
              size="sm"
              onClick={handleBulkReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              일괄 거부
            </Button>
          </div>
        )}
      </div>

      {/* 예약 목록 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">대기중인 예약을 불러오는 중...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showUrgentOnly ? '긴급 처리할 예약이 없습니다' : '승인 대기중인 예약이 없습니다'}
            </h3>
            <p className="text-gray-500">
              {showUrgentOnly 
                ? '모든 예약이 적시에 처리되었습니다.'
                : '새로운 예약 신청을 기다리고 있습니다.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredReservations.map((reservation, index) => (
            <PendingReservationCard
              key={reservation.id}
              reservation={reservation}
              onApprove={handleApprove}
              onReject={handleReject}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

