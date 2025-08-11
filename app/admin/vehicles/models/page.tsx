'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { BrandModal } from '@/src/components/admin';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input, Select, Loading } from '@/src/components/ui';
import { vehicleModelService } from '@/src/lib/database';
import { isStorageUrl, deleteVehicleImage } from '@/src/lib/imageUpload';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Car,
  Image as ImageIcon,
  Calendar,
  Fuel,
  Settings,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string | null;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'automatic' | 'manual' | 'cvt';
  passengers: number;
  displacement: number | null;
  image: {
    url: string;
    alt: string;
    name: string;
    size: number;
    path?: string;
  } | null;
  features: string[] | null;
  estimated_daily_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function VehicleModelsPage() {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  
  // 필터 및 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // 정렬
  const [sortBy, setSortBy] = useState<'brand' | 'model' | 'year' | 'created_at' | 'estimated_daily_rate'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 데이터 로드
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await vehicleModelService.getAll();
      setModels(data);
    } catch (error) {
      console.error('Failed to load vehicle models:', error);
      alert('차량 모델 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모델 삭제
  const handleDeleteModel = async (id: string, imagePath?: string) => {
    if (!confirm('정말 이 차량 모델을 삭제하시겠습니까?')) return;
    
    try {
      setDeleting(id);
      
      // 이미지가 Storage에 있다면 삭제
      if (imagePath) {
        await deleteVehicleImage(imagePath);
      }
      
      // DB에서 모델 삭제
      await vehicleModelService.delete(id);
      
      // 로컬 상태 업데이트
      setModels(prev => prev.filter(model => model.id !== id));
      
      alert('차량 모델이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert('차량 모델 삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  // 필터링 및 정렬된 모델 목록
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch = searchQuery === '' || 
        model.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBrand = brandFilter === '' || model.brand === brandFilter;
      const matchesCategory = categoryFilter === '' || model.category === categoryFilter;
      const matchesFuel = fuelFilter === '' || model.fuel_type === fuelFilter;
      
      return matchesSearch && matchesBrand && matchesCategory && matchesFuel;
    });

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [models, searchQuery, brandFilter, categoryFilter, fuelFilter, sortBy, sortOrder]);

  // 고유 옵션들
  const uniqueBrands = Array.from(new Set(models.map(m => m.brand))).sort();
  const uniqueCategories = Array.from(new Set(models.map(m => m.category).filter(Boolean))).sort();
  const uniqueFuelTypes = Array.from(new Set(models.map(m => m.fuel_type))).sort();

  // 연료 타입 한글 변환
  const getFuelTypeLabel = (fuelType: string) => {
    const labels: {[key: string]: string} = {
      'gasoline': '휘발유',
      'diesel': '경유', 
      'electric': '전기',
      'hybrid': '하이브리드',
      'lpg': 'LPG'
    };
    return labels[fuelType] || fuelType;
  };

  // 변속기 한글 변환
  const getTransmissionLabel = (transmission: string) => {
    const labels: {[key: string]: string} = {
      'automatic': '자동',
      'manual': '수동',
      'cvt': 'CVT'
    };
    return labels[transmission] || transmission;
  };

  if (loading) {
    return (
      <PageLayout
        title="차량 모델 관리"
        description="등록된 차량 모델을 조회하고 관리하세요"
      >
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="차량 모델 관리"
      description={`총 ${models.length}개의 차량 모델이 등록되어 있습니다`}
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowBrandModal(true)}
            style={{
              borderColor: 'rgb(30, 64, 175)',
              color: 'rgb(30, 64, 175)'
            }}
          >
            <Building2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            제조사 등록
          </Button>
          <Link href="/admin/vehicles/models/bulk">
            <Button variant="primary" size="sm">
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              차량모델 일괄등록
            </Button>
          </Link>
        </div>
      }
    >
      <Card className="border border-gray-200 shadow-lg">
        <div style={{ padding: '1.5rem' }}>
          {/* 검색 및 필터 영역 */}
          <div style={{ marginBottom: '1.5rem' }}>
            {/* 검색바 */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '1rem', 
                  height: '1rem', 
                  color: '#6b7280' 
                }} />
                <Input
                  type="text"
                  placeholder="브랜드 또는 모델명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Filter style={{ width: '1rem', height: '1rem' }} />
                필터
                {showFilters ? 
                  <ChevronUp style={{ width: '1rem', height: '1rem' }} /> : 
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                }
              </Button>
            </div>

            {/* 필터 옵션들 */}
            {showFilters && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                    브랜드
                  </label>
                  <Select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
                    <option value="">전체</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                    카테고리
                  </label>
                  <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">전체</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category || ''}>{category || '미분류'}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                    연료
                  </label>
                  <Select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
                    <option value="">전체</option>
                    {uniqueFuelTypes.map(fuel => (
                      <option key={fuel} value={fuel}>{getFuelTypeLabel(fuel)}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                    정렬
                  </label>
                  <Select 
                    value={`${sortBy}_${sortOrder}`} 
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_');
                      setSortBy(field as any);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                  >
                    <option value="created_at_desc">최신 등록순</option>
                    <option value="created_at_asc">오래된 등록순</option>
                    <option value="brand_asc">브랜드 오름차순</option>
                    <option value="brand_desc">브랜드 내림차순</option>
                    <option value="model_asc">모델명 오름차순</option>
                    <option value="model_desc">모델명 내림차순</option>
                    <option value="year_desc">연식 최신순</option>
                    <option value="year_asc">연식 오래된순</option>
                    <option value="estimated_daily_rate_desc">요금 높은순</option>
                    <option value="estimated_daily_rate_asc">요금 낮은순</option>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* 결과 요약 */}
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '0.75rem 1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.5rem',
            border: '1px solid #0ea5e9'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
              <strong>{filteredAndSortedModels.length}개</strong>의 차량 모델이 검색되었습니다
              {searchQuery && ` (검색어: "${searchQuery}")`}
            </p>
          </div>

          {/* 모델 목록 */}
          {filteredAndSortedModels.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <Car style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#d1d5db' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {models.length === 0 ? '등록된 차량 모델이 없습니다' : '검색 결과가 없습니다'}
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {models.length === 0 
                  ? '차량모델 일괄등록을 통해 새로운 모델을 추가해보세요'
                  : '검색 조건을 변경하거나 필터를 초기화해보세요'
                }
              </p>
              {models.length === 0 && (
                <Link href="/admin/vehicles/models/bulk">
                  <Button variant="primary">
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    차량모델 일괄등록
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {filteredAndSortedModels.map((model) => (
                <div key={model.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {/* 이미지 영역 */}
                  <div style={{ height: '200px', position: 'relative', backgroundColor: '#f3f4f6' }}>
                    {model.image ? (
                      <img
                        src={model.image.url}
                        alt={model.image.alt}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                      }}>
                        <ImageIcon style={{ width: '3rem', height: '3rem' }} />
                      </div>
                    )}
                    
                    {/* 브랜드 뱃지 */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {model.brand}
                    </div>
                  </div>

                  {/* 정보 영역 */}
                  <div style={{ padding: '1rem' }}>
                    {/* 모델명 */}
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem',
                      color: '#111827'
                    }}>
                      {model.model}
                    </h3>

                    {/* 기본 정보 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{model.year}년</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Fuel style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getFuelTypeLabel(model.fuel_type)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Settings style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getTransmissionLabel(model.transmission)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{model.passengers}인승</span>
                      </div>
                    </div>

                    {/* 카테고리 */}
                    {model.category && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {model.category}
                        </span>
                      </div>
                    )}

                    {/* 예상 요금 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '0.5rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign style={{ width: '1rem', height: '1rem', color: '#16a34a' }} />
                        <span style={{ fontSize: '0.75rem', color: '#15803d' }}>일일 요금</span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#15803d' }}>
                        {model.estimated_daily_rate.toLocaleString()}원
                      </span>
                    </div>

                    {/* 액션 버튼들 */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/vehicles/models/${model.id}`} style={{ flex: 1 }}>
                        <Button variant="outline" size="sm" style={{ width: '100%' }}>
                          <Eye style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                          보기
                        </Button>
                      </Link>
                      
                      <Link href={`/admin/vehicles/models/${model.id}/edit`} style={{ flex: 1 }}>
                        <Button variant="outline" size="sm" style={{ width: '100%' }}>
                          <Edit style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                          수정
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModel(model.id, model.image?.path)}
                        disabled={deleting === model.id}
                        style={{ 
                          color: '#dc2626', 
                          borderColor: '#dc2626',
                          opacity: deleting === model.id ? 0.5 : 1
                        }}
                      >
                        {deleting === model.id ? (
                          <Loading size="sm" />
                        ) : (
                          <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 제조사 등록 모달 */}
      <BrandModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSuccess={() => {
          // 제조사 등록 성공 시 필요한 로직 (현재는 없음)
          console.log('Brand registered successfully');
        }}
      />
    </PageLayout>
  );
}
