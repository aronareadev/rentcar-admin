'use client';

import { useState, useEffect, useMemo } from 'react';

// 애니메이션을 위한 스타일
const globalKeyframes = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
  }
  
  @keyframes pendingPulse {
    0%, 100% { 
      border-color: #f59e0b;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
    }
    50% { 
      border-color: #fbbf24;
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }
  }
  

  
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
`;

// 컴포넌트 마운트 시 스타일 추가
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalKeyframes;
  document.head.appendChild(style);
}
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Download,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  Car,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button, Card, Input, Select, Loading } from '@/src/components/ui';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { StatusBadge, ApprovalModal, ReservationDetailModal } from '@/src/components/reservations';
import { 
  getAllReservations, 
  approveReservation, 
  rejectReservation,
  getReservationStats,
  getLocationStats,
  getReservationsByLocation
} from '@/src/lib/reservationService';
import { 
  AdminReservation, 
  PaginatedReservations, 
  ReservationFilter as FilterType,
  ReservationStats,
  LocationStats
} from '@/src/types/reservation';


export default function ReservationsPage() {
  const [allReservations, setAllReservations] = useState<AdminReservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'location'>('all'); // 전체 보기 vs 지점별 보기
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  // 실용적 날짜 기본값 설정 (1주일 전 ~ 2주일 후)
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [startDateFilter, setStartDateFilter] = useState<string>(oneWeekAgo.toISOString().split('T')[0]);
  const [endDateFilter, setEndDateFilter] = useState<string>(twoWeeksLater.toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    reservation: AdminReservation | null;
  }>({
    isOpen: false,
    type: 'approve',
    reservation: null
  });
  
  // 예약 상세 모달 상태
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    reservationId: string | null;
  }>({
    isOpen: false,
    reservationId: null
  });

  // DB에서 예약 데이터 로드
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (viewMode === 'all') {
          // 전체 예약 데이터 로드
          const reservationsData = await getAllReservations({ limit: 1000 });
          setAllReservations(reservationsData.data);
          
          // 전체 통계 데이터 로드
          const statsData = await getReservationStats();
          setStats(statsData);
        } else {
          // 지점별 예약 데이터 로드
          if (selectedLocationId !== 'all') {
            const reservationsData = await getReservationsByLocation(selectedLocationId, { limit: 1000 });
            setAllReservations(reservationsData.data);
          }
        }
        
        // 지점별 통계 로드 (항상)
        const locationStatsData = await getLocationStats();
        setLocationStats(locationStatsData);
      } catch (err) {
        console.error('예약 데이터 로드 실패:', err);
        setError('예약 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [viewMode, selectedLocationId]);

  // 필터링된 예약 목록
  const filteredReservations = useMemo(() => {
    return allReservations.filter(reservation => {
      const matchesSearch = 
        reservation.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.reservation_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reservation.vehicles?.model || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === 'all' || reservation.payment_status === paymentStatusFilter;
      
      // 날짜 필터링: 대여 시작일 기준으로 필터링 (실제 비즈니스 로직에 맞게)
      let matchesDateRange = true;
      if (startDateFilter && endDateFilter) {
        // 예약의 대여 기간이 필터 기간과 겹치는지 확인
        const reservationStart = new Date(reservation.start_date);
        const reservationEnd = new Date(reservation.end_date);
        const filterStart = new Date(startDateFilter);
        const filterEnd = new Date(endDateFilter);
        
        // 기간이 겹치는 조건: 예약 시작일이 필터 종료일 이전이고, 예약 종료일이 필터 시작일 이후
        matchesDateRange = reservationStart <= filterEnd && reservationEnd >= filterStart;
      } else if (startDateFilter) {
        matchesDateRange = matchesDateRange && reservation.start_date >= startDateFilter;
      } else if (endDateFilter) {
        matchesDateRange = matchesDateRange && reservation.start_date <= endDateFilter;
      }
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
    });
  }, [allReservations, searchQuery, statusFilter, paymentStatusFilter, startDateFilter, endDateFilter]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  // 승인 모달 열기
  const openApprovalModal = (reservation: AdminReservation, type: 'approve' | 'reject') => {
    setApprovalModal({
      isOpen: true,
      type,
      reservation
    });
  };

  // 승인 모달 닫기
  const closeApprovalModal = () => {
    setApprovalModal({
      isOpen: false,
      type: 'approve',
      reservation: null
    });
  };

  // 상세 모달 열기
  const openDetailModal = (reservationId: string) => {
    setDetailModal({
      isOpen: true,
      reservationId
    });
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      reservationId: null
    });
  };

  // 예약 업데이트 후 리로드
  const handleReservationUpdate = () => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        
        if (viewMode === 'all') {
          const reservationsData = await getAllReservations({ limit: 1000 });
          setAllReservations(reservationsData.data);
          const statsData = await getReservationStats();
          setStats(statsData);
        } else {
          if (selectedLocationId !== 'all') {
            const reservationsData = await getReservationsByLocation(selectedLocationId, { limit: 1000 });
            setAllReservations(reservationsData.data);
          }
        }
        
        const locationStatsData = await getLocationStats();
        setLocationStats(locationStatsData);
      } catch (err) {
        console.error('예약 데이터 리로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  };

  // 예약 승인 처리
  const handleApprovalConfirm = async (notes: string) => {
    if (!approvalModal.reservation) return;

    const reservationId = approvalModal.reservation.id;
    const isApproval = approvalModal.type === 'approve';

    try {
      const approvalData = {
        approved_by: 'admin', // 실제 로그인된 관리자 ID
        admin_notes: notes || (isApproval ? '승인됨' : '거부됨')
      };

      if (isApproval) {
        await approveReservation(reservationId, approvalData);
      } else {
        await rejectReservation(reservationId, approvalData);
      }
      
      // 로컬 상태 업데이트
      setAllReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { 
                ...r, 
                status: isApproval ? 'confirmed' : 'cancelled',
                approved_by: 'admin',
                approved_at: new Date().toISOString(),
                admin_notes: notes || (isApproval ? '승인됨' : '거부됨'),
                updated_at: new Date().toISOString() 
              }
            : r
        )
      );
      
      // 통계 재로드
      const statsData = await getReservationStats();
      setStats(statsData);
      
      // 성공 메시지
      alert(`예약이 성공적으로 ${isApproval ? '승인' : '거부'}되었습니다.`);
    } catch (error) {
      console.error(`예약 ${isApproval ? '승인' : '거부'} 실패:`, error);
      alert(`예약 ${isApproval ? '승인' : '거부'} 중 오류가 발생했습니다.`);
    }
  };

  // 상태별 색상 매핑
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
      case 'confirmed': return 'text-blue-700 bg-blue-100 border border-blue-200';
      case 'active': return 'text-green-700 bg-green-100 border border-green-200';
      case 'completed': return 'text-gray-700 bg-gray-100 border border-gray-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border border-red-200';
      default: return 'text-gray-700 bg-gray-100 border border-gray-200';
    }
  };

  // 상태 한글 변환
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'confirmed': return '예약 확정';
      case 'active': return '대여중';
      case 'completed': return '반납 완료';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  // 결제 상태 한글 변환
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '결제 대기';
      case 'paid': return '결제 완료';
      case 'refunded': return '환불 완료';
      default: return status;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // 로딩 중일 때
  if (loading) {
    return (
      <PageLayout
        title="예약 관리"
        description="고객의 예약을 관리하고 승인/거부를 처리할 수 있습니다"
      >
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  // 에러 발생시
  if (error) {
    return (
      <PageLayout
        title="예약 관리"
        description="고객의 예약을 관리하고 승인/거부를 처리할 수 있습니다"
      >
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="예약 관리"
      description="고객의 예약을 관리하고 승인/거부를 처리할 수 있습니다"
      actions={
        <>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            내보내기
          </Button>
          <Button leftIcon={<Plus size={18} />}>
            수동 예약 추가
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* 뷰 모드 선택 */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* 뷰 모드 토글 */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setViewMode('all');
                setSelectedLocationId('all');
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: viewMode === 'all' ? '#1e293b' : 'white',
                color: viewMode === 'all' ? 'white' : '#64748b',
                boxShadow: viewMode === 'all' ? '0 2px 4px rgba(30, 41, 59, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              전체 현황
            </button>
            <button
              onClick={() => setViewMode('location')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: viewMode === 'location' ? '#1e293b' : 'white',
                color: viewMode === 'location' ? 'white' : '#64748b',
                boxShadow: viewMode === 'location' ? '0 2px 4px rgba(30, 41, 59, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              지점별 현황
            </button>
          </div>

          {/* 지점 선택 (지점별 보기일 때만) */}
          {viewMode === 'location' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                지점:
              </span>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  minWidth: '160px'
                }}
              >
                <option value="all">전체 지점</option>
                {locationStats.map(location => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 선택된 지점 정보 표시 */}
          {viewMode === 'location' && selectedLocationId !== 'all' && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              📍 {locationStats.find(l => l.location_id === selectedLocationId)?.location_address}
            </div>
          )}
        </div>
      </div>

      {/* 통계 카드 - 뷰 모드에 따라 다르게 표시 */}
      {viewMode === 'all' ? (
        /* 전체 통계 카드 */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>

        
        {/* 전체 예약 카드 - 트렌드 차트 포함 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(30, 41, 59, 0.03) 100%)',
          borderRadius: '1rem',
          border: '1px solid rgba(30, 41, 59, 0.1)',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => {
          setStatusFilter('all');
          setSearchQuery('');
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(30, 41, 59, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 41, 59, 0.08)';
        }}>
          {/* 배경 패턴 */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(30, 41, 59, 0.02) 0%, transparent 70%)',
            transform: 'rotate(45deg)'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', margin: 0 }}>전체 예약</p>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#10b981', 
                  backgroundColor: '#dcfce7',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: '600'
                }}>
                  +12%
                </span>
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e293b', margin: '0.25rem 0', lineHeight: 1 }}>
                {stats?.total_reservations || 0}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                이번 주 vs 지난 주
              </p>
              
              {/* 미니 트렌드 라인 */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'end', gap: '2px', height: '20px' }}>
                {[4, 7, 3, 8, 6, 9, 12].map((height, i) => (
                  <div key={i} style={{
                    width: '4px',
                    height: `${height}px`,
                    backgroundColor: '#10b981',
                    borderRadius: '1px',
                    opacity: 0.6 + (i * 0.1)
                  }} />
                ))}
              </div>
            </div>
            {/* 배경 아이콘 */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>
              <Calendar style={{ width: '4rem', height: '4rem', color: '#1e293b' }} />
            </div>
          </div>
        </div>

        {/* 승인 대기 카드 - 깜빡거림 + 긴급도 표시 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
          borderRadius: '1rem',
          border: '2px solid #f59e0b',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          animation: (stats?.pending_count || 0) > 0 ? 'pendingPulse 2s infinite' : 'none'
        }}
        onClick={() => {
          setStatusFilter('pending');
          setSearchQuery('');
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.2)';
        }}>
          



          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', margin: 0 }}>승인 대기</p>
                {(stats?.pending_count || 0) > 0 && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: '#ef4444', 
                    backgroundColor: '#fee2e2',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontWeight: '600'
                  }}>
                    2시간 내 처리
                  </span>
                )}
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#92400e', margin: '0.25rem 0', lineHeight: 1 }}>
                {stats?.pending_count || 0}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0 }}>
                {(stats?.pending_count || 0) > 0 ? '내일 시작 예약 포함' : '모든 예약 승인 완료'}
              </p>

              {/* 처리 시간 바 */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((stats?.pending_count || 0) * 30, 100)}%`,
                    height: '100%',
                    backgroundColor: '#f59e0b',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
            {/* 배경 아이콘 */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>
              <Clock style={{ width: '4rem', height: '4rem', color: '#92400e' }} />
            </div>
          </div>
        </div>

        {/* 진행중 대여 카드 - 실시간 상태 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          borderRadius: '1rem',
          border: '1px solid #10b981',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => {
          setStatusFilter('active');
          setSearchQuery('');
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.1)';
        }}>
          
          {/* 실시간 표시 점 */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46', margin: 0 }}>진행중 대여</p>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#10b981', 
                  backgroundColor: '#d1fae5',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: '600'
                }}>
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#065f46', margin: '0.25rem 0', lineHeight: 1 }}>
                {stats?.active_count || 0}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#065f46', margin: 0 }}>
                {(stats?.active_count || 0) > 0 ? '차량 운행 중' : '대여 차량 없음'}
              </p>

              {/* 진행률 표시 */}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.25rem' }}>
                {Array.from({length: Math.min(stats?.active_count || 0, 5)}).map((_, i) => (
                  <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: `pulse ${1.5 + i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
            {/* 배경 아이콘 */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>
              <Users style={{ width: '4rem', height: '4rem', color: '#065f46' }} />
            </div>
          </div>
        </div>

        {/* 총 매출 카드 - 상세 정보 (파란색 계열) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
          borderRadius: '1rem',
          border: '1px solid #3b82f6',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => {
          setStatusFilter('completed');
          setSearchQuery('');
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
        }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>총 매출</p>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#3b82f6', 
                  backgroundColor: '#dbeafe',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: '600'
                }}>
                  이번 달
                </span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e40af', margin: '0.25rem 0', lineHeight: 1 }}>
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0 }}>
                평균 {formatCurrency(Math.round((stats?.total_revenue || 0) / Math.max(stats?.total_reservations || 1, 1)))} / 예약
              </p>

              {/* 수익 트렌드 미니 차트 */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'end', gap: '2px', height: '16px' }}>
                {[8, 12, 6, 15, 10, 18, 14].map((height, i) => (
                  <div key={i} style={{
                    width: '3px',
                    height: `${height}px`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '1px',
                    opacity: 0.7
                  }} />
                ))}
              </div>
            </div>
            {/* 배경 아이콘 */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>
              <TrendingUp style={{ width: '4rem', height: '4rem', color: '#1e40af' }} />
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* 지점별 통계 카드 */
        <div>
          {selectedLocationId === 'all' ? (
            /* 모든 지점 현황 */
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {locationStats.map(location => (
                <div key={location.location_id} style={{
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(30, 41, 59, 0.03) 100%)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(30, 41, 59, 0.1)',
                  padding: '1.25rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => setSelectedLocationId(location.location_id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(30, 41, 59, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 41, 59, 0.06)';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        margin: '0 0 0.25rem 0',
                        lineHeight: 1.2
                      }}>
                        📍 {location.location_name}
                      </h3>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        margin: '0 0 1rem 0',
                        lineHeight: 1.4
                      }}>
                        {location.location_address}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.125rem' }}>총 예약</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            {location.total_reservations}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.125rem' }}>총 매출</div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#3b82f6' }}>
                            {(location.total_revenue / 10000).toFixed(0)}만원
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.125rem' }}>대여중</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
                            {location.active_reservations}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.125rem' }}>대기중</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f59e0b' }}>
                            {location.pending_reservations}
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '0.375rem',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginBottom: '0.25rem' }}>
                          차량 현황
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            사용가능: {location.available_vehicles}대
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            전체: {location.total_vehicles}대
                          </span>
                        </div>
                        <div style={{ 
                          marginTop: '0.375rem',
                          height: '4px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(location.available_vehicles / Math.max(location.total_vehicles, 1)) * 100}%`,
                            height: '100%',
                            backgroundColor: '#3b82f6',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 선택된 지점의 상세 통계 */
            (() => {
              const selectedLocation = locationStats.find(l => l.location_id === selectedLocationId);
              if (!selectedLocation) return null;
              
              return (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {/* 지점 총 예약 */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(30, 41, 59, 0.03) 100%)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(30, 41, 59, 0.1)',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', margin: 0 }}>지점 총 예약</p>
                        <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e293b', margin: '0.25rem 0', lineHeight: 1 }}>
                          {selectedLocation.total_reservations}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          📍 {selectedLocation.location_name}
                        </p>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.1,
                        pointerEvents: 'none'
                      }}>
                        <Calendar style={{ width: '4rem', height: '4rem', color: '#1e293b' }} />
                      </div>
                    </div>
                  </div>

                  {/* 지점 대여중 */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    borderRadius: '1rem',
                    border: '1px solid #10b981',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46', margin: 0 }}>대여중</p>
                        <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#065f46', margin: '0.25rem 0', lineHeight: 1 }}>
                          {selectedLocation.active_reservations}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#065f46', margin: 0 }}>
                          차량 운행 중
                        </p>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.1,
                        pointerEvents: 'none'
                      }}>
                        <Users style={{ width: '4rem', height: '4rem', color: '#065f46' }} />
                      </div>
                    </div>
                  </div>

                  {/* 지점 승인 대기 */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    borderRadius: '1rem',
                    border: '2px solid #f59e0b',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: selectedLocation.pending_reservations > 0 ? 'pendingPulse 2s infinite' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', margin: 0 }}>승인 대기</p>
                        <p style={{ fontSize: '2.25rem', fontWeight: '800', color: '#92400e', margin: '0.25rem 0', lineHeight: 1 }}>
                          {selectedLocation.pending_reservations}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0 }}>
                          처리 필요
                        </p>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.1,
                        pointerEvents: 'none'
                      }}>
                        <Clock style={{ width: '4rem', height: '4rem', color: '#92400e' }} />
                      </div>
                    </div>
                  </div>

                  {/* 지점 매출 */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    borderRadius: '1rem',
                    border: '1px solid #3b82f6',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>지점 매출</p>
                        <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e40af', margin: '0.25rem 0', lineHeight: 1 }}>
                          {formatCurrency(selectedLocation.total_revenue)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0 }}>
                          차량 {selectedLocation.total_vehicles}대 운영
                        </p>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.1,
                        pointerEvents: 'none'
                      }}>
                        <TrendingUp style={{ width: '4rem', height: '4rem', color: '#1e40af' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* 컴팩트한 검색 및 필터 UI */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        
        {/* 검색바 + 빠른 필터 칩 한 줄 배치 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {/* 검색바 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            minWidth: '300px',
            flex: '1',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#1e293b';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 41, 59, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <Search size={16} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="고객명, 예약번호, 차량 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                color: '#1f2937',
                backgroundColor: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  color: '#9ca3af',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 빠른 필터 칩들 - 같은 줄에 배치 */}
          {[
            { label: '승인 대기', value: 'pending', color: '#f59e0b' },
            { label: '예약 확정', value: 'confirmed', color: '#3b82f6' },
            { label: '대여중', value: 'active', color: '#10b981' },
            { label: '완료', value: 'completed', color: '#6b7280' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
              style={{
                padding: '0.375rem 0.625rem',
                borderRadius: '1rem',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: statusFilter === status.value ? status.color : 'white',
                color: statusFilter === status.value ? 'white' : status.color,
                boxShadow: statusFilter === status.value 
                  ? `0 2px 6px ${status.color}40` 
                  : '0 1px 2px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== status.value) {
                  e.currentTarget.style.backgroundColor = `${status.color}15`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (statusFilter !== status.value) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {status.label}
            </button>
          ))}

          {/* 고급 필터 버튼도 첫 번째 줄에 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: showFilters ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'white',
              color: showFilters ? 'white' : '#1e293b',
              border: `1px solid ${showFilters ? '#1e293b' : '#d1d5db'}`,
              borderRadius: '0.375rem',
              padding: '0.375rem 0.625rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            <Filter size={14} />
            고급
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* 결과 카운트도 첫 번째 줄 끝에 */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            color: '#6b7280',
            marginLeft: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ color: '#1e293b', fontWeight: '600' }}>
              {filteredReservations.length}
            </span>
            <span>/ {allReservations.length}개</span>
          </div>
        </div>

        {/* 고급 필터가 열렸을 때만 여백 추가 */}
        {showFilters && (
          <div style={{ marginBottom: '0.75rem' }} />
        )}

        {/* 컴팩트한 고급 필터 패널 */}
        {showFilters && (
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            padding: '0.875rem',
            border: '1px solid #e5e7eb',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              
              {/* 결제 상태 선택 */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.375rem'
                }}>
                  결제 상태
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {[
                    { label: '전체', value: 'all' },
                    { label: '대기', value: 'pending' },
                    { label: '완료', value: 'paid' },
                    { label: '환불', value: 'refunded' }
                  ].map((payment) => (
                    <button
                      key={payment.value}
                      onClick={() => setPaymentStatusFilter(payment.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: `1px solid ${paymentStatusFilter === payment.value ? '#1e293b' : '#d1d5db'}`,
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: paymentStatusFilter === payment.value ? '#1e293b' : 'white',
                        color: paymentStatusFilter === payment.value ? 'white' : '#374151'
                      }}
                    >
                      {payment.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 날짜 범위 선택 */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.375rem'
                }}>
                  대여 기간 필터
                </label>
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem' }}>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.375rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>~</span>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.375rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  />
                </div>
                
                {/* 컴팩트한 빠른 날짜 선택 */}
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '오늘', action: () => {
                      const today = new Date();
                      setStartDateFilter(today.toISOString().split('T')[0]);
                      setEndDateFilter(today.toISOString().split('T')[0]);
                    }},
                    { label: '이번주', action: () => {
                      const today = new Date();
                      const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
                      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
                      setStartDateFilter(startOfWeek.toISOString().split('T')[0]);
                      setEndDateFilter(endOfWeek.toISOString().split('T')[0]);
                    }},
                    { label: '곧시작', action: () => {
                      const today = new Date();
                      const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                      setStartDateFilter(today.toISOString().split('T')[0]);
                      setEndDateFilter(twoWeeksLater.toISOString().split('T')[0]);
                    }},
                    { label: '최근', action: () => {
                      const today = new Date();
                      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setStartDateFilter(oneWeekAgo.toISOString().split('T')[0]);
                      setEndDateFilter(today.toISOString().split('T')[0]);
                    }}
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={preset.action}
                      style={{
                        padding: '0.1875rem 0.375rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.1875rem',
                        background: 'white',
                        color: '#6b7280',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#9ca3af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 컴팩트한 초기화 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentStatusFilter('all');
                  const today = new Date();
                  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                  setStartDateFilter(oneWeekAgo.toISOString().split('T')[0]);
                  setEndDateFilter(twoWeeksLater.toISOString().split('T')[0]);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* 컴팩트한 활성 필터 표시 */}
        {(statusFilter !== 'all' || paymentStatusFilter !== 'all' || searchQuery) && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(30, 41, 59, 0.03)',
            borderRadius: '0.375rem',
            border: '1px dashed #d1d5db'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem', 
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                활성:
              </span>
              {searchQuery && (
                <span style={{
                  padding: '0.125rem 0.375rem',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontSize: '0.65rem',
                  fontWeight: '500'
                }}>
                  "{searchQuery.length > 12 ? searchQuery.substring(0, 12) + '...' : searchQuery}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span style={{
                  padding: '0.125rem 0.375rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontSize: '0.65rem',
                  fontWeight: '500'
                }}>
                  {getStatusLabel(statusFilter)}
                </span>
              )}
              {paymentStatusFilter !== 'all' && (
                <span style={{
                  padding: '0.125rem 0.375rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontSize: '0.65rem',
                  fontWeight: '500'
                }}>
                  {getPaymentStatusLabel(paymentStatusFilter)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 예약 목록 테이블 */}
      <Card variant="bordered" padding="none">
        <div style={{ 
          overflow: 'hidden',
          borderRadius: '0.75rem',
          border: '1px solid rgba(30, 41, 59, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderBottom: '2px solid #334155',
                position: 'relative'
              }}>
                <tr>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    예약 정보
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    고객 정보
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    차량 정보
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    대여 기간
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    상태
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#f8fafc',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {paginatedReservations.map((reservation, index) => (
                  <tr 
                    key={reservation.id} 
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                    }}
                  >
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          marginBottom: '0.125rem'
                        }}>
                          {reservation.reservation_number}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          marginBottom: '0.125rem'
                        }}>
                          신청일: {formatDate(reservation.created_at)}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280'
                        }}>
                          금액: {formatCurrency(reservation.total_amount)}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          marginBottom: '0.125rem'
                        }}>
                          {reservation.guest_name}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          marginBottom: '0.125rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Phone style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                          {reservation.guest_phone}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Mail style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                          {reservation.guest_email}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Car style={{ width: '1rem', height: '1rem', color: '#6b7280', marginRight: '0.5rem' }} />
                        <div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#111827',
                            marginBottom: '0.125rem'
                          }}>
                            {reservation.vehicles?.vehicle_brands?.name || reservation.vehicles?.brand} {reservation.vehicles?.model}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280'
                          }}>
                            {reservation.vehicles?.year}년 • {reservation.vehicles?.color}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#111827',
                          marginBottom: '0.125rem'
                        }}>
                          {formatDate(reservation.start_date)} ~ {formatDate(reservation.end_date)}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          marginBottom: '0.125rem'
                        }}>
                          {getDaysCount(reservation.start_date, reservation.end_date)}일간
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280'
                        }}>
                          {reservation.start_time} ~ {reservation.end_time}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '9999px',
                          border: '1px solid'
                        }} className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.6875rem',
                          fontWeight: '500',
                          borderRadius: '9999px',
                          border: '1px solid',
                          backgroundColor: reservation.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                          color: reservation.payment_status === 'paid' ? '#16a34a' : '#d97706',
                          borderColor: reservation.payment_status === 'paid' ? '#22c55e' : '#f59e0b'
                        }}>
                          {getPaymentStatusLabel(reservation.payment_status)}
                        </span>
                        {reservation.approved_by && (
                          <div style={{ 
                            fontSize: '0.625rem', 
                            color: '#6b7280',
                            marginTop: '0.125rem' 
                          }}>
                            처리자: {reservation.approved_by}
                            {reservation.approved_at && (
                              <div>{formatDate(reservation.approved_at)}</div>
                            )}
                          </div>
                        )}
                        {reservation.admin_notes && (
                          <div style={{ 
                            fontSize: '0.625rem', 
                            color: '#374151',
                            backgroundColor: '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            marginTop: '0.125rem',
                            maxWidth: '150px',
                            wordBreak: 'break-word'
                          }}>
                            메모: {reservation.admin_notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                        {reservation.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openApprovalModal(reservation, 'approve')}
                              leftIcon={<Check size={14} />}
                              style={{ color: '#16a34a' }}
                            >
                              승인
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openApprovalModal(reservation, 'reject')}
                              leftIcon={<X size={14} />}
                              style={{ color: '#dc2626' }}
                            >
                              거부
                            </Button>
                          </>
                        )}
                        {reservation.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDetailModal(reservation.id)}
                            leftIcon={<Car size={14} />}
                            style={{ color: '#059669' }}
                          >
                            반납
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetailModal(reservation.id)}
                          leftIcon={<Eye size={14} />}
                        >
                          보기
                        </Button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(30, 41, 59, 0.05) 100%)', 
            padding: '0.75rem 1rem', 
            borderTop: '2px solid rgba(30, 41, 59, 0.8)',
            borderBottomLeftRadius: '0.75rem',
            borderBottomRightRadius: '0.75rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{startIndex + 1}</span>
                    {' - '}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, filteredReservations.length)}
                    </span>
                    {' / '}
                    <span className="font-medium">{filteredReservations.length}</span>
                    개 결과
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      page = currentPage - 2 + i;
                      if (page > totalPages) page = totalPages - 4 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </Card>

      {/* 빈 상태 */}
      {filteredReservations.length === 0 && (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">예약이 없습니다</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {(searchQuery || statusFilter !== 'all' || paymentStatusFilter !== 'all' || 
                startDateFilter || endDateFilter)
                ? '검색 조건에 맞는 예약이 없습니다. 다른 조건으로 검색해보세요.'
                : '첫 번째 예약을 기다리고 있습니다.'}
            </p>
            <Button leftIcon={<Plus size={18} />}>
              수동 예약 추가
            </Button>
          </div>
        </Card>
      )}

      {/* 승인/거부 모달 */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={closeApprovalModal}
        onConfirm={handleApprovalConfirm}
        type={approvalModal.type}
        reservationNumber={approvalModal.reservation?.reservation_number || ''}
        customerName={approvalModal.reservation?.guest_name || ''}
      />

      {/* 예약 상세 모달 */}
      {detailModal.reservationId && (
        <ReservationDetailModal
          isOpen={detailModal.isOpen}
          onClose={closeDetailModal}
          reservationId={detailModal.reservationId}
          onReservationUpdate={handleReservationUpdate}
        />
      )}
      </div>
    </PageLayout>
  );
}
