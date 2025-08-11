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
  Building2,
  X,
  Package
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
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
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

  // 옵션 한글 변환
  const getFeatureLabel = (feature: string) => {
    const labels: {[key: string]: string} = {
      'navigation': '네비게이션',
      'blackbox': '블랙박스',
      'rear_camera': '후방카메라',
      'smart_key': '스마트키',
      'leather_seat': '가죽시트',
      'heated_seat': '열선시트',
      'sunroof': '선루프',
      'led_headlight': 'LED 헤드라이트',
      'adaptive_cruise': '어댑티브크루즈',
      'lane_keeping': '차선유지보조'
    };
    return labels[feature] || feature;
  };

  // 모달 열기
  const handleViewDetail = (model: VehicleModel) => {
    setSelectedModel(model);
    setShowDetailModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedModel(null), 300); // 애니메이션 후 상태 정리
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
                <input
                  type="text"
                  placeholder="브랜드 또는 모델명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgb(30, 64, 175)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      (e.target as HTMLInputElement).style.borderColor = 'rgba(30, 64, 175, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                    }
                  }}
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
              {filteredAndSortedModels.map((model, index) => (
                <div 
                  key={model.id} 
                  onClick={() => handleViewDetail(model)}
                  style={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    animationDelay: `${index * 0.1}s`,
                    animation: 'cardShuffle 0.6s ease-out forwards',
                    opacity: 0,
                    transform: 'translateY(30px) rotateX(15deg)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.03) rotateY(2deg)';
                    e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  {/* 이미지 영역 */}
                  <div style={{ 
                    height: '220px', 
                    position: 'relative', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    overflow: 'hidden'
                  }}>
                    {model.image ? (
                      <>
                        <img
                          src={model.image.url}
                          alt={model.image.alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        {/* 이미지 오버레이 효과 */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.05) 100%)'
                        }} />
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        color: '#64748b'
                      }}>
                        <ImageIcon style={{ width: '2.5rem', height: '2.5rem' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>이미지 없음</span>
                      </div>
                    )}
                    
                    {/* 브랜드 뱃지 */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                      color: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      {model.brand}
                    </div>

                    {/* 활성 상태 인디케이터 */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '0.75rem',
                      height: '0.75rem',
                      backgroundColor: model.is_active ? '#10b981' : '#ef4444',
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }} />
                  </div>

                  {/* 정보 영역 */}
                  <div style={{ padding: '1.25rem' }}>
                    {/* 모델명과 카테고리 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        lineHeight: '1.2',
                        flex: 1
                      }}>
                        {model.model}
                      </h3>
                      
                      {model.category && (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                          color: '#0369a1',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          border: '1px solid #bae6fd',
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          marginLeft: '0.5rem'
                        }}>
                          {model.category}
                        </span>
                      )}
                    </div>

                    {/* 기본 정보 */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '0.75rem', 
                      marginBottom: '1.25rem',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          padding: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>{model.year}년</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          padding: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Fuel style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>{getFuelTypeLabel(model.fuel_type)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          padding: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Settings style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>{getTransmissionLabel(model.transmission)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          padding: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Users style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>{model.passengers}인승</span>
                      </div>
                    </div>

                    {/* 예상 요금 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, rgb(30, 64, 175) 0%, rgb(59, 130, 246) 100%)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(30, 64, 175, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* 배경 패턴 */}
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                      }} />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          padding: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <DollarSign style={{ width: '1rem', height: '1rem', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                          예상 일일요금
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', zIndex: 1 }}>
                        <span style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}>
                          {model.estimated_daily_rate.toLocaleString()}
                        </span>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          color: 'rgba(255, 255, 255, 0.8)',
                          marginLeft: '0.25rem'
                        }}>
                          원
                        </span>
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <Link href={`/admin/vehicles/models/${model.id}/edit`} style={{ flex: 1 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            width: '100%',
                            borderColor: '#e2e8f0',
                            color: '#475569',
                            backgroundColor: 'white',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.borderColor = '#0ea5e9';
                            e.currentTarget.style.color = '#0ea5e9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#475569';
                          }}
                        >
                          <Edit style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                          수정
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModel(model.id, model.image?.path);
                        }}
                        disabled={deleting === model.id}
                        style={{ 
                          borderColor: deleting === model.id ? '#fca5a5' : '#fee2e2',
                          color: deleting === model.id ? '#dc2626' : '#ef4444',
                          backgroundColor: deleting === model.id ? '#fef2f2' : 'white',
                          opacity: deleting === model.id ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: '2.5rem'
                        }}
                        onMouseEnter={(e) => {
                          if (!deleting) {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.borderColor = '#fca5a5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!deleting) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#fee2e2';
                          }
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

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes cardShuffle {
          0% {
            opacity: 0;
            transform: translateY(30px) rotateX(15deg);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-5px) rotateX(5deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        @keyframes modalOpen {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalClose {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
        }

        @keyframes backdropOpen {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      {/* 제조사 등록 모달 */}
      <BrandModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSuccess={() => {
          console.log('Brand registered successfully');
        }}
      />

      {/* 차량 모델 상세보기 모달 */}
      {showDetailModal && selectedModel && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            animation: 'backdropOpen 0.3s ease-out'
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: showDetailModal ? 'modalOpen 0.3s ease-out' : 'modalClose 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div style={{
              backgroundColor: 'rgb(30, 64, 175)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car style={{ width: '1.25rem', height: '1.25rem' }} />
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {selectedModel.brand} {selectedModel.model}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <X style={{ width: '1rem', height: '1rem', color: 'white' }} />
              </button>
            </div>

            {/* 모달 컨텐츠 */}
            <div style={{ 
              padding: '1rem',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {/* 차량 이미지 - 한 열에 크게 */}
                <div style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgb(30, 64, 175)',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.25rem',
                    borderBottom: '1px solid rgba(30, 64, 175, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}>
                    <ImageIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                    차량 이미지
                  </h3>
                  
                  {/* 차량 이미지 - 한 열 전체 */}
                  <div style={{ 
                    height: '220px', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                  }}>
                    {selectedModel.image ? (
                      <img
                        src={selectedModel.image.url}
                        alt={selectedModel.image.alt}
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
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                      }}>
                        <ImageIcon style={{ width: '3rem', height: '3rem', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>이미지 없음</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 기본 정보 - 컴팩트 */}
                <div style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgb(30, 64, 175)',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.25rem',
                    borderBottom: '1px solid rgba(30, 64, 175, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}>
                    <Car style={{ width: '0.875rem', height: '0.875rem' }} />
                    차량 정보
                  </h3>
                  
                  {/* 차량명과 카테고리 */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h4 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      marginBottom: '0.25rem',
                      color: '#111827'
                    }}>
                      {selectedModel.brand} {selectedModel.model}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {selectedModel.year}년형 • {selectedModel.category || '미분류'}
                    </p>
                  </div>

                  {/* 상세 사양 - 4열 그리드 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <Fuel style={{ width: '0.875rem', height: '0.875rem', color: 'rgb(30, 64, 175)', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>연료</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>
                        {getFuelTypeLabel(selectedModel.fuel_type)}
                      </p>
                    </div>

                    <div style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <Settings style={{ width: '0.875rem', height: '0.875rem', color: 'rgb(30, 64, 175)', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>변속기</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>
                        {getTransmissionLabel(selectedModel.transmission)}
                      </p>
                    </div>

                    <div style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <Users style={{ width: '0.875rem', height: '0.875rem', color: 'rgb(30, 64, 175)', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>승차인원</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>
                        {selectedModel.passengers}명
                      </p>
                    </div>

                    {selectedModel.displacement && (
                      <div style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        padding: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <Car style={{ width: '0.875rem', height: '0.875rem', color: 'rgb(30, 64, 175)', margin: '0 auto 0.25rem' }} />
                        <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: 0 }}>배기량</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: '500', margin: 0 }}>
                          {selectedModel.displacement.toLocaleString()}cc
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 요금 정보와 옵션 정보를 한 줄에 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  {/* 요금 정보 - 컴팩트 */}
                  <div style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.02)',
                    border: '1px solid rgba(30, 64, 175, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'rgb(30, 64, 175)',
                      marginBottom: '0.5rem',
                      paddingBottom: '0.25rem',
                      borderBottom: '1px solid rgba(30, 64, 175, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <DollarSign style={{ width: '0.875rem', height: '0.875rem' }} />
                      요금 정보
                    </h3>
                    
                    <div style={{
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, rgb(30, 64, 175) 0%, rgb(59, 130, 246) 100%)',
                      borderRadius: '0.375rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.25rem' }}>
                        예상 일일 대여료
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: 'white', margin: 0 }}>
                        {selectedModel.estimated_daily_rate.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {/* 옵션 정보 - 컴팩트 */}
                  {selectedModel.features && selectedModel.features.length > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(30, 64, 175, 0.02)',
                      border: '1px solid rgba(30, 64, 175, 0.1)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem'
                    }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'rgb(30, 64, 175)',
                        marginBottom: '0.5rem',
                        paddingBottom: '0.25rem',
                        borderBottom: '1px solid rgba(30, 64, 175, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <Package style={{ width: '0.875rem', height: '0.875rem' }} />
                        기본 옵션
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.375rem'
                      }}>
                        {selectedModel.features.map((feature, index) => (
                          <span key={index} style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            fontSize: '0.625rem',
                            fontWeight: '500',
                            color: '#374151',
                            whiteSpace: 'nowrap'
                          }}>
                            {getFeatureLabel(feature)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 등록 정보 - 컴팩트 */}
                <div style={{
                  backgroundColor: 'rgba(30, 64, 175, 0.02)',
                  border: '1px solid rgba(30, 64, 175, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgb(30, 64, 175)',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.25rem',
                    borderBottom: '1px solid rgba(30, 64, 175, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}>
                    <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                    등록 정보
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        등록일시
                      </p>
                      <p style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                        {new Date(selectedModel.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        최종 수정
                      </p>
                      <p style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                        {new Date(selectedModel.updated_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        상태
                      </p>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: selectedModel.is_active ? '#dcfce7' : '#fee2e2',
                        color: selectedModel.is_active ? '#16a34a' : '#dc2626',
                        borderRadius: '0.75rem',
                        fontSize: '0.625rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        {selectedModel.is_active ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              borderTop: '2px solid rgba(30, 64, 175, 0.1)',
              padding: '0.75rem 1rem'
            }}>
              <Button variant="outline" onClick={handleCloseModal}>
                닫기
              </Button>
              <Link href={`/admin/vehicles/models/${selectedModel.id}/edit`}>
                <Button variant="primary">
                  <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  수정
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
