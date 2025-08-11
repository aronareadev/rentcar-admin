import { supabase } from './supabase';

// 이미지 업로드 헬퍼 함수
export const uploadVehicleImage = async (
  file: File, 
  brand: string, 
  model: string,
  id?: string
): Promise<{ url: string; path: string } | null> => {
  try {
    // 입력 유효성 검사
    if (!file || !brand || !model) {
      console.error('Invalid input parameters:', { file: !!file, brand, model });
      return null;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return null;
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return null;
    }

    // 파일명 정리 (특수문자 제거, 더 엄격하게)
    const cleanBrand = brand
      .replace(/[^\w가-힣]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const cleanModel = model
      .replace(/[^\w가-힣]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !cleanBrand || !cleanModel) {
      console.error('Invalid cleaned names:', { cleanBrand, cleanModel, fileExt });
      return null;
    }

    const fileName = `${cleanBrand}_${cleanModel}_${Date.now()}.${fileExt}`;
    const filePath = `${cleanBrand}/${fileName}`;

    console.log('Uploading to path:', filePath);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      
      // 특정 에러 타입별 처리
      if (error.message?.includes('Duplicate')) {
        console.log('File already exists, trying with unique suffix...');
        const uniqueFileName = `${cleanBrand}_${cleanModel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const uniquePath = `${cleanBrand}/${uniqueFileName}`;
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from('vehicle-images')
          .upload(uniquePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryError) {
          console.error('Retry upload failed:', retryError);
          return null;
        }
        
        const { data: urlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(retryData.path);

        return {
          url: urlData.publicUrl,
          path: retryData.path
        };
      }
      
      return null;
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};

// Base64를 File 객체로 변환
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

// 기존 Base64 이미지를 Storage로 마이그레이션
export const migrateBase64ToStorage = async (
  base64Url: string,
  brand: string,
  model: string,
  originalFilename: string
): Promise<{ url: string; path: string } | null> => {
  try {
    // Base64를 File로 변환
    const file = base64ToFile(base64Url, originalFilename);
    
    // Storage에 업로드
    return await uploadVehicleImage(file, brand, model);
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
};

// Storage에서 이미지 삭제
export const deleteVehicleImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('vehicle-images')
      .remove([path]);

    if (error) {
      console.error('Image deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
};

// 이미지 URL 타입 체크
export const isStorageUrl = (url: string): boolean => {
  return url.includes('supabase.co/storage') || url.startsWith('http');
};

export const isBase64Url = (url: string): boolean => {
  return url.startsWith('data:');
};

// 브랜드 로고 업로드 헬퍼 함수
export const uploadBrandLogo = async (
  file: File, 
  brandName: string
): Promise<{ url: string; path: string } | null> => {
  try {
    // 입력 유효성 검사
    if (!file || !brandName) {
      console.error('Invalid input parameters:', { file: !!file, brandName });
      return null;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return null;
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return null;
    }

    // 파일명 정리 (영문/숫자만 사용하여 안전하게)
    const cleanBrandName = brandName
      .replace(/[가-힣]/g, (match) => {
        // 한글을 영문으로 변환하는 간단한 매핑
        const koreanToEnglish: {[key: string]: string} = {
          '현대': 'hyundai',
          '기아': 'kia', 
          '삼성': 'samsung',
          '대우': 'daewoo',
          '쌍용': 'ssangyong',
          '르노': 'renault'
        };
        return koreanToEnglish[match] || 'kr';
      })
      .replace(/[^\w]/g, '')  // 영문/숫자만 남기기
      .toLowerCase();
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !cleanBrandName) {
      console.error('Invalid cleaned names:', { cleanBrandName, fileExt });
      return null;
    }

    const fileName = `${cleanBrandName}_logo_${Date.now()}.${fileExt}`;
    const filePath = `brand-logos/${fileName}`;

    console.log('Uploading brand logo to path:', filePath);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('vehicle-images')  // 기존 버킷 사용
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Brand logo upload error:', error);
      console.error('Error details:', {
        message: error.message,
        error: error,
        filePath,
        fileName
      });
      
      // 중복 파일 처리
      if (error.message?.includes('Duplicate')) {
        console.log('Logo already exists, trying with unique suffix...');
        const uniqueFileName = `${cleanBrandName}_logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const uniquePath = `brand-logos/${uniqueFileName}`;
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from('vehicle-images')
          .upload(uniquePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryError) {
          console.error('Retry logo upload failed:', retryError);
          return null;
        }
        
        const { data: urlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(retryData.path);

        return {
          url: urlData.publicUrl,
          path: retryData.path
        };
      }
      
      return null;
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Brand logo upload failed:', error);
    return null;
  }
};

// 브랜드 로고 삭제
export const deleteBrandLogo = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('vehicle-images')
      .remove([path]);

    if (error) {
      console.error('Brand logo deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Brand logo deletion failed:', error);
    return false;
  }
};
