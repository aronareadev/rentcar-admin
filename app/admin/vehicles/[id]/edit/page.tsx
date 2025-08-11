'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, AlertCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input, Select, Loading } from '@/src/components/ui';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { vehicleService, vehicleBrandService, vehicleLocationService, vehicleCategoryService } from '@/src/lib/database';
import type { Database } from '@/src/lib/supabase';
import { Vehicle } from '@/src/types';
import Link from 'next/link';

// 공통 스타일
const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.25rem'
};

const sectionStyle = {
  padding: '1rem',
  backgroundColor: 'rgba(30, 64, 175, 0.02)',
  borderRadius: '0.5rem',
  border: '1px solid rgba(30, 64, 175, 0.1)',
  marginBottom: '1rem'
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'rgb(30, 64, 175)',
  margin: '0 0 0.75rem 0',
  paddingBottom: '0.375rem',
  borderBottom: '2px solid rgb(30, 64, 175)'
};

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

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    fuel_type: 'gasoline' as const,
    passengers: 5,
    transmission: 'automatic' as const,
    displacement: 0,
    mileage: 0,
    status: 'available' as const,
    location: '',
    daily_rate: 80000,
    weekly_rate: 0,
    monthly_rate: 0,
    category: '',
    last_inspection_date: new Date().toISOString().split('T')[0],
    features: [] as any[],
    images: [] as any[],
    insurance: {
      provider: '',
      policy_number: '',
      start_date: '',
      end_date: '',
      contact_person: '',
      contact_phone: ''
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        // 드롭다운 데이터 로드
        const [brandsData, locationsData, categoriesData] = await Promise.all([
          vehicleBrandService.getAll(),
          vehicleLocationService.getAll(),
          vehicleCategoryService.getAll()
        ]);
        
        setBrands(brandsData);
        setLocations(locationsData);
        setCategories(categoriesData);
        
        // 차량 데이터 로드
        const vehicleId = params?.id as string;
        if (!vehicleId) {
          setError('차량 ID가 없습니다.');
          return;
        }

        const data = await vehicleService.getById(vehicleId);
        if (data) {
          const transformedData = transformVehicleFromDB(data);
          setVehicle(transformedData);
          setFormData({
            vehicle_number: transformedData.vehicleNumber,
            brand: transformedData.brand,
            model: transformedData.model,
            year: transformedData.year,
            color: transformedData.color,
            fuel_type: transformedData.fuelType,
            passengers: transformedData.passengers,
            transmission: transformedData.transmission,
            displacement: transformedData.displacement || 0,
            mileage: transformedData.mileage,
            status: transformedData.status,
            location: transformedData.location,
            daily_rate: transformedData.dailyRate,
            weekly_rate: transformedData.weeklyRate || 0,
            monthly_rate: transformedData.monthlyRate || 0,
            category: transformedData.category,
            last_inspection_date: transformedData.lastInspectionDate ? transformedData.lastInspectionDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            features: transformedData.features || [],
            images: transformedData.images || [],
            insurance: transformedData.insurance || {
              provider: '',
              policy_number: '',
              start_date: '',
              end_date: '',
              contact_person: '',
              contact_phone: ''
            }
          });
        } else {
          setVehicle(null);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setVehicle(null);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [params?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, brand: e.target.value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, location: e.target.value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은 5MB보다 큰 파일입니다.`);
        return;
      }

      // 이미지 파일 확인
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은 이미지 파일이 아닙니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          url: event.target?.result as string,
          alt: file.name.split('.')[0],
          name: file.name,
          size: file.size
        };

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // FileList를 HTMLInputElement의 files처럼 처리
    const fakeEvent = {
      target: { files: files }
    } as any;
    
    handleImageUpload(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle_number || !formData.brand || !formData.model) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.daily_rate <= 0) {
      alert('일일 요금을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const vehicleId = params?.id as string;
      const updateData = {
        vehicle_number: formData.vehicle_number,
        brand: formData.brand || null,
        model: formData.model,
        year: formData.year,
        color: formData.color || null,
        fuel_type: formData.fuel_type,
        passengers: formData.passengers || 5,
        transmission: formData.transmission,
        displacement: formData.displacement || null,
        mileage: formData.mileage || 0,
        status: formData.status,
        location: formData.location || null,
        daily_rate: formData.daily_rate,
        weekly_rate: formData.weekly_rate > 0 ? formData.weekly_rate : null,
        monthly_rate: formData.monthly_rate > 0 ? formData.monthly_rate : null,
        category: formData.category || null,
        last_inspection_date: formData.last_inspection_date || null,
        features: formData.features && formData.features.length > 0 ? formData.features : null,
        images: formData.images && formData.images.length > 0 ? formData.images.map(img => ({
          url: img.url,
          alt: img.alt,
          name: img.name,
          size: img.size
        })) : null,
        insurance: Object.keys(formData.insurance).some(key => (formData.insurance as any)[key]) ? formData.insurance : null,
      };

      console.log('차량 수정 데이터:', updateData);
      
      await vehicleService.update(vehicleId, updateData);
      
      alert('차량 정보가 성공적으로 수정되었습니다.');
      router.push(`/admin/vehicles/${vehicleId}`);
    } catch (error) {
      console.error('차량 수정 실패:', error);
      alert(`차량 수정 중 오류가 발생했습니다: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageLayout title="차량 수정" description="차량 정보를 불러오는 중...">
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

  return (
    <PageLayout
      title="차량 수정"
      description={`${vehicle.brand} ${vehicle.model} (${vehicle.vehicleNumber}) 정보 수정`}
      actions={
        <Link href={`/admin/vehicles/${vehicle.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            상세보기로
          </Button>
        </Link>
      }
    >
      <Card className="border border-gray-200 shadow-lg">
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0rem' }}>
            {/* 기본 정보 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>기본 정보</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>
                    차량번호 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                  </label>
                  <Input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    placeholder="12가3456"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    브랜드 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                  </label>
                  <Select
                    name="brand"
                    value={formData.brand}
                    onChange={handleBrandChange}
                    required
                  >
                    <option value="">브랜드 선택</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={labelStyle}>
                    모델 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                  </label>
                  <Input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="그랜저"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>연식</label>
                  <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label style={labelStyle}>색상</label>
                  <Input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="검정"
                  />
                </div>

                <div>
                  <label style={labelStyle}>연료</label>
                  <Select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleInputChange}
                  >
                    <option value="gasoline">휘발유</option>
                    <option value="diesel">경유</option>
                    <option value="electric">전기</option>
                    <option value="hybrid">하이브리드</option>
                    <option value="lpg">LPG</option>
                  </Select>
                </div>

                <div>
                  <label style={labelStyle}>변속기</label>
                  <Select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                  >
                    <option value="automatic">자동</option>
                    <option value="manual">수동</option>
                    <option value="cvt">CVT</option>
                  </Select>
                </div>

                <div>
                  <label style={labelStyle}>배기량 (cc)</label>
                  <Input
                    type="number"
                    name="displacement"
                    value={formData.displacement}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label style={labelStyle}>주행거리 (km)</label>
                  <Input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label style={labelStyle}>승차인원</label>
                  <Input
                    type="number"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleInputChange}
                    min="1"
                    max="12"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* 비즈니스 정보 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>비즈니스 정보</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>위치</label>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleLocationChange}
                  >
                    <option value="">위치 선택</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={labelStyle}>카테고리</label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={labelStyle}>일일 요금 (원)</label>
                  <Input
                    type="number"
                    name="daily_rate"
                    value={formData.daily_rate}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="80000"
                  />
                </div>

                <div>
                  <label style={labelStyle}>주간 요금 (원)</label>
                  <Input
                    type="number"
                    name="weekly_rate"
                    value={formData.weekly_rate}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label style={labelStyle}>월간 요금 (원)</label>
                  <Input
                    type="number"
                    name="monthly_rate"
                    value={formData.monthly_rate}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="2000000"
                  />
                </div>

                <div>
                  <label style={labelStyle}>최근 점검일</label>
                  <Input
                    type="date"
                    name="last_inspection_date"
                    value={formData.last_inspection_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* 보험 정보 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>보험 정보</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>보험사</label>
                    <Input
                      type="text"
                      name="insurance.provider"
                      value={formData.insurance.provider}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, provider: e.target.value }
                      }))}
                      placeholder="삼성화재"
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>증권번호</label>
                    <Input
                      type="text"
                      name="insurance.policy_number"
                      value={formData.insurance.policy_number}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, policy_number: e.target.value }
                      }))}
                      placeholder="POL-2024-001"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>보험 시작일</label>
                    <Input
                      type="date"
                      name="insurance.start_date"
                      value={formData.insurance.start_date}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, start_date: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>보험 종료일</label>
                    <Input
                      type="date"
                      name="insurance.end_date"
                      value={formData.insurance.end_date}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, end_date: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>담당자</label>
                    <Input
                      type="text"
                      name="insurance.contact_person"
                      value={formData.insurance.contact_person}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, contact_person: e.target.value }
                      }))}
                      placeholder="홍길동"
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>연락처</label>
                    <Input
                      type="tel"
                      name="insurance.contact_phone"
                      value={formData.insurance.contact_phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, contact_phone: e.target.value }
                      }))}
                      placeholder="02-1234-5678"
                    />
                  </div>
              </div>
            </div>

            {/* 상태 정보 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>상태 정보</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>
                    차량 상태 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                  </label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="available">대여가능</option>
                    <option value="rented">대여중</option>
                    <option value="maintenance">정비중</option>
                    <option value="inactive">비활성</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* 차량 옵션/기능 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>차량 옵션/기능</h3>
              
              {/* 편의사양 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  marginBottom: '0.75rem',
                  paddingBottom: '0.25rem',
                  borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
                }}>편의사양</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.375rem' }}>
                  {[
                    { id: 'navigation', name: '네비게이션', category: 'convenience' },
                    { id: 'smart_key', name: '스마트키', category: 'convenience' },
                    { id: 'keyless_entry', name: '키리스 엔트리', category: 'convenience' },
                    { id: 'push_start', name: '원터치 시동', category: 'convenience' },
                    { id: 'auto_light', name: '오토라이트', category: 'convenience' },
                    { id: 'auto_wiper', name: '자동 와이퍼', category: 'convenience' },
                    { id: 'rain_sensor', name: '레인센서', category: 'convenience' },
                    { id: 'wireless_charging', name: '무선충전패드', category: 'convenience' },
                    { id: 'usb_port', name: 'USB포트', category: 'convenience' },
                    { id: 'bluetooth', name: '블루투스', category: 'convenience' },
                    { id: 'apple_carplay', name: '애플카플레이', category: 'convenience' },
                    { id: 'android_auto', name: '안드로이드오토', category: 'convenience' }
                  ].map((feature) => (
                    <label key={feature.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.2)';
                    }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.some(f => f.id === feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, { id: feature.id, name: feature.name, included: true }]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f.id !== feature.id)
                            }))
                          }
                        }}
                        style={{
                          width: '0.875rem',
                          height: '0.875rem',
                          accentColor: 'rgb(30, 64, 175)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                        {feature.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 시트/내장 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  marginBottom: '0.75rem',
                  paddingBottom: '0.25rem',
                  borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
                }}>시트/내장</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.375rem' }}>
                  {[
                    { id: 'leather_seat', name: '가죽시트', category: 'interior' },
                    { id: 'heated_seat', name: '열선시트', category: 'interior' },
                    { id: 'ventilated_seat', name: '통풍시트', category: 'interior' },
                    { id: 'memory_seat', name: '메모리시트', category: 'interior' },
                    { id: 'power_seat', name: '전동시트', category: 'interior' },
                    { id: 'lumbar_support', name: '럼버서포트', category: 'interior' },
                    { id: 'seat_massage', name: '시트마사지', category: 'interior' },
                    { id: 'premium_audio', name: '프리미엄 오디오', category: 'interior' },
                    { id: 'jbl_audio', name: 'JBL 사운드', category: 'interior' },
                    { id: 'bose_audio', name: 'Bose 사운드', category: 'interior' },
                    { id: 'ambient_light', name: '엠비언트 라이트', category: 'interior' },
                    { id: 'wood_trim', name: '우드 트림', category: 'interior' }
                  ].map((feature) => (
                    <label key={feature.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.2)';
                    }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.some(f => f.id === feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, { id: feature.id, name: feature.name, included: true }]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f.id !== feature.id)
                            }))
                          }
                        }}
                        style={{
                          width: '0.875rem',
                          height: '0.875rem',
                          accentColor: 'rgb(30, 64, 175)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                        {feature.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 안전사양 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  marginBottom: '0.75rem',
                  paddingBottom: '0.25rem',
                  borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
                }}>안전사양</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.375rem' }}>
                  {[
                    { id: 'blackbox', name: '블랙박스', category: 'safety' },
                    { id: 'rear_camera', name: '후방카메라', category: 'safety' },
                    { id: 'around_view', name: '어라운드뷰', category: 'safety' },
                    { id: 'parking_sensor', name: '주차센서', category: 'safety' },
                    { id: 'blind_spot', name: '사각지대경고', category: 'safety' },
                    { id: 'collision_warning', name: '충돌경고', category: 'safety' },
                    { id: 'emergency_brake', name: '자동긴급제동', category: 'safety' },
                    { id: 'lane_keeping', name: '차선유지보조', category: 'safety' },
                    { id: 'lane_change', name: '차선변경보조', category: 'safety' },
                    { id: 'adaptive_cruise', name: '어댑티브크루즈', category: 'safety' },
                    { id: 'smart_cruise', name: '스마트크루즈', category: 'safety' },
                    { id: 'highway_assist', name: '고속도로주행보조', category: 'safety' }
                  ].map((feature) => (
                    <label key={feature.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.2)';
                    }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.some(f => f.id === feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, { id: feature.id, name: feature.name, included: true }]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f.id !== feature.id)
                            }))
                          }
                        }}
                        style={{
                          width: '0.875rem',
                          height: '0.875rem',
                          accentColor: 'rgb(30, 64, 175)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                        {feature.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 외관사양 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  marginBottom: '0.75rem',
                  paddingBottom: '0.25rem',
                  borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
                }}>외관사양</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.375rem' }}>
                  {[
                    { id: 'sunroof', name: '선루프', category: 'exterior' },
                    { id: 'panoramic_roof', name: '파노라마루프', category: 'exterior' },
                    { id: 'led_headlight', name: 'LED 헤드라이트', category: 'exterior' },
                    { id: 'led_taillight', name: 'LED 테일라이트', category: 'exterior' },
                    { id: 'led_drl', name: 'LED 주간등', category: 'exterior' },
                    { id: 'fog_light', name: '안개등', category: 'exterior' },
                    { id: 'auto_headlight', name: '오토 헤드라이트', category: 'exterior' },
                    { id: 'hid_xenon', name: 'HID/제논', category: 'exterior' },
                    { id: 'alloy_wheel', name: '알로이 휠', category: 'exterior' },
                    { id: 'run_flat_tire', name: '런플랫 타이어', category: 'exterior' },
                    { id: 'roof_rail', name: '루프레일', category: 'exterior' },
                    { id: 'side_step', name: '사이드스텝', category: 'exterior' }
                  ].map((feature) => (
                    <label key={feature.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.2)';
                    }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.some(f => f.id === feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, { id: feature.id, name: feature.name, included: true }]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f.id !== feature.id)
                            }))
                          }
                        }}
                        style={{
                          width: '0.875rem',
                          height: '0.875rem',
                          accentColor: 'rgb(30, 64, 175)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                        {feature.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 공조시스템 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  marginBottom: '0.75rem',
                  paddingBottom: '0.25rem',
                  borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
                }}>공조시스템</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.375rem' }}>
                  {[
                    { id: 'dual_zone_ac', name: '듀얼존 에어컨', category: 'climate' },
                    { id: 'tri_zone_ac', name: '트라이존 에어컨', category: 'climate' },
                    { id: 'rear_ac', name: '뒷좌석 에어컨', category: 'climate' },
                    { id: 'auto_defog', name: '자동 김서림 제거', category: 'climate' },
                    { id: 'air_purifier', name: '공기청정기', category: 'climate' },
                    { id: 'ionizer', name: '이오나이저', category: 'climate' },
                    { id: 'pollen_filter', name: '꽃가루 필터', category: 'climate' },
                    { id: 'heated_steering', name: '열선 스티어링', category: 'climate' },
                    { id: 'heated_mirror', name: '열선 사이드미러', category: 'climate' },
                    { id: 'heated_windshield', name: '열선 앞유리', category: 'climate' },
                    { id: 'cooled_glove', name: '냉장 글로브박스', category: 'climate' },
                    { id: 'rear_heater', name: '뒷좌석 히터', category: 'climate' }
                  ].map((feature) => (
                    <label key={feature.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.2)';
                    }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.some(f => f.id === feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, { id: feature.id, name: feature.name, included: true }]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: prev.features.filter(f => f.id !== feature.id)
                            }))
                          }
                        }}
                        style={{
                          width: '0.875rem',
                          height: '0.875rem',
                          accentColor: 'rgb(30, 64, 175)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>
                        {feature.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 차량 이미지 업로드 섹션 */}
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>차량 이미지</h3>
              
              {/* 이미지 업로드 영역 */}
              <div 
                style={{
                  border: '2px dashed rgba(30, 64, 175, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  marginBottom: '1rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload-edit')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                  e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.02)';
                }}
              >
                <Upload style={{ width: '3rem', height: '3rem', color: 'rgb(30, 64, 175)', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  차량 이미지 업로드
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  클릭하거나 파일을 드래그하여 업로드하세요
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  지원 형식: JPG, PNG, GIF (최대 5MB)
                </p>
                
                <input
                  id="image-upload-edit"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {formData.images.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: 'rgb(30, 64, 175)', 
                    marginBottom: '0.75rem' 
                  }}>
                    업로드된 이미지 ({formData.images.length}개)
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {formData.images.map((image, index) => (
                      <div key={index} style={{ 
                        position: 'relative',
                        border: '1px solid rgba(30, 64, 175, 0.2)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        backgroundColor: 'white'
                      }}>
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover' 
                          }}
                        />
                        <div style={{ padding: '0.5rem' }}>
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#374151', 
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {image.name}
                          </p>
                          <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                            {(image.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageDelete(index)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '1.5rem',
                            height: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '2px solid rgba(30, 64, 175, 0.1)'
          }}>
            <Link href={`/admin/vehicles/${vehicle.id}`}>
              <Button variant="outline" type="button" size="lg">
                <X style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                취소
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading} size="lg">
              <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              {loading ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
        </form>
      </Card>
      
      {/* 로딩 오버레이 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Loading size="lg" />
            <span style={{ fontSize: '1rem', color: '#374151' }}>
              차량 정보를 수정하는 중...
            </span>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
