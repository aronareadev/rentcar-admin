import { supabase } from './supabase'
import type { Database } from './supabase'

type VehicleBrand = Database['public']['Tables']['vehicle_brands']['Row']
type VehicleBrandInsert = Database['public']['Tables']['vehicle_brands']['Insert']
type VehicleBrandUpdate = Database['public']['Tables']['vehicle_brands']['Update']

type VehicleLocation = Database['public']['Tables']['vehicle_locations']['Row']
type VehicleLocationInsert = Database['public']['Tables']['vehicle_locations']['Insert']
type VehicleLocationUpdate = Database['public']['Tables']['vehicle_locations']['Update']

type VehicleCategory = Database['public']['Tables']['vehicle_categories']['Row']
type VehicleCategoryInsert = Database['public']['Tables']['vehicle_categories']['Insert']
type VehicleCategoryUpdate = Database['public']['Tables']['vehicle_categories']['Update']

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']

type Reservation = Database['public']['Tables']['reservations']['Row']
type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

type Consultation = Database['public']['Tables']['consultations']['Row']
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
type ConsultationUpdate = Database['public']['Tables']['consultations']['Update']

type VehicleModel = Database['public']['Tables']['vehicle_models']['Row']
type VehicleModelInsert = Database['public']['Tables']['vehicle_models']['Insert']
type VehicleModelUpdate = Database['public']['Tables']['vehicle_models']['Update']

// Vehicle Brand Services
const vehicleBrandService = {
  async getAll(): Promise<VehicleBrand[]> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<VehicleBrand | null> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(brand: VehicleBrandInsert): Promise<VehicleBrand> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .insert(brand)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, brand: VehicleBrandUpdate): Promise<VehicleBrand> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .update({ ...brand, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_brands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Vehicle Location Services
const vehicleLocationService = {
  async getAll(): Promise<VehicleLocation[]> {
    const { data, error } = await supabase
      .from('vehicle_locations')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<VehicleLocation | null> {
    const { data, error } = await supabase
      .from('vehicle_locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(location: VehicleLocationInsert): Promise<VehicleLocation> {
    const { data, error } = await supabase
      .from('vehicle_locations')
      .insert(location)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, location: VehicleLocationUpdate): Promise<VehicleLocation> {
    const { data, error } = await supabase
      .from('vehicle_locations')
      .update({ ...location, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Vehicle Category Services
const vehicleCategoryService = {
  async getAll(): Promise<VehicleCategory[]> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<VehicleCategory | null> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(category: VehicleCategoryInsert): Promise<VehicleCategory> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, category: VehicleCategoryUpdate): Promise<VehicleCategory> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Vehicle Services
const vehicleService = {
  // Get all vehicles
  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get vehicle by ID
  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new vehicle
  async create(vehicle: VehicleInsert): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update vehicle
  async update(id: string, updates: VehicleUpdate): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete vehicle
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get vehicles by status
  async getByStatus(status: Vehicle['status']): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Search vehicles
  async search(query: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%,vehicle_number.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Reservation Services
export const reservationService = {
  // Get all reservations
  async getAll(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get reservation by ID
  async getById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new reservation
  async create(reservation: ReservationInsert): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update reservation
  async update(id: string, updates: ReservationUpdate): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete reservation
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get reservations by status
  async getByStatus(status: Reservation['status']): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Customer Services
export const customerService = {
  // Get all customers
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get customer by ID
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new customer
  async create(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update customer
  async update(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete customer
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Search customers
  async search(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Consultation Services
export const consultationService = {
  // Get all consultations
  async getAll(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get consultation by ID
  async getById(id: string): Promise<Consultation | null> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new consultation
  async create(consultation: ConsultationInsert): Promise<Consultation> {
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update consultation
  async update(id: string, updates: ConsultationUpdate): Promise<Consultation> {
    const { data, error } = await supabase
      .from('consultations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete consultation
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get consultations by status
  async getByStatus(status: Consultation['status']): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Vehicle Model Services
const vehicleModelService = {
  // Get all vehicle models
  async getAll(): Promise<VehicleModel[]> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('is_active', true)
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get vehicle model by ID
  async getById(id: string): Promise<VehicleModel | null> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Create vehicle model
  async create(vehicleModel: VehicleModelInsert): Promise<VehicleModel> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .insert({
        ...vehicleModel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Bulk create vehicle models
  async createBulk(vehicleModels: VehicleModelInsert[]): Promise<VehicleModel[]> {
    const timestamp = new Date().toISOString()
    const modelsWithTimestamp = vehicleModels.map(model => ({
      ...model,
      created_at: timestamp,
      updated_at: timestamp
    }))

    const { data, error } = await supabase
      .from('vehicle_models')
      .insert(modelsWithTimestamp)
      .select()
    
    if (error) throw error
    return data || []
  },

  // Update vehicle model
  async update(id: string, updates: VehicleModelUpdate): Promise<VehicleModel> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete vehicle model (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_models')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  },

  // Hard delete vehicle model
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_models')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get vehicle models by brand
  async getByBrand(brand: string): Promise<VehicleModel[]> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('brand', brand)
      .eq('is_active', true)
      .order('model', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Search vehicle models
  async search(query: string): Promise<VehicleModel[]> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%`)
      .eq('is_active', true)
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get unique brands
  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('brand')
      .eq('is_active', true)
      .order('brand', { ascending: true })
    
    if (error) throw error
    
    // Get unique brands
    const uniqueBrands = Array.from(new Set(data?.map(item => item.brand) || []))
    return uniqueBrands
  },

  // Get models by brand
  async getModelsByBrand(brand: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('model')
      .eq('brand', brand)
      .eq('is_active', true)
      .order('model', { ascending: true })
    
    if (error) throw error
    
    // Get unique models
    const uniqueModels = Array.from(new Set(data?.map(item => item.model) || []))
    return uniqueModels
  }
}

// ============================================================================
// Brand Service
// ============================================================================

type Brand = Database['public']['Tables']['vehicle_brands']['Row'];
type BrandInsert = Database['public']['Tables']['vehicle_brands']['Insert'];
type BrandUpdate = Database['public']['Tables']['vehicle_brands']['Update'];

const brandService = {
  // 모든 활성 브랜드 조회 (표시 순서로 정렬)
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    return data || [];
  },

  // ID로 브랜드 조회
  async getById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 브랜드를 찾을 수 없음
      }
      console.error('Error fetching brand:', error);
      throw error;
    }

    return data;
  },

  // 브랜드 생성
  async create(brand: BrandInsert): Promise<Brand> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .insert(brand)
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);
      throw error;
    }

    return data;
  },

  // 브랜드 수정
  async update(id: string, updates: BrandUpdate): Promise<Brand> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      throw error;
    }

    return data;
  },

  // 브랜드 삭제 (소프트 삭제)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_brands')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // 브랜드 영구 삭제
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error hard deleting brand:', error);
      throw error;
    }
  },

  // 브랜드명으로 검색
  async search(query: string): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,name_en.ilike.%${query}%`)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching brands:', error);
      throw error;
    }

    return data || [];
  },

  // 브랜드명 중복 체크
  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('vehicle_brands')
      .select('id')
      .eq('name', name)
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking brand name:', error);
      throw error;
    }

    return (data?.length || 0) > 0;
  },

  // 표시 순서 업데이트
  async updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
    const { error } = await supabase
      .from('vehicle_brands')
      .update({ display_order: displayOrder })
      .eq('id', id);

    if (error) {
      console.error('Error updating display order:', error);
      throw error;
    }
  }
};

// Exports
export { vehicleService, vehicleBrandService, vehicleLocationService, vehicleCategoryService, vehicleModelService, brandService };
