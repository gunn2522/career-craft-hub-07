export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ambassador_applications: {
        Row: {
          college: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          social_links: Json | null
          status: string | null
          updated_at: string
          user_id: string
          why_ambassador: string | null
          year_of_study: string | null
        }
        Insert: {
          college: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          why_ambassador?: string | null
          year_of_study?: string | null
        }
        Update: {
          college?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          why_ambassador?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          feedback: string | null
          file_name: string | null
          id: string
          status: string | null
          submission_type: string
          submission_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          file_name?: string | null
          id?: string
          status?: string | null
          submission_type: string
          submission_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          file_name?: string | null
          id?: string
          status?: string | null
          submission_type?: string
          submission_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "daily_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          domain_id: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          domain_id: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          domain_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_categories_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      career_domains: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          category: string
          category_id: string | null
          created_at: string
          demand: string | null
          description: string | null
          display_order: number | null
          domain_id: string | null
          growth: string | null
          id: string
          is_active: boolean | null
          salary: string | null
          skills: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          category_id?: string | null
          created_at?: string
          demand?: string | null
          description?: string | null
          display_order?: number | null
          domain_id?: string | null
          growth?: string | null
          id?: string
          is_active?: boolean | null
          salary?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          category_id?: string | null
          created_at?: string
          demand?: string | null
          description?: string | null
          display_order?: number | null
          domain_id?: string | null
          growth?: string | null
          id?: string
          is_active?: boolean | null
          salary?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "careers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "careers_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          is_admin: boolean | null
          joined_at: string
          last_read_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          purpose: string | null
          room_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          purpose?: string | null
          room_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          purpose?: string | null
          room_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          purpose: string | null
          status: string | null
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          purpose?: string | null
          status?: string | null
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          purpose?: string | null
          status?: string | null
          to_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          connected_at: string
          connected_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          connected_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          connected_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_assignments: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          roadmap_id: string
          skill_focus: string | null
          step_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          roadmap_id: string
          skill_focus?: string | null
          step_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          roadmap_id?: string
          skill_focus?: string | null
          step_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_assignments_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          current_attendees: number | null
          date: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          max_attendees: number | null
          mode: string | null
          prize_pool: string | null
          registration_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_attendees?: number | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          prize_pool?: string | null
          registration_url?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_attendees?: number | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          prize_pool?: string | null
          registration_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          apply_url: string | null
          company: string
          created_at: string
          deadline: string | null
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          location: string | null
          requirements: string[] | null
          stipend: string | null
          target_audience: Database["public"]["Enums"]["user_type"][] | null
          title: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          company: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          requirements?: string[] | null
          stipend?: string | null
          target_audience?: Database["public"]["Enums"]["user_type"][] | null
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          requirements?: string[] | null
          stipend?: string | null
          target_audience?: Database["public"]["Enums"]["user_type"][] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_goals: string | null
          created_at: string
          current_company: string | null
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          is_mentor: boolean | null
          is_public: boolean | null
          is_recruiter: boolean | null
          job_title: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          current_company?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          is_mentor?: boolean | null
          is_public?: boolean | null
          is_recruiter?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          current_company?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          is_mentor?: boolean | null
          is_public?: boolean | null
          is_recruiter?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          years_experience?: number | null
        }
        Relationships: []
      }
      program_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_reminder_sent: string | null
          payment_amount: number | null
          payment_reference: string | null
          payment_status: string | null
          phone: string | null
          program_id: string
          reminder_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_reminder_sent?: string | null
          payment_amount?: number | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          program_id: string
          reminder_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_reminder_sent?: string | null
          payment_amount?: number | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          program_id?: string
          reminder_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          duration: string | null
          end_date: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          is_highlighted: boolean | null
          name: string
          outcomes: string[] | null
          price: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          is_highlighted?: boolean | null
          name: string
          outcomes?: string[] | null
          price?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          is_highlighted?: boolean | null
          name?: string
          outcomes?: string[] | null
          price?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          roadmap_id: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          roadmap_id?: string | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          roadmap_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          career_id: string | null
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          domain_id: string | null
          duration: string | null
          id: string
          steps: Json | null
          target_audience: Database["public"]["Enums"]["user_type"][] | null
          title: string
          updated_at: string
        }
        Insert: {
          career_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          domain_id?: string | null
          duration?: string | null
          id?: string
          steps?: Json | null
          target_audience?: Database["public"]["Enums"]["user_type"][] | null
          title: string
          updated_at?: string
        }
        Update: {
          career_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          domain_id?: string | null
          duration?: string | null
          id?: string
          steps?: Json | null
          target_audience?: Database["public"]["Enums"]["user_type"][] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmaps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmaps_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_careers: {
        Row: {
          career_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          career_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          career_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_careers_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_roadmaps: {
        Row: {
          created_at: string
          id: string
          progress: Json | null
          roadmap_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress?: Json | null
          roadmap_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          progress?: Json | null
          roadmap_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_roadmaps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          company: string | null
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          name: string
          story: string | null
          testimonial: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name: string
          story?: string | null
          testimonial?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name?: string
          story?: string | null
          testimonial?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          shared_on_linkedin: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          shared_on_linkedin?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          shared_on_linkedin?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_career_profiles: {
        Row: {
          aspiration: string | null
          created_at: string
          id: string
          selected_roadmap_id: string | null
          target_job_role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aspiration?: string | null
          created_at?: string
          id?: string
          selected_roadmap_id?: string | null
          target_job_role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aspiration?: string | null
          created_at?: string
          id?: string
          selected_roadmap_id?: string | null
          target_job_role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_career_profiles_selected_roadmap_id_fkey"
            columns: ["selected_roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          project_url: string | null
          skills_used: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          skills_used?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          skills_used?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roadmap_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: string
          roadmap_id: string
          started_at: string | null
          status: string | null
          step_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          roadmap_id: string
          started_at?: string | null
          status?: string | null
          step_index: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          roadmap_id?: string
          started_at?: string | null
          status?: string | null
          step_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roadmap_progress_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "mentor"
      user_type: "school_student" | "college_student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "mentor"],
      user_type: ["school_student", "college_student"],
    },
  },
} as const
