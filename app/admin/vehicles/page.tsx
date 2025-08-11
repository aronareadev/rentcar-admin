'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Car, AlertCircle, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Select';
import { Input } from '@/src/components/ui/Input';
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

import Link from 'next/link';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('all');
  const [passengersFilter, setPassengersFilter] = useState<string>('all');
  const [transmissionFilter, setTransmissionFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // 필터링된 차량 목록
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || vehicle.category === categoryFilter;
      const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
      const matchesYear = yearFilter === 'all' || vehicle.year.toString() === yearFilter;
      const matchesFuelType = fuelTypeFilter === 'all' || vehicle.fuelType === fuelTypeFilter;
      const matchesPassengers = passengersFilter === 'all' || vehicle.passengers.toString() === passengersFilter;
      const matchesTransmission = transmissionFilter === 'all' || vehicle.transmission === transmissionFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesBrand && 
             matchesYear && matchesFuelType && matchesPassengers && matchesTransmission;
    });
  }, [vehicles, searchQuery, statusFilter, categoryFilter, brandFilter, yearFilter, 
      fuelTypeFilter, passengersFilter, transmissionFilter]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  // 상태별 색상 매핑
  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'text-green-700 bg-green-100 border border-green-200';
      case 'rented': return 'text-blue-700 bg-blue-100 border border-blue-200';
      case 'maintenance': return 'text-orange-700 bg-orange-100 border border-orange-200';
      case 'inactive': return 'text-gray-700 bg-gray-100 border border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border border-gray-200';
    }
  };

  // 상태 한글 변환
  const getStatusLabel = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return '대여가능';
      case 'rented': return '대여중';
      case 'maintenance': return '정비중';
      case 'inactive': return '비활성';
      default: return status;
    }
  };

  // 필터 옵션 목록
  const categories = Array.from(new Set(vehicles.map(v => v.category)));
  const brands = Array.from(new Set(vehicles.map(v => v.brand)));
  const years = Array.from(new Set(vehicles.map(v => v.year.toString()))).sort((a, b) => parseInt(b) - parseInt(a));
  const fuelTypes = Array.from(new Set(vehicles.map(v => v.fuelType)));
  const passengers = Array.from(new Set(vehicles.map(v => v.passengers.toString()))).sort((a, b) => parseInt(a) - parseInt(b));
  const transmissions = Array.from(new Set(vehicles.map(v => v.transmission)));

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    const confirmMessage = `정말로 "${vehicleName}" 차량을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    
    if (confirm(confirmMessage)) {
      try {
        // 실제 DB에서 차량 삭제
        await vehicleService.delete(vehicleId);
        
        // 로컬 상태에서 차량 제거
        setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleId));
        
        alert('차량이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('차량 삭제 실패:', error);
        alert('차량 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <PageLayout
        title="차량 관리"
        description="등록된 차량을 관리하고 상태를 모니터링하세요"
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
        title="차량 관리"
        description="등록된 차량을 관리하고 상태를 모니터링하세요"
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
      title="차량 관리"
      description="등록된 차량을 관리하고 상태를 모니터링하세요"
      actions={
        <>
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            필터
          </Button>
          <Link href="/admin/vehicles/new">
            <Button leftIcon={<Plus size={18} />}>
              차량 등록
            </Button>
          </Link>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(30, 41, 59, 0.02) 100%)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(30, 41, 59, 0.1)',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 41, 59, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(30, 41, 59, 0.05)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>전체 차량</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0.5rem 0 0 0' }}>{vehicles.length}</p>
            </div>
            <div style={{ 
              padding: '1rem', 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.05) 0%, rgba(51, 65, 85, 0.08) 100%)', 
              borderRadius: '0.75rem',
              border: '1px solid rgba(30, 41, 59, 0.1)'
            }}>
              <Car style={{ width: '1.5rem', height: '1.5rem', color: '#475569' }} />
            </div>
          </div>
        </div>

        <Card variant="bordered" padding="lg" hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>대여가능</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a', margin: '0.5rem 0 0 0' }}>
                {vehicles.filter(v => v.status === 'available').length}
              </p>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#dcfce7', 
              borderRadius: '0.75rem',
              border: '1px solid #22c55e'
            }}>
              <Car style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg" hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: 0 }}>대여중</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb', margin: '0.5rem 0 0 0' }}>
                {vehicles.filter(v => v.status === 'rented').length}
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
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626', margin: '0.5rem 0 0 0' }}>
                {vehicles.filter(v => v.status === 'maintenance').length}
              </p>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fecaca', 
              borderRadius: '0.75rem',
              border: '1px solid #ef4444'
            }}>
              <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} />
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card variant="bordered" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 검색 및 토글 헤더 */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder="차량번호, 브랜드, 모델로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              style={{ 
                minWidth: '110px',
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem'
              }}
            >
              필터 {showFilters ? '닫기' : '열기'}
            </Button>
          </div>

          {/* 필터 그리드 - 토글 가능 */}
          {showFilters && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem',
              transition: 'all 0.3s ease'
            }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="상태"
            >
              <option value="all">전체 상태</option>
              <option value="available">대여가능</option>
              <option value="rented">대여중</option>
              <option value="maintenance">정비중</option>
              <option value="inactive">비활성</option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="카테고리"
            >
              <option value="all">전체 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>

            <Select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              placeholder="브랜드"
            >
              <option value="all">전체 브랜드</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </Select>

            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="연식"
            >
              <option value="all">전체 연식</option>
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </Select>

            <Select
              value={fuelTypeFilter}
              onChange={(e) => setFuelTypeFilter(e.target.value)}
              placeholder="연료타입"
            >
              <option value="all">전체 연료</option>
              {fuelTypes.map(fuelType => (
                <option key={fuelType} value={fuelType}>
                  {fuelType === 'gasoline' ? '가솔린' : 
                   fuelType === 'diesel' ? '디젤' : 
                   fuelType === 'hybrid' ? '하이브리드' : 
                   fuelType === 'electric' ? '전기' : fuelType}
                </option>
              ))}
            </Select>

            <Select
              value={passengersFilter}
              onChange={(e) => setPassengersFilter(e.target.value)}
              placeholder="승차인원"
            >
              <option value="all">전체 인원</option>
              {passengers.map(passenger => (
                <option key={passenger} value={passenger}>{passenger}인승</option>
              ))}
            </Select>

            <Select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              placeholder="변속기"
            >
              <option value="all">전체 변속기</option>
              {transmissions.map(transmission => (
                <option key={transmission} value={transmission}>
                  {transmission === 'automatic' ? '자동' : 
                   transmission === 'manual' ? '수동' : transmission}
                </option>
              ))}
            </Select>
            </div>
          )}

          {/* 필터 상태 표시 및 초기화 */}
          {(statusFilter !== 'all' || categoryFilter !== 'all' || brandFilter !== 'all' || 
            yearFilter !== 'all' || fuelTypeFilter !== 'all' || passengersFilter !== 'all' || 
            transmissionFilter !== 'all' || searchQuery) && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: 'rgba(30, 41, 59, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(30, 41, 59, 0.1)',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                  활성 필터:
                </span>
                {searchQuery && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    "{searchQuery}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {getStatusLabel(statusFilter as any)}
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {categoryFilter}
                  </span>
                )}
                {brandFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {brandFilter}
                  </span>
                )}
                {yearFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {yearFilter}년
                  </span>
                )}
                {fuelTypeFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {fuelTypeFilter === 'gasoline' ? '가솔린' : 
                     fuelTypeFilter === 'diesel' ? '디젤' : 
                     fuelTypeFilter === 'hybrid' ? '하이브리드' : 
                     fuelTypeFilter === 'electric' ? '전기' : fuelTypeFilter}
                  </span>
                )}
                {passengersFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {passengersFilter}인승
                  </span>
                )}
                {transmissionFilter !== 'all' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    {transmissionFilter === 'automatic' ? '자동' : 
                     transmissionFilter === 'manual' ? '수동' : transmissionFilter}
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setBrandFilter('all');
                  setYearFilter('all');
                  setFuelTypeFilter('all');
                  setPassengersFilter('all');
                  setTransmissionFilter('all');
                  setCurrentPage(1);
                }}
                style={{ color: '#dc2626' }}
              >
                전체 초기화
              </Button>
            </div>
          )}

          {/* 결과 카운트 */}
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#64748b', 
            fontWeight: '500',
            textAlign: 'center',
            padding: '0.25rem 0'
          }}>
            총 {vehicles.length}개 차량 중 {filteredVehicles.length}개 표시
          </div>
        </div>
      </Card>

      {/* 차량 목록 테이블 */}
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
                    위치
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
                    요금
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
                    통계
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
                {paginatedVehicles.map((vehicle, index) => (
                  <tr 
                    key={vehicle.id} 
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flexShrink: 0, width: '4rem', height: '3rem' }}>
                          {vehicle.images.length > 0 ? (
                            <img
                              src={vehicle.images[0].url}
                              alt={vehicle.images[0].alt}
                              style={{ 
                                width: '4rem', 
                                height: '3rem', 
                                objectFit: 'cover', 
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0'
                              }}
                            />
                          ) : (
                            <div style={{ 
                              width: '4rem', 
                              height: '3rem', 
                              backgroundColor: '#f3f4f6', 
                              borderRadius: '0.5rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              border: '1px solid #e2e8f0'
                            }}>
                              <Car style={{ width: '1.5rem', height: '1.5rem', color: '#9ca3af' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ marginLeft: '0.75rem' }}>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#111827',
                            marginBottom: '0.125rem'
                          }}>
                            {vehicle.vehicleNumber}
                          </div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#6b7280',
                            marginBottom: '0.125rem'
                          }}>
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280'
                          }}>
                            {vehicle.category} • {vehicle.color}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        border: '1px solid'
                      }} className={getStatusColor(vehicle.status)}>
                        {getStatusLabel(vehicle.status)}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      {vehicle.location}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div style={{ marginBottom: '0.125rem' }}>
                        일일: {vehicle.dailyRate.toLocaleString()}원
                      </div>
                      {vehicle.weeklyRate && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280'
                        }}>
                          주간: {vehicle.weeklyRate.toLocaleString()}원
                        </div>
                      )}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <div style={{ marginBottom: '0.125rem' }}>
                        대여: {vehicle.totalRentals}회
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280'
                      }}>
                        매출: {(vehicle.totalRevenue / 10000).toFixed(0)}만원
                      </div>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                        <Link href={`/admin/vehicles/${vehicle.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            leftIcon={<Eye size={14} />}
                          >
                            보기
                          </Button>
                        </Link>
                        <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            leftIcon={<Edit2 size={14} />}
                          >
                            수정
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model} (${vehicle.vehicleNumber})`)}
                          leftIcon={<Trash2 size={14} />}
                          style={{ color: '#dc2626' }}
                        >
                          삭제
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
                      {Math.min(startIndex + itemsPerPage, filteredVehicles.length)}
                    </span>
                    {' / '}
                    <span className="font-medium">{filteredVehicles.length}</span>
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
      {filteredVehicles.length === 0 && (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">차량이 없습니다</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || 
                brandFilter !== 'all' || yearFilter !== 'all' || fuelTypeFilter !== 'all' || 
                passengersFilter !== 'all' || transmissionFilter !== 'all')
                ? '검색 조건에 맞는 차량이 없습니다. 다른 조건으로 검색해보세요.'
                : '첫 번째 차량을 등록하여 관리를 시작해보세요.'}
            </p>
            <Link href="/admin/vehicles/new">
              <Button leftIcon={<Plus size={18} />}>
                차량 등록
              </Button>
            </Link>
          </div>
        </Card>
      )}
      </div>
    </PageLayout>
  );
}
