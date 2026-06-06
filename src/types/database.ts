export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          email: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          email: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          email?: string
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          slug: string
          creator_id: string
          surname: string
          first_name: string
          other_names: string | null
          date_of_birth: string | null
          date_of_death: string
          place_of_death: string
          short_message: string
          image_url: string | null
          moderation_mode: 'auto' | 'manual'
          is_published: boolean
          tribute_count: number
          condolence_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          creator_id: string
          surname: string
          first_name: string
          other_names?: string | null
          date_of_birth?: string | null
          date_of_death: string
          place_of_death: string
          short_message: string
          image_url?: string | null
          moderation_mode?: 'auto' | 'manual'
          is_published?: boolean
          tribute_count?: number
          condolence_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          surname?: string
          first_name?: string
          other_names?: string | null
          date_of_birth?: string | null
          date_of_death?: string
          place_of_death?: string
          short_message?: string
          image_url?: string | null
          moderation_mode?: 'auto' | 'manual'
          is_published?: boolean
          tribute_count?: number
          condolence_count?: number
          updated_at?: string
        }
      }
      tributes: {
        Row: {
          id: string
          announcement_id: string
          author_id: string
          type: 'tribute' | 'condolence'
          message: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          announcement_id: string
          author_id: string
          type: 'tribute' | 'condolence'
          message: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          message?: string
          status?: 'pending' | 'approved' | 'rejected'
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'tribute_approved' | 'tribute_rejected' | 'new_tribute' | 'new_condolence'
          title: string
          body: string
          is_read: boolean
          related_announcement_id: string | null
          related_tribute_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'tribute_approved' | 'tribute_rejected' | 'new_tribute' | 'new_condolence'
          title: string
          body: string
          is_read?: boolean
          related_announcement_id?: string | null
          related_tribute_id?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      shares: {
        Row: {
          id: string
          announcement_id: string
          platform: string
          created_at: string
        }
        Insert: {
          id?: string
          announcement_id: string
          platform: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: 'light' | 'dark' | 'system'
          email_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Tribute = Database['public']['Tables']['tributes']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export type AnnouncementWithProfile = Announcement & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}

export type TributeWithProfile = Tribute & {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}
