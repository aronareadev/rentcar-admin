'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/src/components/admin/PageLayout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input, Select, Loading } from '@/src/components/ui';
import { vehicleModelService } from '@/src/lib/database';
import { uploadVehicleImage, isBase64Url } from '@/src/lib/imageUpload';
import { ArrowLeft, Save, Plus, Trash2, Upload, Image as ImageIcon, Car } from 'lucide-react';
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

interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'automatic' | 'manual' | 'cvt';
  passengers: number;
  displacement?: number;
  image?: {
    url: string;
    alt: string;
    name: string;
    size: number;
  };
  features: string[];
  estimated_daily_rate: number;
}

export default function BulkVehicleModelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 이미지 폴더 업로드 관련 상태
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: File}>({})
  const [showImageMatcher, setShowImageMatcher] = useState(false)
  const [suggestedModels, setSuggestedModels] = useState<any[]>([])
  const [allFiles, setAllFiles] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  
  // 한번에 15개 모델까지 등록 가능
  const [models, setModels] = useState<VehicleModel[]>(
    Array.from({ length: 15 }, (_, index) => ({
      id: `model-${index}`,
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      category: '',
      fuel_type: 'gasoline' as const,
      transmission: 'automatic' as const,
      passengers: 5,
      displacement: 0,
      features: [],
      estimated_daily_rate: 80000
    }))
  );

  const handleModelChange = (index: number, field: keyof VehicleModel, value: any) => {
    setModels(prev => prev.map((model, i) => 
      i === index ? { ...model, [field]: value } : model
    ));
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name}은 10MB보다 큰 파일입니다.`);
      return;
    }

    // 이미지 파일 확인
    if (!file.type.startsWith('image/')) {
      alert(`${file.name}은 이미지 파일이 아닙니다.`);
      return;
    }

    try {
      // 로딩 상태 표시를 위해 임시 이미지 설정
      const tempImage = {
        url: 'uploading...',
        alt: file.name.split('.')[0],
        name: file.name,
        size: file.size,
        uploading: true
      };
      handleModelChange(index, 'image', tempImage);

      // Supabase Storage에 업로드
      const model = models[index];
      const result = await uploadVehicleImage(
        file,
        model.brand || '현대',
        model.model || `모델${index + 1}`
      );

      if (result) {
        const newImage = {
          url: result.url,
          alt: file.name.split('.')[0],
          name: file.name,
          size: file.size,
          path: result.path
        };
        handleModelChange(index, 'image', newImage);
      } else {
        alert('이미지 업로드에 실패했습니다.');
        handleModelChange(index, 'image', undefined);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      handleModelChange(index, 'image', undefined);
    }
  };

  const handleImageDelete = (index: number) => {
    handleModelChange(index, 'image', undefined);
  };

  const handleFeatureToggle = (modelIndex: number, featureId: string, featureName: string) => {
    setModels(prev => prev.map((model, i) => {
      if (i !== modelIndex) return model;
      
      const hasFeature = model.features.some(f => f === featureId);
      if (hasFeature) {
        return { ...model, features: model.features.filter(f => f !== featureId) };
      } else {
        return { ...model, features: [...model.features, featureId] };
      }
    }));
  };

  // 이미지 폴더 업로드 핸들러
  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    setAllFiles(imageFiles);
    
    // 기본적으로 첫 15개 파일 선택
    const defaultSelected = new Set(
      imageFiles.slice(0, 15).map(file => file.name)
    );
    setSelectedFiles(defaultSelected);
    
    setShowImageMatcher(true);
  };

  // 선택된 파일들을 기반으로 모델 제안 생성
  const generateSuggestions = () => {
    const selectedFilesList = allFiles.filter(file => selectedFiles.has(file.name));
    
    const suggestions = selectedFilesList.map(file => {
      const fileName = file.name.toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const suggestion = suggestModelFromFileName(fileName);
      return {
        fileName,
        file: file,
        ...suggestion
      };
    });
    
    return suggestions;
  };

  // 파일 선택/해제 핸들러
  const handleFileToggle = (fileName: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      if (newSelected.size < 15) {
        newSelected.add(fileName);
      } else {
        alert('최대 15개 파일까지만 선택할 수 있습니다.');
        return;
      }
    }
    setSelectedFiles(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedFiles.size === Math.min(allFiles.length, 15)) {
      setSelectedFiles(new Set());
    } else {
      const newSelected = new Set(
        allFiles.slice(0, 15).map(file => file.name)
      );
      setSelectedFiles(newSelected);
    }
  };

  // 파일명을 그대로 모델명으로 사용하는 함수
  const suggestModelFromFileName = (fileName: string) => {
    // 파일명을 정리 (특수문자 제거, 공백 정리)
    let cleanFileName = fileName
      .replace(/[_-]/g, ' ') // 언더스코어, 하이픈을 공백으로
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim(); // 앞뒤 공백 제거

    // 한글 "더뉴"를 영어 "the new"로 변환된 경우 다시 한글로
    cleanFileName = cleanFileName
      .replace(/the\s*new/gi, '더뉴')
      .replace(/new/gi, '뉴')
      .trim();

    // 파일명 기반으로 카테고리와 연료 타입 추정
    const lowerFileName = cleanFileName.toLowerCase();
    let category = 'SUV'; // 기본 카테고리
    let fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg' = 'gasoline';
    let estimatedRate = 80000;

    // 전기차 키워드 체크
    if (lowerFileName.includes('전기') || 
        lowerFileName.includes('electric') || 
        lowerFileName.includes('ev') ||
        lowerFileName.includes('아이오닉') ||
        lowerFileName.includes('ioniq')) {
      category = '전기차';
      fuelType = 'electric';
      estimatedRate = 120000;
    }
    // SUV 키워드 체크
    else if (lowerFileName.includes('suv') || 
             lowerFileName.includes('투싼') || 
             lowerFileName.includes('싼타페') || 
             lowerFileName.includes('베뉴') ||
             lowerFileName.includes('코나')) {
      category = 'SUV';
      estimatedRate = 90000;
    }
    // 대형차 키워드 체크
    else if (lowerFileName.includes('그랜저') || 
             lowerFileName.includes('제네시스') ||
             lowerFileName.includes('g90') ||
             lowerFileName.includes('g80')) {
      category = '대형';
      estimatedRate = 130000;
    }
    // 중형차 키워드 체크
    else if (lowerFileName.includes('쏘나타') || 
             lowerFileName.includes('sonata') ||
             lowerFileName.includes('k5')) {
      category = '중형';
      estimatedRate = 90000;
    }
    // 소형차 키워드 체크
    else if (lowerFileName.includes('아반떼') || 
             lowerFileName.includes('avante') ||
             lowerFileName.includes('k3') ||
             lowerFileName.includes('카스퍼')) {
      category = '소형';
      estimatedRate = 70000;
    }
    // 승합차 키워드 체크
    else if (lowerFileName.includes('스타리아') || 
             lowerFileName.includes('starex') ||
             lowerFileName.includes('카니발')) {
      category = '승합';
      estimatedRate = 140000;
    }

    // 파일명에서 브랜드 추정
    let brand = '현대'; // 기본값

    // 브랜드별 특징적 모델명으로 브랜드 추정
    if (lowerFileName.includes('k3') || 
        lowerFileName.includes('k5') || 
        lowerFileName.includes('k7') || 
        lowerFileName.includes('k8') || 
        lowerFileName.includes('k9') ||
        lowerFileName.includes('스포티지') ||
        lowerFileName.includes('쏘렌토') ||
        lowerFileName.includes('모하비') ||
        lowerFileName.includes('카니발')) {
      brand = '기아';
    }
    else if (lowerFileName.includes('sm3') || 
             lowerFileName.includes('sm5') || 
             lowerFileName.includes('sm6') || 
             lowerFileName.includes('qm6') ||
             lowerFileName.includes('xm3')) {
      brand = '르노삼성';
    }
    else if (lowerFileName.includes('tivoli') || 
             lowerFileName.includes('korando') || 
             lowerFileName.includes('rexton') ||
             lowerFileName.includes('티볼리') ||
             lowerFileName.includes('코란도') ||
             lowerFileName.includes('렉스턴')) {
      brand = '쌍용';
    }
    else if (lowerFileName.includes('a3') || 
             lowerFileName.includes('a4') || 
             lowerFileName.includes('a5') || 
             lowerFileName.includes('a6') || 
             lowerFileName.includes('a7') || 
             lowerFileName.includes('a8') ||
             lowerFileName.includes('q3') ||
             lowerFileName.includes('q5') ||
             lowerFileName.includes('q7')) {
      brand = '아우디';
    }
    else if (lowerFileName.includes('bmw') || 
             lowerFileName.includes('x1') || 
             lowerFileName.includes('x3') || 
             lowerFileName.includes('x5') ||
             lowerFileName.includes('320') ||
             lowerFileName.includes('520') ||
             lowerFileName.includes('730')) {
      brand = 'BMW';
    }

    return {
      brand,
      model: cleanFileName, // 파일명을 그대로 모델명으로 사용
      category: category,
      fuel_type: fuelType,
      estimated_daily_rate: estimatedRate,
      year: 2024
    };
  };

  // 제안된 모델 적용하기
  const applyImageModels = async () => {
    const newModels = [...models];
    setLoading(true);
    
    let successCount = 0;
    let failCount = 0;
    
    try {
      const suggestions = generateSuggestions();
      
      // 각 이미지를 순차적으로 업로드 (병렬 처리 시 과부하 방지)
      for (let i = 0; i < Math.min(suggestions.length, 15); i++) {
        const suggestion = suggestions[i];
        
        try {
          console.log(`Uploading ${i + 1}/${suggestions.length}: ${suggestion.brand} ${suggestion.model}`);
          
          // 모델명에서 특수문자 제거 (업로드 안전성 향상)
          const cleanModel = suggestion.model.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '').trim();
          const cleanBrand = suggestion.brand.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '').trim();
          
          if (!cleanModel || !cleanBrand) {
            console.error(`Invalid model/brand name: ${suggestion.brand} ${suggestion.model}`);
            failCount++;
            continue;
          }

          // Storage에 이미지 업로드
          const result = await uploadVehicleImage(
            suggestion.file,
            cleanBrand,
            cleanModel
          );

          if (result) {
            newModels[i] = {
              ...newModels[i],
              brand: cleanBrand,
              model: cleanModel,
              year: suggestion.year,
              category: suggestion.category,
              fuel_type: suggestion.fuel_type,
              estimated_daily_rate: suggestion.estimated_daily_rate,
              image: {
                url: result.url,
                alt: cleanModel,
                name: suggestion.file.name,
                size: suggestion.file.size
              }
            };
            successCount++;
          } else {
            console.error(`Failed to upload image for ${cleanBrand} ${cleanModel}`);
            failCount++;
          }
        } catch (fileError) {
          console.error(`Error processing file ${suggestion.file.name}:`, fileError);
          failCount++;
        }
      }

      setModels([...newModels]);
      setShowImageMatcher(false);
      
      // 결과 알림
      if (successCount > 0) {
        alert(`✅ ${successCount}개 이미지 업로드 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`);
      } else {
        alert('❌ 모든 이미지 업로드가 실패했습니다. 파일명과 형식을 확인해주세요.');
      }
      
    } catch (error) {
      console.error('Error applying image models:', error);
      alert('이미지 업로드 중 오류가 발생했습니다: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const clearModel = (index: number) => {
    setModels(prev => prev.map((model, i) => 
      i === index ? {
        id: `model-${i}`,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        category: '',
        fuel_type: 'gasoline' as const,
        transmission: 'automatic' as const,
        passengers: 5,
        displacement: 0,
        features: [],
        estimated_daily_rate: 80000
      } : model
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비어있지 않은 모델들만 필터링
    const validModels = models.filter(model => 
      model.brand.trim() && model.model.trim()
    );

    if (validModels.length === 0) {
      alert('최소 하나의 모델 정보를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const modelData = validModels.map(model => ({
        brand: model.brand,
        model: model.model,
        year: model.year,
        category: model.category || null,
        fuel_type: model.fuel_type,
        transmission: model.transmission,
        passengers: model.passengers,
        displacement: model.displacement || null,
        image: model.image || null,
        features: model.features.length > 0 ? model.features : null,
        estimated_daily_rate: model.estimated_daily_rate,
        is_active: true
      }));

      console.log('차량 모델 일괄 등록:', modelData);
      
      // 실제 DB에 일괄 등록
      await vehicleModelService.createBulk(modelData);
      
      alert(`${validModels.length}개의 차량 모델이 성공적으로 등록되었습니다.`);
      router.push('/admin/vehicles');
    } catch (error) {
      console.error('차량 모델 등록 실패:', error);
      alert(`차량 모델 등록 중 오류가 발생했습니다: ${(error as any)?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // 인기 차량 모델 목록 (미리 정의된 옵션들)
  const popularModels = [
    { brand: '현대', models: ['그랜저', '쏘나타', '아반떼', '투싼', '싼타페', '코나'] },
    { brand: '기아', models: ['K9', 'K7', 'K5', 'K3', '스포티지', '쏘렌토', '니로'] },
    { brand: 'BMW', models: ['3시리즈', '5시리즈', '7시리즈', 'X3', 'X5', 'X7'] },
    { brand: '벤츠', models: ['C클래스', 'E클래스', 'S클래스', 'GLC', 'GLE', 'GLS'] },
    { brand: '아우디', models: ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8'] },
    { brand: '테슬라', models: ['모델 3', '모델 S', '모델 X', '모델 Y'] }
  ];

  const categories = ['경차', '소형', '중형', '대형', 'SUV', '승합', '화물', '전기차', '하이브리드'];

  const commonFeatures = [
    { id: 'navigation', name: '네비게이션' },
    { id: 'blackbox', name: '블랙박스' },
    { id: 'rear_camera', name: '후방카메라' },
    { id: 'smart_key', name: '스마트키' },
    { id: 'leather_seat', name: '가죽시트' },
    { id: 'heated_seat', name: '열선시트' },
    { id: 'sunroof', name: '선루프' },
    { id: 'led_headlight', name: 'LED 헤드라이트' },
    { id: 'adaptive_cruise', name: '어댑티브크루즈' },
    { id: 'lane_keeping', name: '차선유지보조' }
  ];

  return (
    <PageLayout
      title="차량 모델 일괄 등록"
      description="인기 차량 모델을 미리 등록하여 차량 등록을 간편하게 하세요 (최대 10개)"
      actions={
        <Link href="/admin/vehicles">
          <Button variant="outline" size="sm">
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            차량 관리로
          </Button>
        </Link>
      }
    >
      <Card className="border border-gray-200 shadow-lg">
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* 안내 메시지 */}
          <div style={{
            ...sectionStyle,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Car style={{ width: '1.25rem', height: '1.25rem', color: 'rgb(59, 130, 246)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(59, 130, 246)', margin: 0 }}>
                차량 모델 일괄 등록 안내
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
              • 한번에 최대 15개의 차량 모델을 등록할 수 있습니다<br/>
              • 브랜드와 모델명은 필수 입력 항목입니다<br/>
              • 등록된 모델은 차량 등록 시 빠른 선택이 가능합니다<br/>
              • 이미지와 기본 옵션을 미리 설정하여 등록 시간을 단축할 수 있습니다
            </p>
          </div>

          {/* 이미지 폴더 업로드 섹션 */}
          <div style={{
            ...sectionStyle,
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: 'rgb(34, 197, 94)' }} />
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: 'rgb(34, 197, 94)', 
                margin: 0 
              }}>
                🚀 빠른 등록 (이미지 폴더 업로드)
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
              • 폴더에서 **최대 15개 이미지**를 선택하여 일괄 등록할 수 있습니다<br/>
              • 파일명이 그대로 모델명으로 사용됩니다 (예: "넥쏘NH2.jpg" → "넥쏘NH2")<br/>
              • 업로드 후 **파일 목록에서 원하는 파일만 선택** 가능<br/>
              • 키워드 기반 자동 카테고리 분류 및 Storage 저장
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label 
                  htmlFor="folder-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgb(34, 197, 94)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(22, 163, 74)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(34, 197, 94)';
                  }}
                >
                  <Upload style={{ width: '1rem', height: '1rem' }} />
                  이미지 폴더 업로드
                </label>
                <input
                  id="folder-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFolderUpload}
                  style={{ display: 'none' }}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
              </div>
              
              {allFiles.length > 0 && (
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgb(34, 197, 94)', fontWeight: '600' }}>
                    ✓ {allFiles.length}개 파일 발견 ({selectedFiles.size}개 선택)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 파일 선택 모달 */}
          {showImageMatcher && (
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
                borderRadius: '0.75rem',
                padding: '2rem',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                width: '1000px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: 'rgb(34, 197, 94)',
                    margin: 0
                  }}>
                    📁 업로드할 파일 선택 ({allFiles.length}개 발견)
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {selectedFiles.size}/15개 선택
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedFiles.size === Math.min(allFiles.length, 15) ? '전체 해제' : '전체 선택'}
                    </Button>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  최대 15개까지 선택할 수 있습니다. 선택된 파일들이 차량 모델로 등록됩니다.
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '2rem',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '0.5rem'
                }}>
                  {allFiles.map((file, index) => {
                    const isSelected = selectedFiles.has(file.name);
                    const fileName = file.name.toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '');
                    const suggestion = suggestModelFromFileName(fileName);
                    
                    return (
                      <div 
                        key={index} 
                        style={{
                          border: `2px solid ${isSelected ? 'rgb(34, 197, 94)' : '#e5e7eb'}`,
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.05)' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleFileToggle(file.name)}
                      >
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'cover',
                              opacity: isSelected ? 1 : 0.7
                            }}
                          />
                          
                          {/* 선택 체크박스 */}
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            width: '1.5rem',
                            height: '1.5rem',
                            backgroundColor: isSelected ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${isSelected ? 'rgb(34, 197, 94)' : '#d1d5db'}`
                          }}>
                            {isSelected && (
                              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 'bold' }}>✓</span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ padding: '0.75rem' }}>
                          <h4 style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            marginBottom: '0.25rem',
                            color: isSelected ? 'rgb(34, 197, 94)' : '#374151',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {suggestion.model}
                          </h4>
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280', 
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                            {suggestion.category} • {suggestion.estimated_daily_rate.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageMatcher(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={applyImageModels}
                    disabled={selectedFiles.size === 0}
                    style={{ backgroundColor: 'rgb(34, 197, 94)' }}
                  >
                    ✓ 선택한 파일 적용 ({selectedFiles.size}개)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 모델 등록 폼들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {models.map((model, index) => (
              <div key={model.id} style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={sectionTitleStyle}>
                    차량 모델 #{index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => clearModel(index)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                    초기화
                  </Button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {/* 브랜드 */}
                  <div>
                    <label style={labelStyle}>
                      브랜드 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                    </label>
                    <Select
                      value={model.brand}
                      onChange={(e) => handleModelChange(index, 'brand', e.target.value)}
                    >
                      <option value="">브랜드 선택</option>
                      {popularModels.map(brand => (
                        <option key={brand.brand} value={brand.brand}>
                          {brand.brand}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* 모델 */}
                  <div>
                    <label style={labelStyle}>
                      모델 <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                    </label>
                    <Select
                      value={model.model}
                      onChange={(e) => handleModelChange(index, 'model', e.target.value)}
                      disabled={!model.brand}
                    >
                      <option value="">모델 선택</option>
                      {model.brand && popularModels
                        .find(b => b.brand === model.brand)?.models
                        .map(modelName => (
                          <option key={modelName} value={modelName}>
                            {modelName}
                          </option>
                        ))}
                    </Select>
                  </div>

                  {/* 연식 */}
                  <div>
                    <label style={labelStyle}>연식</label>
                    <Input
                      type="number"
                      value={model.year}
                      onChange={(e) => handleModelChange(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  {/* 카테고리 */}
                  <div>
                    <label style={labelStyle}>카테고리</label>
                    <Select
                      value={model.category}
                      onChange={(e) => handleModelChange(index, 'category', e.target.value)}
                    >
                      <option value="">카테고리 선택</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* 연료 */}
                  <div>
                    <label style={labelStyle}>연료</label>
                    <Select
                      value={model.fuel_type}
                      onChange={(e) => handleModelChange(index, 'fuel_type', e.target.value)}
                    >
                      <option value="gasoline">휘발유</option>
                      <option value="diesel">경유</option>
                      <option value="electric">전기</option>
                      <option value="hybrid">하이브리드</option>
                      <option value="lpg">LPG</option>
                    </Select>
                  </div>

                  {/* 변속기 */}
                  <div>
                    <label style={labelStyle}>변속기</label>
                    <Select
                      value={model.transmission}
                      onChange={(e) => handleModelChange(index, 'transmission', e.target.value)}
                    >
                      <option value="automatic">자동</option>
                      <option value="manual">수동</option>
                      <option value="cvt">CVT</option>
                    </Select>
                  </div>

                  {/* 승차인원 */}
                  <div>
                    <label style={labelStyle}>승차인원</label>
                    <Input
                      type="number"
                      value={model.passengers}
                      onChange={(e) => handleModelChange(index, 'passengers', parseInt(e.target.value) || 5)}
                      min="1"
                      max="12"
                    />
                  </div>

                  {/* 배기량 */}
                  <div>
                    <label style={labelStyle}>배기량 (cc)</label>
                    <Input
                      type="number"
                      value={model.displacement}
                      onChange={(e) => handleModelChange(index, 'displacement', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="2000"
                    />
                  </div>

                  {/* 예상 일일 요금 */}
                  <div>
                    <label style={labelStyle}>예상 일일 요금 (원)</label>
                    <Input
                      type="number"
                      value={model.estimated_daily_rate}
                      onChange={(e) => handleModelChange(index, 'estimated_daily_rate', parseInt(e.target.value) || 80000)}
                      min="1"
                      placeholder="80000"
                    />
                  </div>
                </div>

                {/* 이미지 업로드 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>차량 이미지</label>
                  {!model.image ? (
                    <div 
                      style={{
                        border: '2px dashed rgba(30, 64, 175, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        textAlign: 'center',
                        backgroundColor: 'rgba(30, 64, 175, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                        e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.02)';
                      }}
                    >
                      <Upload style={{ width: '2rem', height: '2rem', color: 'rgb(30, 64, 175)', margin: '0 auto 0.5rem' }} />
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                        클릭하여 이미지 업로드
                      </p>
                      <input
                        id={`image-upload-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      position: 'relative',
                      border: '1px solid rgba(30, 64, 175, 0.2)',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      maxWidth: '200px'
                    }}>
                      <img 
                        src={model.image.url} 
                        alt={model.image.alt}
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
                          {model.image.name}
                        </p>
                        <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                          {(model.image.size / 1024).toFixed(1)} KB
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
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 기본 옵션 */}
                <div>
                  <label style={labelStyle}>기본 옵션</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                    {commonFeatures.map((feature) => (
                      <label key={feature.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.375rem',
                        padding: '0.375rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.375rem',
                        border: '1px solid rgba(30, 64, 175, 0.2)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}>
                        <input
                          type="checkbox"
                          checked={model.features.includes(feature.id)}
                          onChange={() => handleFeatureToggle(index, feature.id, feature.name)}
                          style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            accentColor: 'rgb(30, 64, 175)'
                          }}
                        />
                        <span>{feature.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
            <Link href="/admin/vehicles">
              <Button variant="outline" type="button" size="lg">
                <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                취소
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading} size="lg">
              <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              {loading ? '등록 중...' : '일괄 등록'}
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
              차량 모델을 등록하는 중...
            </span>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
