'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Loading } from '@/src/components/ui';
import { vehicleModelService } from '@/src/lib/database';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Car,
  Calendar,
  Fuel,
  Settings,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  Image as ImageIcon
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

export default function VehicleModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = params.id as string;
  
  const [model, setModel] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (modelId) {
      loadModel();
    }
  }, [modelId]);

  const loadModel = async () => {
    try {
      setLoading(true);
      const data = await vehicleModelService.getById(modelId);
      if (data) {
        setModel(data);
      } else {
        alert('차량 모델을 찾을 수 없습니다.');
        router.push('/admin/vehicles/models');
      }
    } catch (error) {
      console.error('Failed to load vehicle model:', error);
      alert('차량 모델 로딩에 실패했습니다.');
      router.push('/admin/vehicles/models');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!model || !confirm('정말 이 차량 모델을 삭제하시겠습니까?')) return;
    
    try {
      setDeleting(true);
      await vehicleModelService.delete(model.id);
      alert('차량 모델이 삭제되었습니다.');
      router.push('/admin/vehicles/models');
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert('차량 모델 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <PageLayout
        title="차량 모델 상세보기"
        description="차량 모델 정보를 불러오는 중입니다"
      >
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (!model) {
    return (
      <PageLayout
        title="차량 모델을 찾을 수 없습니다"
        description="요청하신 차량 모델이 존재하지 않습니다"
      >
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle style={{ width: '4rem', height: '4rem', color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            차량 모델을 찾을 수 없습니다
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            요청하신 차량 모델이 삭제되었거나 존재하지 않습니다.
          </p>
          <Link href="/admin/vehicles/models">
            <Button variant="primary">
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              차량 모델 목록으로
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${model.brand} ${model.model}`}
      description={`${model.year}년형 • ${model.category || '미분류'} • ${getFuelTypeLabel(model.fuel_type)}`}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/vehicles/models">
            <Button variant="outline" size="sm">
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              목록으로
            </Button>
          </Link>
          <Link href={`/admin/vehicles/models/${model.id}/edit`}>
            <Button variant="primary" size="sm">
              <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              수정
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
          >
            {deleting ? (
              <Loading size="sm" />
            ) : (
              <>
                <Trash2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                삭제
              </>
            )}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* 이미지 및 기본 정보 */}
        <Card className="border border-gray-200 shadow-lg">
          <div style={{ padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              {/* 이미지 영역 */}
              <div style={{ 
                height: '400px', 
                backgroundColor: '#f3f4f6',
                position: 'relative',
                borderRadius: '0.5rem 0 0 0.5rem',
                overflow: 'hidden'
              }}>
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    <ImageIcon style={{ width: '4rem', height: '4rem', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>이미지 없음</p>
                  </div>
                )}
              </div>

              {/* 기본 정보 영역 */}
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>
                    {model.brand} {model.model}
                  </h1>
                  <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                    {model.year}년형
                  </p>
                </div>

                {/* 상세 사양 */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package style={{ width: '1.25rem', height: '1.25rem', color: '#0369a1' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>카테고리</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {model.category || '미분류'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: '#ecfdf5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Fuel style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>연료</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {getFuelTypeLabel(model.fuel_type)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: '#fef3c7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Settings style={{ width: '1.25rem', height: '1.25rem', color: '#d97706' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>변속기</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {getTransmissionLabel(model.transmission)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: '#ede9fe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>승차인원</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {model.passengers}명
                      </p>
                    </div>
                  </div>

                  {model.displacement && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#fee2e2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Car style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>배기량</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          {model.displacement.toLocaleString()}cc
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 요금 정보 */}
        <Card className="border border-gray-200 shadow-lg">
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <DollarSign style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
              요금 정보
            </h2>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '0.75rem',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                예상 일일 대여료
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#15803d', margin: 0 }}>
                {model.estimated_daily_rate.toLocaleString()}원
              </p>
              <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem' }}>
                * 실제 요금은 차량 등록 시 조정될 수 있습니다
              </p>
            </div>
          </div>
        </Card>

        {/* 옵션 정보 */}
        {model.features && model.features.length > 0 && (
          <Card className="border border-gray-200 shadow-lg">
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Package style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
                기본 옵션
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                {model.features.map((feature, index) => (
                  <div key={index} style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: '#10b981',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {getFeatureLabel(feature)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 등록 정보 */}
        <Card className="border border-gray-200 shadow-lg">
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              등록 정보
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  등록일시
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                  {new Date(model.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  최종 수정
                </p>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                  {new Date(model.updated_at).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                상태
              </p>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: model.is_active ? '#dcfce7' : '#fee2e2',
                color: model.is_active ? '#16a34a' : '#dc2626',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {model.is_active ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
