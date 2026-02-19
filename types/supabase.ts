export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'student' | 'admin'
          avatar_url: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'student' | 'admin'
          avatar_url?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'student' | 'admin'
          avatar_url?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      found_ids: {
        Row: {
          id: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number: string
          image_url: string
          sighting_location: string | null
          holding_location: string | null
          description: string | null
          status: 'pending' | 'verified' | 'claimed' | 'returned' | 'archived'
          visibility: boolean
          found_date: string | null
          claimed_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number: string
          image_url: string
          sighting_location?: string | null
          holding_location?: string | null
          description?: string | null
          status?: 'pending' | 'verified' | 'claimed' | 'returned' | 'archived'
          visibility?: boolean
          found_date?: string | null
          claimed_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          id_type?: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name?: string
          registration_number?: string
          image_url?: string
          sighting_location?: string | null
          holding_location?: string | null
          description?: string | null
          status?: 'pending' | 'verified' | 'claimed' | 'returned' | 'archived'
          visibility?: boolean
          found_date?: string | null
          claimed_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lost_requests: {
        Row: {
          id: string
          user_id: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number: string | null
          description: string | null
          status: 'submitted' | 'matched' | 'closed'
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number?: string | null
          description?: string | null
          status?: 'submitted' | 'matched' | 'closed'
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          id_type?: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name?: string
          registration_number?: string | null
          description?: string | null
          status?: 'submitted' | 'matched' | 'closed'
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      claims: {
        Row: {
          id: string
          item_id: string
          claimant_id: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          proof_description: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          claimant_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          proof_description?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          claimant_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          proof_description?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number: string
          image_url: string
          location_found: string | null
          contact_info: string | null
          approved: boolean | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
          full_name: string
          registration_number: string
          image_url: string
          location_found?: string | null
          contact_info?: string | null
          approved?: boolean | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          // All fields optional
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string
          details: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          details?: Json | null
          timestamp?: string
        }
        Update: {
          // Typically audit logs are append only, but defining for completeness
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'admin'
      id_status: 'pending' | 'verified' | 'claimed' | 'returned' | 'archived'
      claim_status: 'pending' | 'approved' | 'rejected' | 'completed'
      request_status: 'submitted' | 'matched' | 'closed'
      id_type: 'national_id' | 'student_id' | 'drivers_license' | 'passport' | 'other'
    }
  }
}
