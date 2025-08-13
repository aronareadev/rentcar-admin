import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 30000, // 실시간 연결 타임아웃을 30초로 설정하여 안정성 향상
    heartbeatIntervalMs: 30000, // 연결 상태 확인 간격을 30초로 설정
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      vehicle_brands: {
        Row: {
          id: string
          name: string
          name_en: string | null
          logo_url: string | null
          country: string | null
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          logo_url?: string | null
          country?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          logo_url?: string | null
          country?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_locations: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          manager_name: string | null
          manager_phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          base_daily_rate: number | null
          price_multiplier: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_daily_rate?: number | null
          price_multiplier?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_daily_rate?: number | null
          price_multiplier?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vehicle_number: string
          brand: string | null
          model: string
          year: number
          color: string | null
          fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          passengers: number
          transmission: 'manual' | 'automatic'
          displacement: number | null
          mileage: number
          status: 'available' | 'rented' | 'maintenance' | 'inactive'
          location: string | null
          total_rentals: number
          total_revenue: number
          daily_rate: number
          weekly_rate: number | null
          monthly_rate: number | null
          category: string | null
          last_inspection_date: string | null
          images: any[] | null
          features: any[] | null
          insurance: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_number: string
          brand?: string | null
          model: string
          year: number
          color?: string | null
          fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          passengers?: number
          transmission: 'manual' | 'automatic'
          displacement?: number | null
          mileage?: number
          status?: 'available' | 'rented' | 'maintenance' | 'inactive'
          location?: string | null
          total_rentals?: number
          total_revenue?: number
          daily_rate: number
          weekly_rate?: number | null
          monthly_rate?: number | null
          category?: string | null
          last_inspection_date?: string | null
          images?: any[] | null
          features?: any[] | null
          insurance?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_number?: string
          brand?: string | null
          model?: string
          year?: number
          color?: string | null
          fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          passengers?: number
          transmission?: 'manual' | 'automatic'
          displacement?: number | null
          mileage?: number
          status?: 'available' | 'rented' | 'maintenance' | 'inactive'
          location?: string | null
          total_rentals?: number
          total_revenue?: number
          daily_rate?: number
          weekly_rate?: number | null
          monthly_rate?: number | null
          category?: string | null
          last_inspection_date?: string | null
          images?: any[] | null
          features?: any[] | null
          insurance?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          reservation_number: string
          customer_id: string
          vehicle_id: string
          start_date: string
          end_date: string
          pickup_location: string
          return_location: string
          status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          total_amount: number
          paid_amount: number
          payment_status: 'pending' | 'paid' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_number: string
          customer_id: string
          vehicle_id: string
          start_date: string
          end_date: string
          pickup_location: string
          return_location: string
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          total_amount: number
          paid_amount?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_number?: string
          customer_id?: string
          vehicle_id?: string
          start_date?: string
          end_date?: string
          pickup_location?: string
          return_location?: string
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          total_amount?: number
          paid_amount?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          license_number: string
          license_expiry_date: string
          tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_rentals: number
          total_spent: number
          is_blacklisted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          license_number: string
          license_expiry_date: string
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_rentals?: number
          total_spent?: number
          is_blacklisted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          license_number?: string
          license_expiry_date?: string
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          total_rentals?: number
          total_spent?: number
          is_blacklisted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          consultation_number: string
          customer_name: string
          customer_phone: string
          customer_email: string
          type: 'general' | 'booking' | 'technical' | 'complaint'
          subject: string
          content: string
          status: 'pending' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultation_number: string
          customer_name: string
          customer_phone: string
          customer_email: string
          type: 'general' | 'booking' | 'technical' | 'complaint'
          subject: string
          content: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultation_number?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          type?: 'general' | 'booking' | 'technical' | 'complaint'
          subject?: string
          content?: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_models: {
        Row: {
          id: string
          brand: string
          model: string
          year: number
          category: string | null
          fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
          transmission: 'automatic' | 'manual' | 'cvt'
          passengers: number
          displacement: number | null
          image: any | null
          features: any[] | null
          estimated_daily_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          year?: number
          category?: string | null
          fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
          transmission?: 'automatic' | 'manual' | 'cvt'
          passengers?: number
          displacement?: number | null
          image?: any | null
          features?: any[] | null
          estimated_daily_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          year?: number
          category?: string | null
          fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
          transmission?: 'automatic' | 'manual' | 'cvt'
          passengers?: number
          displacement?: number | null
          image?: any | null
          features?: any[] | null
          estimated_daily_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
