'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, MapPin, Car, Calendar, Shield, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { Loading } from '@/src/components/ui/Loading';
import { vehicleService } from '@/src/lib/database';
import type { Database } from '@/src/lib/supabase';
import { Vehicle } from '@/src/types';
import Link from 'next/link';

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

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        const vehicleId = params?.id as string;
        
        if (!vehicleId) {
          setError('차량 ID가 없습니다.');
          return;
        }

        const data = await vehicleService.getById(vehicleId);
        if (data) {
          const transformedData = transformVehicleFromDB(data);
          setVehicle(transformedData);
        } else {
          setVehicle(null);
        }
      } catch (err) {
        console.error('차량 데이터 로드 실패:', err);
        setError('차량 데이터를 불러오는 중 오류가 발생했습니다.');
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [params?.id]);

  if (loading) {
    return (
      <PageLayout title="차량 상세 정보" description="차량 정보를 불러오는 중...">
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="오류가 발생했습니다">
        <Card variant="bordered" padding="lg">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              오류가 발생했습니다
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Button onClick={() => window.location.reload()} variant="primary">
                다시 시도
              </Button>
              <Link href="/admin/vehicles">
                <Button variant="outline">
                  <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  차량 목록으로
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </PageLayout>
    );
  }

  if (!vehicle) {
    return (
      <PageLayout title="차량을 찾을 수 없습니다">
        <Card variant="bordered" padding="lg">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Car style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              차량을 찾을 수 없습니다
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              요청하신 차량 정보가 존재하지 않습니다.
            </p>
            <Link href="/admin/vehicles">
              <Button variant="primary">
                <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                차량 목록으로
              </Button>
            </Link>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // 상태별 색상 매핑
  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      case 'rented': return { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' };
      case 'maintenance': return { bg: '#fed7aa', text: '#ea580c', border: '#f97316' };
      case 'inactive': return { bg: '#f1f5f9', text: '#6b7280', border: '#cbd5e1' };
      default: return { bg: '#f1f5f9', text: '#6b7280', border: '#cbd5e1' };
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

  const statusConfig = getStatusColor(vehicle.status);

  return (
    <PageLayout
      title={`${vehicle.brand} ${vehicle.model}`}
      description={`${vehicle.vehicleNumber} 차량의 상세 정보`}
      actions={
        <>
          <Link href="/admin/vehicles">
            <Button variant="outline" size="sm">
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              목록으로
            </Button>
          </Link>
          <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
            <Button variant="primary" size="sm">
              <Edit2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              수정
            </Button>
          </Link>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* 메인 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 차량 이미지 */}
          <Card variant="bordered" padding="lg">
            <div style={{ 
              width: '100%', 
              height: '20rem', 
              backgroundColor: '#f3f4f6',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0'
            }}>
              {vehicle.images.length > 0 ? (
                <img 
                  src={vehicle.images[0].url} 
                  alt={vehicle.images[0].alt}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: '0.75rem' 
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Car style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#6b7280' }}>이미지가 없습니다</p>
                </div>
              )}
            </div>
          </Card>

          {/* 기본 정보 */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-slate-800">기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>차량번호</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.vehicleNumber}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>브랜드</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.brand}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>모델</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.model}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>연식</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.year}년
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>색상</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.color}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>연료</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.fuelType === 'gasoline' ? '휘발유' : 
                     vehicle.fuelType === 'diesel' ? '경유' :
                     vehicle.fuelType === 'electric' ? '전기' : '하이브리드'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>승차인원</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.passengers}명
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>주행거리</label>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: '0.25rem 0 0 0' }}>
                    {vehicle.mileage.toLocaleString()}km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 요금 정보 */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-slate-800">요금 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>일일 요금</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    {vehicle.dailyRate.toLocaleString()}원
                  </p>
                </div>
                {vehicle.weeklyRate && (
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>주간 요금</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                      {vehicle.weeklyRate.toLocaleString()}원
                    </p>
                  </div>
                )}
                {vehicle.monthlyRate && (
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>월간 요금</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                      {vehicle.monthlyRate.toLocaleString()}원
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 상태 정보 */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-slate-800">현재 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: statusConfig.bg,
                border: `1px solid ${statusConfig.border}`,
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: statusConfig.text,
                  margin: 0
                }}>
                  {getStatusLabel(vehicle.status)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 위치 정보 */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-slate-800">위치 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
                <p style={{ fontSize: '1rem', color: '#111827', margin: 0 }}>
                  {vehicle.location}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 통계 정보 */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-slate-800">대여 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>총 대여 횟수</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    {vehicle.totalRentals}회
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>총 매출</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                    {(vehicle.totalRevenue / 10000).toFixed(0)}만원
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>평점</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star style={{ width: '1rem', height: '1rem', color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                      {(vehicle as any).rating ? (vehicle as any).rating.toFixed(1) : '4.5'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 최근 점검일 */}
          {vehicle.lastInspectionDate && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-slate-800">점검 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>최근 점검일</p>
                    <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {vehicle.lastInspectionDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
