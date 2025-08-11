'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { Button, Input } from '../ui';
import { brandService } from '@/src/lib/database';
import { uploadBrandLogo, deleteBrandLogo } from '@/src/lib/imageUpload';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    display_order: 0,
    logo_url: '',
    logo_path: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [existingBrands, setExistingBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // 기존 브랜드 목록 로드
  useEffect(() => {
    const loadExistingBrands = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingBrands(true);
        const brands = await brandService.getAll();
        setExistingBrands(brands);
      } catch (error) {
        console.error('Error loading existing brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadExistingBrands();
  }, [isOpen]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 브랜드명 변경 시 에러 초기화
    if (field === 'name') {
      setNameError('');
    }
  };

  // 브랜드명 중복 검사
  const validateBrandName = async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      setNameError('브랜드명을 입력해주세요.');
      return false;
    }

    try {
      const exists = await brandService.checkNameExists(name.trim());
      if (exists) {
        setNameError('이미 존재하는 브랜드명입니다.');
        return false;
      }
      
      setNameError('');
      return true;
    } catch (error) {
      console.error('Error checking brand name:', error);
      setNameError('브랜드명 검증 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 로고 이미지 업로드 핸들러
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 브랜드명이 없으면 업로드 불가
    if (!formData.name.trim()) {
      alert('브랜드명을 먼저 입력해주세요.');
      return;
    }

    setUploadingLogo(true);

    try {
      const result = await uploadBrandLogo(file, formData.name);
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          logo_url: result.url,
          logo_path: result.path
        }));
        console.log('Logo uploaded successfully:', result.url);
        alert('로고가 성공적으로 업로드되었습니다!');
      } else {
        alert('로고 업로드에 실패했습니다. 파일 형식이나 크기를 확인해주세요.');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      
      // 에러 타입별 상세 메시지
      let errorMessage = '로고 업로드 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          errorMessage = '이미지 파일만 업로드 가능합니다.';
        } else if (error.message.includes('File too large')) {
          errorMessage = '파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.';
        } else if (error.message.includes('Invalid input')) {
          errorMessage = '브랜드명을 먼저 입력해주세요.';
        } else {
          errorMessage = `업로드 실패: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setUploadingLogo(false);
    }
  };

  // 로고 이미지 삭제 핸들러
  const handleLogoDelete = async () => {
    if (!formData.logo_path) return;

    const confirmed = window.confirm('로고 이미지를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const success = await deleteBrandLogo(formData.logo_path);
      
      if (success) {
        setFormData(prev => ({
          ...prev,
          logo_url: '',
          logo_path: ''
        }));
        console.log('Logo deleted successfully');
      } else {
        alert('로고 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Logo deletion error:', error);
      alert('로고 삭제 중 오류가 발생했습니다.');
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // 브랜드명 검증
    const isNameValid = await validateBrandName(formData.name);
    if (!isNameValid) return;

    setLoading(true);

    try {
      // 제조사 생성 데이터 준비
      const brandData = {
        name: formData.name.trim(),
        name_en: formData.name_en.trim() || null,
        description: formData.description.trim() || null,
        logo_url: formData.logo_url || null,
        display_order: formData.display_order,
        is_active: true
      };

      // DB에 브랜드 생성
      const newBrand = await brandService.create(brandData);

      // 기존 브랜드 목록에 새 브랜드 추가
      setExistingBrands(prev => [...prev, newBrand].sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      }));

      // 성공 처리
      alert('제조사가 성공적으로 등록되었습니다!');
      
      // 폼 초기화
      setFormData({
        name: '',
        name_en: '',
        description: '',
        display_order: 0,
        logo_url: '',
        logo_path: ''
      });

      // 콜백 실행
      if (onSuccess) {
        onSuccess();
      }

      // 모달 닫기
      handleClose();

    } catch (error) {
      console.error('Error creating brand:', error);
      alert('제조사 등록 중 오류가 발생했습니다: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 핸들러 (상태 초기화 포함)
  const handleClose = () => {
    // 상태 초기화
    setFormData({
      name: '',
      name_en: '',
      description: '',
      display_order: 0,
      logo_url: '',
      logo_path: ''
    });
    setNameError('');
    setExistingBrands([]);
    setLoadingBrands(true);
    
    onClose();
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  // 스타일 정의는 Input 컴포넌트에서 자체 처리

  const sectionStyle = {
    backgroundColor: 'rgba(30, 64, 175, 0.02)',
    border: '1px solid rgba(30, 64, 175, 0.1)',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
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
        padding: '0',
        maxWidth: '600px',
        width: '90vw',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 모달 헤더 - 블루 포인트 스타일 */}
        <div style={{ 
          backgroundColor: 'rgb(30, 64, 175)',
          color: 'white',
          padding: '1rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'white' 
            }} />
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '500', 
              color: 'white',
              margin: 0 
            }}>
              새 제조사 등록
            </h2>
          </div>
          
          <button
            onClick={handleClose}
            style={{
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* 모달 컨텐츠 */}
        <div style={{ 
          padding: '1.5rem', 
          overflowY: 'auto',
          flex: 1
        }}>

        {/* 등록된 제조사 목록 */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '0.75rem'
          }}>
            등록된 제조사 ({existingBrands.length}개)
          </h3>

          {loadingBrands ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                border: '2px solid #e2e8f0',
                borderTop: '2px solid rgb(30, 64, 175)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '0.75rem'
              }} />
              로딩 중...
            </div>
          ) : existingBrands.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              등록된 제조사가 없습니다.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {existingBrands.map((brand) => (
                <div
                  key={brand.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#374151',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      style={{
                        width: '16px',
                        height: '16px',
                        objectFit: 'contain',
                        borderRadius: '0.125rem'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '0.125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 style={{ 
                        width: '10px', 
                        height: '10px', 
                        color: '#94a3b8' 
                      }} />
                    </div>
                  )}
                  <span>{brand.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 등록 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 기본 정보 섹션 */}
          <div style={sectionStyle}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: 'rgb(30, 64, 175)',
              marginBottom: '0.75rem',
              paddingBottom: '0.375rem',
              borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
            }}>
              기본 정보
            </h3>
            
            <div style={gridStyle}>
              <div>
                <Input
                  type="text"
                  label="브랜드명 (한글) *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="예: 현대, 기아, BMW"
                  required
                  error={nameError}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="브랜드명 (영문)"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  placeholder="예: Hyundai, Kia, BMW"
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="표시 순서"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0' 
                }}>
                  숫자가 작을수록 먼저 표시됩니다
                </p>
              </div>
            </div>
          </div>

          {/* 로고 및 설명 섹션 */}
          <div style={sectionStyle}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: 'rgb(30, 64, 175)',
              marginBottom: '0.75rem',
              paddingBottom: '0.375rem',
              borderBottom: '1px solid rgba(30, 64, 175, 0.2)'
            }}>
              로고 및 설명
            </h3>
            
            {/* 로고 업로드 영역 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <ImageIcon style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  display: 'inline', 
                  marginRight: '0.5rem' 
                }} />
                브랜드 로고
              </label>
              
              {formData.logo_url ? (
                // 업로드된 로고 표시
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.05)'
                }}>
                  <img 
                    src={formData.logo_url} 
                    alt="브랜드 로고" 
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      로고가 업로드되었습니다
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      {formData.name} 브랜드 로고
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogoDelete}
                    style={{ 
                      color: '#dc2626', 
                      borderColor: '#dc2626' 
                    }}
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </Button>
                </div>
              ) : (
                // 로고 업로드 영역
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb'
                }}>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo || !formData.name.trim()}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="logo-upload"
                    style={{
                      cursor: uploadingLogo || !formData.name.trim() ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      opacity: uploadingLogo || !formData.name.trim() ? 0.5 : 1
                    }}
                  >
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(30, 64, 175, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {uploadingLogo ? (
                        <div style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          border: '2px solid #d1d5db',
                          borderTop: '2px solid rgb(30, 64, 175)',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : (
                        <Upload style={{ 
                          width: '1.5rem', 
                          height: '1.5rem', 
                          color: 'rgb(30, 64, 175)' 
                        }} />
                      )}
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#374151',
                        margin: '0 0 0.25rem 0' 
                      }}>
                        {uploadingLogo ? '업로드 중...' : '로고 이미지 업로드'}
                      </p>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        margin: 0 
                      }}>
                        {!formData.name.trim() 
                          ? '브랜드명을 먼저 입력해주세요' 
                          : 'PNG, JPG, GIF (최대 5MB)'}
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 브랜드 설명 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>브랜드 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="브랜드에 대한 간단한 설명을 입력하세요..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* 버튼들 */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            marginTop: '1rem',
            borderTop: '2px solid rgba(30, 64, 175, 0.1)' 
          }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.name.trim()}
              style={{ 
                backgroundColor: loading ? '#9ca3af' : 'rgb(30, 64, 175)',
                minWidth: '100px'
              }}
            >
              {loading ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default BrandModal;
