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
          email: string
          full_name: string
          role: 'admin' | 'client'
          phone: string | null
          company_name: string | null
          ruc: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'client'
          phone?: string | null
          company_name?: string | null
          ruc?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'client'
          phone?: string | null
          company_name?: string | null
          ruc?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          company_name: string
          ruc: string
          email: string
          phone: string | null
          address: string | null
          contact_person: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_name: string
          ruc: string
          email: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_name?: string
          ruc?: string
          email?: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dispatches: {
        Row: {
          id: string
          client_id: string
          dispatch_number: string
          bl_number: string | null
          supplier: string | null
          shipping_line: string | null
          arrival_date: string | null
          channel: 'red' | 'orange' | 'green' | 'pending' | null
          status: string
          container_number: string | null
          port: string | null
          weight: number | null
          value: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          dispatch_number: string
          bl_number?: string | null
          supplier?: string | null
          shipping_line?: string | null
          arrival_date?: string | null
          channel?: 'red' | 'orange' | 'green' | 'pending' | null
          status?: string
          container_number?: string | null
          port?: string | null
          weight?: number | null
          value?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          dispatch_number?: string
          bl_number?: string | null
          supplier?: string | null
          shipping_line?: string | null
          arrival_date?: string | null
          channel?: 'red' | 'orange' | 'green' | 'pending' | null
          status?: string
          container_number?: string | null
          port?: string | null
          weight?: number | null
          value?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dispatch_timeline: {
        Row: {
          id: string
          dispatch_id: string
          status: string
          notes: string | null
          updated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dispatch_id: string
          status: string
          notes?: string | null
          updated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dispatch_id?: string
          status?: string
          notes?: string | null
          updated_by?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          dispatch_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          version: number
          notes: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dispatch_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          version?: number
          notes?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dispatch_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          version?: number
          notes?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          dispatch_id: string | null
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dispatch_id?: string | null
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dispatch_id?: string | null
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          dispatch_id: string | null
          title: string
          description: string | null
          event_date: string
          event_type: string
          reminder_sent: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dispatch_id?: string | null
          title: string
          description?: string | null
          event_date: string
          event_type: string
          reminder_sent?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dispatch_id?: string | null
          title?: string
          description?: string | null
          event_date?: string
          event_type?: string
          reminder_sent?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          dispatch_id: string
          amount: number
          payment_type: string
          status: string
          due_date: string | null
          paid_date: string | null
          proof_document_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dispatch_id: string
          amount: number
          payment_type: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          proof_document_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dispatch_id?: string
          amount?: number
          payment_type?: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          proof_document_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
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
      [_ in never]: never
    }
  }
}
