'use client';

import { useState, useEffect, useMemo } from 'react';
import { Car, AlertCircle, Clock, CheckCircle, XCircle, MapPin, Calendar, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Loading } from '@/src/components/ui/Loading';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { vehicleService } from '@/src/lib/database';
import type { Database } from '@/src/lib/supabase';
import { Vehicle } from '@/src/types';

// DB 데이터를 UI 타입으로 변환하는 함수
const transformVehicleFromDB = (dbVehicle: Database['public']['Tables']['vehicles']['Row']): Vehicle => {
  return {
    id: dbVehicle.id,
    vehicleNumber: dbVehicle.vehicle_number,
    brand: dbVehicle.brand || '',
    model: dbVehicle.model,
    year: dbVehicle.year,
    color: dbVehicle.color || '',
    fuelType: dbVehicle.fuel_type,
    passengers: dbVehicle.passengers,
    transmission: dbVehicle.transmission,
    displacement: dbVehicle.displacement || undefined,
    mileage: dbVehicle.mileage,
    status: dbVehicle.status,
    location: dbVehicle.location || '',
    lastInspectionDate: dbVehicle.last_inspection_date ? new Date(dbVehicle.last_inspection_date) : undefined,
    totalRentals: dbVehicle.total_rentals,
    totalRevenue: dbVehicle.total_revenue,
    dailyRate: dbVehicle.daily_rate,
    weeklyRate: dbVehicle.weekly_rate || undefined,
    monthlyRate: dbVehicle.monthly_rate || undefined,
    images: dbVehicle.images as any[] || [],
    features: dbVehicle.features as any[] || [],
    insurance: dbVehicle.insurance as any || {},
    category: dbVehicle.category || '',
    createdAt: new Date(dbVehicle.created_at),
    updatedAt: new Date(dbVehicle.updated_at),
  };
};

export default function VehicleStatusPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'mileage' | 'rentals'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // DB에서 차량 데이터 로드
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vehicleService.getAll();
        const transformedData = data.map(transformVehicleFromDB);
        setVehicles(transformedData);
      } catch (err) {
        console.error('차량 데이터 로드 실패:', err);
        setError('차량 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // 위치 목록
  const locations = Array.from(new Set(vehicles.map(v => v.location)));

  // 필터링 및 정렬된 차량 목록
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesLocation = selectedLocation === 'all' || vehicle.location === selectedLocation;
      const matchesStatus = selectedStatus === 'all' || vehicle.status === selectedStatus;
      const matchesSearch = searchQuery === '' || 
        vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesLocation && matchesStatus && matchesSearch;
    });

    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
          break;
        case 'date':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'mileage':
          comparison = a.mileage - b.mileage;
          break;
        case 'rentals':
          comparison = a.totalRentals - b.totalRentals;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [vehicles, selectedLocation, selectedStatus, searchQuery, sortBy, sortOrder]);

  // 상태별 통계
  const statusStats = {
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
  };

  // 상태별 색상 및 아이콘 (강화된 구별성)
  const getStatusConfig = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return {
          color: 'text-green-700 bg-green-50 border-green-300',
          cardBorder: 'border-l-4 border-l-green-500',
          cardBg: 'bg-gradient-to-r from-green-50 to-green-25',
          icon: CheckCircle,
          label: '대여가능',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'rented':
        return {
          color: 'text-blue-700 bg-blue-50 border-blue-300',
          cardBorder: 'border-l-4 border-l-blue-500',
          cardBg: 'bg-gradient-to-r from-blue-50 to-blue-25',
          icon: Car,
          label: '대여중',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'maintenance':
        return {
          color: 'text-orange-700 bg-orange-50 border-orange-300',
          cardBorder: 'border-l-4 border-l-orange-500',
          cardBg: 'bg-gradient-to-r from-orange-50 to-orange-25',
          icon: AlertCircle,
          label: '정비중',
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'inactive':
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-300',
          cardBorder: 'border-l-4 border-l-gray-400',
          cardBg: 'bg-gradient-to-r from-gray-50 to-gray-25',
          icon: XCircle,
          label: '비활성',
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-300',
          cardBorder: 'border-l-4 border-l-gray-400',
          cardBg: 'bg-gradient-to-r from-gray-50 to-gray-25',
          icon: Car,
          label: status,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: Vehicle['status']) => {
    try {
      // 실제 DB에서 차량 상태 변경
      await vehicleService.update(vehicleId, { status: newStatus });
      
      // 로컬 상태 업데이트
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.id === vehicleId 
            ? { ...vehicle, status: newStatus }
            : vehicle
        )
      );
      
      alert(`차량 상태가 ${getStatusConfig(newStatus).label}로 변경되었습니다.`);
    } catch (error) {
      console.error('차량 상태 변경 실패:', error);
      alert('차량 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <PageLayout
        title="차량 현황"
        description="실시간 차량 상태를 확인하고 관리하세요"
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
        title="차량 현황"
        description="실시간 차량 상태를 확인하고 관리하세요"
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
      title="차량 현황"
      description="실시간 차량 상태를 확인하고 관리하세요"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* 상태별 통계 카드 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <Card variant="bordered" padding="lg" hover>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>대여가능</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a', margin: '0.5rem 0 0 0' }}>
                  {statusStats.available}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  {vehicles.length > 0 ? Math.round((statusStats.available / vehicles.length) * 100) : 0}%
                </p>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#dcfce7', 
                borderRadius: '0.75rem',
                border: '1px solid #22c55e'
              }}>
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg" hover>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>대여중</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb', margin: '0.5rem 0 0 0' }}>
                  {statusStats.rented}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  {vehicles.length > 0 ? Math.round((statusStats.rented / vehicles.length) * 100) : 0}%
                </p>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#dbeafe', 
                borderRadius: '0.75rem',
                border: '1px solid #3b82f6'
              }}>
                <Car style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg" hover>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>정비중</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ea580c', margin: '0.5rem 0 0 0' }}>
                  {statusStats.maintenance}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  {vehicles.length > 0 ? Math.round((statusStats.maintenance / vehicles.length) * 100) : 0}%
                </p>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fed7aa', 
                borderRadius: '0.75rem',
                border: '1px solid #f97316'
              }}>
                <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#ea580c' }} />
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg" hover>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>비활성</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  {statusStats.inactive}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  {vehicles.length > 0 ? Math.round((statusStats.inactive / vehicles.length) * 100) : 0}%
                </p>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '0.75rem',
                border: '1px solid #cbd5e1'
              }}>
                <XCircle style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card variant="bordered" padding="lg">
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} style={{ color: '#64748b' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>필터 및 검색</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* 검색 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                차량 검색
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af' 
                }} />
                <input
                  type="text"
                  placeholder="차량번호, 브랜드, 모델 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 41, 59, 0.1)';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* 위치 필터 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                위치별 필터
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e293b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 41, 59, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">전체 위치</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* 상태 필터 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                상태별 필터
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e293b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 41, 59, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">전체 상태</option>
                <option value="available">대여가능</option>
                <option value="rented">대여중</option>
                <option value="maintenance">정비중</option>
                <option value="inactive">비활성</option>
              </select>
            </div>

            {/* 정렬 기준 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                정렬 기준
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'mileage' | 'rentals')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e293b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 41, 59, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="date">최신 업데이트순</option>
                <option value="name">차량명순</option>
                <option value="mileage">주행거리순</option>
                <option value="rentals">대여횟수순</option>
              </select>
            </div>

            {/* 정렬 순서 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                정렬 순서
              </label>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                leftIcon={sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {sortOrder === 'asc' ? '오름차순' : '내림차순'}
              </Button>
            </div>
          </div>

          {/* 필터 결과 표시 */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.75rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              총 <strong style={{ color: '#1f2937' }}>{filteredAndSortedVehicles.length}대</strong>의 차량이 검색되었습니다.
              {searchQuery && <span> (검색어: "{searchQuery}")</span>}
              {selectedLocation !== 'all' && <span> (위치: {selectedLocation})</span>}
              {selectedStatus !== 'all' && <span> (상태: {getStatusConfig(selectedStatus as Vehicle['status']).label})</span>}
            </p>
          </div>
        </Card>

        {/* 차량 상태 카드 목록 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
          gap: '1.5rem' 
        }}>
        {filteredAndSortedVehicles.map((vehicle) => {
          const statusConfig = getStatusConfig(vehicle.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div 
              key={vehicle.id} 
              className={`${statusConfig.cardBorder} ${statusConfig.cardBg}`}
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* 상태 표시 배지 (우상단) */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid'
              }} className={statusConfig.color}>
                {statusConfig.label}
              </div>

              {/* 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingRight: '5rem' }}>
                <div style={{ 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  marginRight: '1rem'
                }} className={statusConfig.bgColor}>
                  <StatusIcon size={24} className={statusConfig.iconColor} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '700', 
                    color: '#111827', 
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {vehicle.vehicleNumber}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
              </div>

              {/* 차량 정보 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <MapPin size={16} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>위치</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {vehicle.location}
                      </p>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Car size={16} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>타입</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {vehicle.category} • {vehicle.passengers}인승
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>주행거리</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      {vehicle.mileage.toLocaleString()}km
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>총 대여</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      {vehicle.totalRentals}회
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>일일요금</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      {vehicle.dailyRate.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {vehicle.lastInspectionDate && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#fffbeb',
                    borderRadius: '0.5rem',
                    border: '1px solid #fbbf24'
                  }}>
                    <Calendar size={16} style={{ color: '#d97706', marginRight: '0.5rem' }} />
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0 }}>최근 점검일</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', margin: 0 }}>
                        {vehicle.lastInspectionDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 상태 변경 버튼 */}
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                  상태 변경
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {vehicle.status !== 'available' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(vehicle.id, 'available')}
                      style={{ 
                        color: '#059669', 
                        borderColor: '#6ee7b7', 
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ecfdf5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      대여가능
                    </Button>
                  )}
                  {vehicle.status !== 'rented' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(vehicle.id, 'rented')}
                      style={{ 
                        color: '#2563eb', 
                        borderColor: '#93c5fd', 
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      대여중
                    </Button>
                  )}
                  {vehicle.status !== 'maintenance' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(vehicle.id, 'maintenance')}
                      style={{ 
                        color: '#ea580c', 
                        borderColor: '#fdba74', 
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff7ed';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      정비중
                    </Button>
                  )}
                  {vehicle.status !== 'inactive' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(vehicle.id, 'inactive')}
                      style={{ 
                        color: '#6b7280', 
                        borderColor: '#d1d5db', 
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      비활성
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* 빈 상태 */}
        {filteredAndSortedVehicles.length === 0 && (
          <Card className="p-12 text-center">
            <Car className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">차량이 없습니다</h3>
            <p className="text-gray-500">
              선택한 조건에 맞는 차량이 없습니다.
            </p>
          </Card>
        )}

        {/* 정비 알림 */}
        {vehicles.some(v => v.lastInspectionDate && 
          new Date().getTime() - v.lastInspectionDate.getTime() > 90 * 24 * 60 * 60 * 1000) && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">정비 점검 알림</h4>
                <p className="text-sm text-yellow-700">
                  90일 이상 점검하지 않은 차량이 있습니다. 정비 일정을 확인해주세요.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}


