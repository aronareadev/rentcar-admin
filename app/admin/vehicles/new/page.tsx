'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vehicleService, vehicleBrandService, vehicleLocationService, vehicleCategoryService, vehicleModelService } from '@/src/lib/database'
import { uploadVehicleImage } from '@/src/lib/imageUpload'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Input, Select, Loading } from '@/src/components/ui'
import { PageLayout } from '@/src/components/admin/PageLayout'
import { ArrowLeft, Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'

// 공통 스타일
const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.25rem'
}

const sectionStyle = {
  padding: '1rem',
  backgroundColor: 'rgba(30, 64, 175, 0.02)',
  borderRadius: '0.5rem',
  border: '1px solid rgba(30, 64, 175, 0.1)',
  marginBottom: '1rem'
}

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'rgb(30, 64, 175)',
  margin: '0 0 0.75rem 0',
  paddingBottom: '0.375rem',
  borderBottom: '2px solid rgb(30, 64, 175)'
}

export default function NewVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [vehicleModels, setVehicleModels] = useState<any[]>([])
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [loadingData, setLoadingData] = useState(true)
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
    images: [] as any[],
    features: [] as any[],
    insurance: {
      provider: '',
      policy_number: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_person: '',
      contact_phone: ''
    }
  })

  // Load dropdown data
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)
              const [brandsData, locationsData, categoriesData, vehicleModelsData] = await Promise.all([
        vehicleBrandService.getAll(),
        vehicleLocationService.getAll(),
        vehicleCategoryService.getAll(),
        vehicleModelService.getAll()
      ])
        
        setBrands(brandsData)
        setLocations(locationsData)
        setCategories(categoriesData)
        setVehicleModels(vehicleModelsData)
      } catch (error) {
        console.error('Failed to load data:', error)
        alert('데이터 로딩에 실패했습니다.')
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'passengers' || name === 'mileage' || 
              name === 'daily_rate' || name === 'weekly_rate' || name === 'monthly_rate' ||
              name === 'displacement'
        ? parseInt(value) || 0 
        : value
    }))
  }

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      brand: e.target.value
    }))
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      location: e.target.value
    }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value
    }))
  }

  // 브랜드 선택 시 해당 브랜드의 모델들 필터링
  const handleBrandChangeWithModels = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBrand = e.target.value
    setFormData(prev => ({ ...prev, brand: selectedBrand, model: '' }))
    setSelectedModelId('')
    
    // 선택된 브랜드의 모델들 필터링
    const modelsForBrand = vehicleModels.filter(model => model.brand === selectedBrand)
    setAvailableModels(modelsForBrand)
  }

  // 모델 템플릿 선택 핸들러
  const handleModelTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value
    setSelectedModelId(modelId)
    
    if (!modelId) return
    
    const selectedModel = vehicleModels.find(model => model.id === modelId)
    if (selectedModel) {
      setFormData(prev => ({
        ...prev,
        brand: selectedModel.brand,
        model: selectedModel.model,
        year: selectedModel.year,
        category: selectedModel.category || '',
        fuel_type: selectedModel.fuel_type,
        transmission: selectedModel.transmission,
        passengers: selectedModel.passengers,
        displacement: selectedModel.displacement || 0,
        daily_rate: selectedModel.estimated_daily_rate,
        features: selectedModel.features || [],
        images: selectedModel.image ? [selectedModel.image] : []
      }))
      
      // 브랜드 변경에 따른 모델 목록 업데이트
      const modelsForBrand = vehicleModels.filter(model => model.brand === selectedModel.brand)
      setAvailableModels(modelsForBrand)
    }
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        continue
      }

      // 이미지 파일 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        continue
      }

      try {
        // 임시 이미지 추가 (로딩 표시)
        const tempImage = {
          id: Date.now() + Math.random(),
          file: file,
          url: 'uploading...',
          alt: file.name,
          name: file.name,
          size: file.size,
          uploading: true
        }
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, tempImage]
        }))

        // Storage에 업로드
        const result = await uploadVehicleImage(
          file,
          formData.brand || '미정',
          formData.model || '미정'
        )

        if (result) {
          const newImage = {
            id: tempImage.id,
            file: file,
            url: result.url,
            alt: file.name,
            name: file.name,
            size: file.size,
            path: result.path
          }

          // 임시 이미지를 실제 이미지로 교체
          setFormData(prev => ({
            ...prev,
            images: prev.images.map(img => 
              img.id === tempImage.id ? newImage : img
            )
          }))
        } else {
          // 업로드 실패시 임시 이미지 제거
          setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== tempImage.id)
          }))
          alert(`${file.name} 업로드에 실패했습니다.`)
        }
      } catch (error) {
        console.error('Image upload error:', error)
        alert(`${file.name} 업로드 중 오류가 발생했습니다.`)
      }
    }

    // 파일 입력 초기화
    e.target.value = ''
  }

  // 이미지 삭제 핸들러
  const handleImageDelete = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    // FileList를 HTMLInputElement의 files처럼 처리
    const fakeEvent = {
      target: { files: files }
    } as any
    
    handleImageUpload(fakeEvent)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vehicle_number || !formData.brand || !formData.model) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      
      // 필수 필드 검증
      if (formData.daily_rate <= 0) {
        alert('일일 요금을 입력해주세요.')
        return
      }

      // 데이터 정리 및 검증 (실제 DB 스키마에 맞춤)
      const vehicleData = {
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
        images: formData.images.length > 0 ? formData.images.map(img => ({
          url: img.url,
          alt: img.alt,
          name: img.name,
          size: img.size
        })) : null,
        features: formData.features.length > 0 ? formData.features : null,
        insurance: Object.keys(formData.insurance).some(key => (formData.insurance as any)[key]) ? formData.insurance : null,
        total_rentals: 0,
        total_revenue: 0
      }

      console.log('Sending vehicle data:', vehicleData)
      
      await vehicleService.create(vehicleData)
      
      alert('차량이 성공적으로 등록되었습니다.')
      router.push('/admin/vehicles')
    } catch (error) {
      console.error('Failed to create vehicle:', error)
      alert(`차량 등록에 실패했습니다: ${(error as any)?.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <PageLayout
        title="새 차량 등록"
        description="새로운 차량 정보를 입력하고 등록하세요"
      >
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="새 차량 등록"
      description="새로운 차량 정보를 입력하고 등록하세요"
      actions={
        <Link href="/admin/vehicles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      }
    >
        <Card className="border border-gray-200 shadow-lg">
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {/* 모델 템플릿 선택 섹션 */}
            <div style={{
              ...sectionStyle,
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <h3 style={{ 
                ...sectionTitleStyle,
                color: 'rgb(59, 130, 246)',
                borderBottom: '2px solid rgb(59, 130, 246)'
              }}>빠른 등록 (모델 템플릿 선택)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>
                    등록된 모델 선택 (선택사항)
                  </label>
                  <Select
                    value={selectedModelId}
                    onChange={handleModelTemplateSelect}
                  >
                    <option value="">모델 템플릿 선택</option>
                    {vehicleModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.brand} {model.model} ({model.year}년)
                        {model.category && ` - ${model.category}`}
                      </option>
                    ))}
                  </Select>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    미리 등록된 모델을 선택하면 차량 정보가 자동으로 입력됩니다
                  </p>
                </div>
                
                {selectedModelId && (
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: 'rgb(34, 197, 94)', fontWeight: '600', marginBottom: '0.25rem' }}>
                      ✓ 모델 템플릿 적용됨
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      선택한 모델의 기본 정보가 아래 폼에 자동으로 입력되었습니다.<br/>
                      필요에 따라 수정하여 사용하세요.
                    </p>
                  </div>
                )}
              </div>
            </div>

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
                      onChange={handleBrandChangeWithModels}
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
                      placeholder={formData.brand ? `${formData.brand} 모델명 입력` : "모델명 입력"}
                      list={`model-suggestions-${formData.brand}`}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
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
                    />
                    {formData.brand && availableModels.length > 0 && (
                      <datalist id={`model-suggestions-${formData.brand}`}>
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.model}>
                            {model.model} ({model.year}년)
                          </option>
                        ))}
                      </datalist>
                    )}
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
                    <label style={labelStyle}>승차인원</label>
                    <Input
                      type="number"
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="15"
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
                    <label style={labelStyle}>상태</label>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="available">대여가능</option>
                      <option value="maintenance">정비중</option>
                      <option value="inactive">비활성</option>
                    </Select>
                  </div>

                  <div>
                    <label style={labelStyle}>마지막 검사일</label>
                    <Input
                      type="date"
                      name="last_inspection_date"
                      value={formData.last_inspection_date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      일일 요금 (원) <span style={{ color: 'rgb(30, 64, 175)' }}>*</span>
                    </label>
                    <Input
                      type="number"
                      name="daily_rate"
                      value={formData.daily_rate}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="80000"
                      required
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
                onClick={() => document.getElementById('image-upload')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30, 64, 175)';
                  e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30, 64, 175, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.02)';
                }}
              >
                <Upload style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  color: 'rgb(30, 64, 175)', 
                  margin: '0 auto 1rem' 
                }} />
                <h4 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: 'rgb(30, 64, 175)', 
                  margin: '0 0 0.5rem 0' 
                }}>
                  차량 이미지 업로드
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  margin: '0 0 1rem 0' 
                }}>
                  클릭하거나 파일을 드래그해서 업로드하세요
                </p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af', 
                  margin: 0 
                }}>
                  JPG, PNG, GIF 파일 (최대 5MB)
                </p>
                
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {formData.images.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {formData.images.map((image) => (
                    <div 
                      key={image.id} 
                      style={{
                        position: 'relative',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(30, 64, 175, 0.2)'
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* 이미지 정보 */}
                      <div style={{ 
                        padding: '0.5rem',
                        backgroundColor: 'white'
                      }}>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: '#374151', 
                          margin: '0 0 0.25rem 0',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {image.name}
                        </p>
                        <p style={{ 
                          fontSize: '0.625rem', 
                          color: '#9ca3af', 
                          margin: 0 
                        }}>
                          {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      
                      {/* 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageDelete(image.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          backgroundColor: 'rgba(220, 38, 38, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '2rem',
                          height: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 1)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 개수 표시 */}
              {formData.images.length > 0 && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 64, 175, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(30, 64, 175, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon style={{ width: '1rem', height: '1rem', color: 'rgb(30, 64, 175)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'rgb(30, 64, 175)', fontWeight: '500' }}>
                      총 {formData.images.length}개의 이미지가 업로드되었습니다
                    </span>
                  </div>
                </div>
              )}
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
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </Link>
              <Button variant="primary" type="submit" disabled={loading} size="lg">
                <Save className="w-4 h-4 mr-2" />
                {loading ? '등록 중...' : '등록'}
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
                차량을 등록하는 중...
              </span>
            </div>
          </div>
        )}
    </PageLayout>
  )
}