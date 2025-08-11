// 이미지 마이그레이션 스크립트
import { supabase } from '../src/lib/supabase';
import { migrateBase64ToStorage } from '../src/lib/imageUpload';

interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  image: {
    url: string;
    name: string;
    alt: string;
    size: number;
  } | null;
}

async function migrateAllImages() {
  console.log('🚀 Starting image migration to Supabase Storage...');

  try {
    // Base64 이미지가 있는 모든 모델 조회
    const { data: models, error } = await supabase
      .from('vehicle_models')
      .select('id, brand, model, image')
      .not('image', 'is', null)
      .returns<VehicleModel[]>();

    if (error) {
      throw error;
    }

    console.log(`📋 Found ${models.length} models with images to migrate`);

    let successCount = 0;
    let failCount = 0;

    for (const model of models) {
      if (!model.image || !model.image.url.startsWith('data:')) {
        console.log(`⏭️  Skipping ${model.brand} ${model.model} - already migrated or no image`);
        continue;
      }

      console.log(`📸 Migrating ${model.brand} ${model.model}...`);

      try {
        // Base64를 Storage로 마이그레이션
        const result = await migrateBase64ToStorage(
          model.image.url,
          model.brand,
          model.model,
          model.image.name
        );

        if (result) {
          // DB 업데이트 - Storage URL로 변경
          const { error: updateError } = await supabase
            .from('vehicle_models')
            .update({
              image: {
                url: result.url,
                name: model.image.name,
                alt: model.image.alt,
                size: model.image.size,
                path: result.path // Storage path 추가
              }
            })
            .eq('id', model.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Successfully migrated ${model.brand} ${model.model}`);
          successCount++;
        } else {
          console.log(`❌ Failed to upload ${model.brand} ${model.model}`);
          failCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrating ${model.brand} ${model.model}:`, error);
        failCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${successCount + failCount}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateAllImages();
}

export { migrateAllImages };
