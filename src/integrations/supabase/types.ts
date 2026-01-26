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
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_metrics: {
        Row: {
          count_condition: Json | null
          created_at: string | null
          custom_value: string | null
          display_label: string
          display_order: number | null
          id: string
          is_visible: boolean | null
          metric_key: string
          table_name: string | null
          updated_at: string | null
          value_type: string | null
        }
        Insert: {
          count_condition?: Json | null
          created_at?: string | null
          custom_value?: string | null
          display_label: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metric_key: string
          table_name?: string | null
          updated_at?: string | null
          value_type?: string | null
        }
        Update: {
          count_condition?: Json | null
          created_at?: string | null
          custom_value?: string | null
          display_label?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metric_key?: string
          table_name?: string | null
          updated_at?: string | null
          value_type?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          admin_tier: Database["public"]["Enums"]["admin_tier"]
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_tier?: Database["public"]["Enums"]["admin_tier"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_tier?: Database["public"]["Enums"]["admin_tier"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      career_progressions: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          from_career_id: string | null
          id: string
          progression_type: string
          recommended_roadmap_id: string | null
          skill_gap: string[] | null
          to_career_id: string | null
          transition_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          from_career_id?: string | null
          id?: string
          progression_type?: string
          recommended_roadmap_id?: string | null
          skill_gap?: string[] | null
          to_career_id?: string | null
          transition_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          from_career_id?: string | null
          id?: string
          progression_type?: string
          recommended_roadmap_id?: string | null
          skill_gap?: string[] | null
          to_career_id?: string | null
          transition_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_progressions_from_career_id_fkey"
            columns: ["from_career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_progressions_recommended_roadmap_id_fkey"
            columns: ["recommended_roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_progressions_to_career_id_fkey"
            columns: ["to_career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          after_12th_description: string | null
          category: string
          category_id: string | null
          created_at: string
          demand: string | null
          description: string | null
          display_order: number | null
          domain_id: string | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          future_roles: Json | null
          growth: string | null
          id: string
          is_active: boolean | null
          linked_degree_ids: string[] | null
          required_stream: string | null
          responsibilities: string[] | null
          salary: string | null
          search_keywords: string[] | null
          skills: string[] | null
          skills_required: string[] | null
          slug: string | null
          title: string
          transition_time: string | null
          updated_at: string
        }
        Insert: {
          after_12th_description?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          demand?: string | null
          description?: string | null
          display_order?: number | null
          domain_id?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          future_roles?: Json | null
          growth?: string | null
          id?: string
          is_active?: boolean | null
          linked_degree_ids?: string[] | null
          required_stream?: string | null
          responsibilities?: string[] | null
          salary?: string | null
          search_keywords?: string[] | null
          skills?: string[] | null
          skills_required?: string[] | null
          slug?: string | null
          title: string
          transition_time?: string | null
          updated_at?: string
        }
        Update: {
          after_12th_description?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          demand?: string | null
          description?: string | null
          display_order?: number | null
          domain_id?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          future_roles?: Json | null
          growth?: string | null
          id?: string
          is_active?: boolean | null
          linked_degree_ids?: string[] | null
          required_stream?: string | null
          responsibilities?: string[] | null
          salary?: string | null
          search_keywords?: string[] | null
          skills?: string[] | null
          skills_required?: string[] | null
          slug?: string | null
          title?: string
          transition_time?: string | null
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
      degree_career_mapping: {
        Row: {
          career_id: string
          created_at: string
          degree_id: string
          id: string
          is_primary: boolean | null
          notes: string | null
          relevance_score: number | null
        }
        Insert: {
          career_id: string
          created_at?: string
          degree_id: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          relevance_score?: number | null
        }
        Update: {
          career_id?: string
          created_at?: string
          degree_id?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "degree_career_mapping_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "degree_career_mapping_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      degrees: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration: string | null
          eligibility_rules: Json | null
          entrance_exams: string[] | null
          id: string
          is_active: boolean | null
          mapped_roadmap_id: string | null
          name: string
          required_subjects: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          eligibility_rules?: Json | null
          entrance_exams?: string[] | null
          id?: string
          is_active?: boolean | null
          mapped_roadmap_id?: string | null
          name: string
          required_subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          eligibility_rules?: Json | null
          entrance_exams?: string[] | null
          id?: string
          is_active?: boolean | null
          mapped_roadmap_id?: string | null
          name?: string
          required_subjects?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "degrees_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "degrees_mapped_roadmap_id_fkey"
            columns: ["mapped_roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gallery: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          event_date: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          is_visible: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      exam_career_mapping: {
        Row: {
          career_id: string
          created_at: string | null
          exam_id: string
          id: string
          is_mandatory: boolean | null
        }
        Insert: {
          career_id: string
          created_at?: string | null
          exam_id: string
          id?: string
          is_mandatory?: boolean | null
        }
        Update: {
          career_id?: string
          created_at?: string | null
          exam_id?: string
          id?: string
          is_mandatory?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_career_mapping_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_career_mapping_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "government_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      government_exams: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          eligibility_criteria: string | null
          exam_date: string | null
          exam_pattern: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          official_website: string | null
          preparation_tips: string | null
          registration_deadline: string | null
          short_name: string | null
          stream_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          exam_date?: string | null
          exam_pattern?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          official_website?: string | null
          preparation_tips?: string | null
          registration_deadline?: string | null
          short_name?: string | null
          stream_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          exam_date?: string | null
          exam_pattern?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          official_website?: string | null
          preparation_tips?: string | null
          registration_deadline?: string | null
          short_name?: string | null
          stream_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "government_exams_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_role_content: {
        Row: {
          content: Json | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          id: string
          is_visible: boolean | null
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
          visitor_role_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          is_visible?: boolean | null
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          visitor_role_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          is_visible?: boolean | null
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          visitor_role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_role_content_visitor_role_id_fkey"
            columns: ["visitor_role_id"]
            isOneToOne: false
            referencedRelation: "visitor_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          content: Json | null
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      institution_events: {
        Row: {
          audience: string | null
          category_id: string | null
          created_at: string
          current_registrations: number | null
          description: string | null
          event_date: string | null
          event_type: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          is_approved: boolean | null
          location: string | null
          max_attendees: number | null
          mode: string | null
          registration_url: string | null
          stream_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          category_id?: string | null
          created_at?: string
          current_registrations?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          registration_url?: string | null
          stream_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          category_id?: string | null
          created_at?: string
          current_registrations?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          registration_url?: string | null
          stream_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_events_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_members: {
        Row: {
          id: string
          institution_id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          institution_id: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          institution_id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_resources: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          institution_id: string
          is_approved: boolean | null
          stream_id: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institution_id: string
          is_approved?: boolean | null
          stream_id?: string | null
          title: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_approved?: boolean | null
          stream_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_resources_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_resources_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          approval_status: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          display_order: number | null
          email: string | null
          focus_areas: string[] | null
          id: string
          institution_type: string | null
          is_approved: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          location: string | null
          logo_url: string | null
          member_count: number | null
          name: string
          past_collaborations: string[] | null
          phone: string | null
          programs_offered: string[] | null
          social_links: Json | null
          type: string
          updated_at: string
          user_id: string | null
          vision: string | null
          website_url: string | null
        }
        Insert: {
          approval_status?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          email?: string | null
          focus_areas?: string[] | null
          id?: string
          institution_type?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          past_collaborations?: string[] | null
          phone?: string | null
          programs_offered?: string[] | null
          social_links?: Json | null
          type?: string
          updated_at?: string
          user_id?: string | null
          vision?: string | null
          website_url?: string | null
        }
        Update: {
          approval_status?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          email?: string | null
          focus_areas?: string[] | null
          id?: string
          institution_type?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          past_collaborations?: string[] | null
          phone?: string | null
          programs_offered?: string[] | null
          social_links?: Json | null
          type?: string
          updated_at?: string
          user_id?: string | null
          vision?: string | null
          website_url?: string | null
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
      mentor_daily_guidance: {
        Row: {
          content: string | null
          created_at: string
          guidance_type: string | null
          id: string
          is_published: boolean | null
          likes_count: number | null
          mentor_id: string
          scheduled_date: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          guidance_type?: string | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          mentor_id: string
          scheduled_date?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          guidance_type?: string | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          mentor_id?: string
          scheduled_date?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_daily_guidance_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_daily_guidance_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_event_payment_details: {
        Row: {
          created_at: string | null
          id: string
          payment_processor: string | null
          payment_reference: string | null
          registration_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_processor?: string | null
          payment_reference?: string | null
          registration_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_processor?: string | null
          payment_reference?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_event_payment_details_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "mentor_event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          payment_amount: number | null
          payment_status: string | null
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mentor_events"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_events: {
        Row: {
          cover_image: string | null
          created_at: string
          currency: string | null
          current_registrations: number | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          event_type: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_participants: number | null
          meeting_link: string | null
          mentor_id: string
          price: number | null
          recording_url: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          current_registrations?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          mentor_id: string
          price?: number | null
          recording_url?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          current_registrations?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          mentor_id?: string
          price?: number | null
          recording_url?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_events_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_events_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          mentor_id: string
          message: string | null
          notification_type: string
          recipient_id: string
          reference_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mentor_id: string
          message?: string | null
          notification_type: string
          recipient_id: string
          reference_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mentor_id?: string
          message?: string | null
          notification_type?: string
          recipient_id?: string
          reference_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_notifications_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_notifications_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          mentor_id: string
          net_amount: number | null
          payout_type: string | null
          platform_fee: number | null
          processed_at: string | null
          source_id: string | null
          status: string | null
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          mentor_id: string
          net_amount?: number | null
          payout_type?: string | null
          platform_fee?: number | null
          processed_at?: string | null
          source_id?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          mentor_id?: string
          net_amount?: number | null
          payout_type?: string | null
          platform_fee?: number | null
          processed_at?: string | null
          source_id?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_published: boolean | null
          likes_count: number | null
          mentor_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          mentor_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          mentor_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          achievements: string[] | null
          availability_status: string | null
          bio: string | null
          certifications: string[] | null
          consultation_rate: number | null
          created_at: string
          expertise: string[] | null
          featured_video_url: string | null
          hourly_rate: number | null
          id: string
          is_featured: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          portfolio_url: string | null
          rating: number | null
          rejection_reason: string | null
          sessions_conducted: number | null
          specialization: string | null
          students_mentored: number | null
          total_earnings: number | null
          total_subscribers: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          years_of_experience: number | null
        }
        Insert: {
          achievements?: string[] | null
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          consultation_rate?: number | null
          created_at?: string
          expertise?: string[] | null
          featured_video_url?: string | null
          hourly_rate?: number | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          sessions_conducted?: number | null
          specialization?: string | null
          students_mentored?: number | null
          total_earnings?: number | null
          total_subscribers?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Update: {
          achievements?: string[] | null
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          consultation_rate?: number | null
          created_at?: string
          expertise?: string[] | null
          featured_video_url?: string | null
          hourly_rate?: number | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          sessions_conducted?: number | null
          specialization?: string | null
          students_mentored?: number | null
          total_earnings?: number | null
          total_subscribers?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      mentor_room_members: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mentor_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_room_messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          message_type: string | null
          parent_message_id: string | null
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
          is_pinned?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
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
          is_pinned?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_room_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "mentor_room_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mentor_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_rooms: {
        Row: {
          access_type: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          mentor_id: string
          name: string
          price: number | null
          room_type: string | null
          rules: Json | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          mentor_id: string
          name: string
          price?: number | null
          room_type?: string | null
          rules?: Json | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          mentor_id?: string
          name?: string
          price?: number | null
          room_type?: string | null
          rules?: Json | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_rooms_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_rooms_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_subscription_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_subscribers: number | null
          mentor_id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          mentor_id: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          mentor_id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_subscription_plans_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_subscription_plans_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          mentor_id: string
          payment_reference: string | null
          plan_id: string | null
          started_at: string
          status: string | null
          student_id: string
          subscription_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mentor_id: string
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string | null
          student_id: string
          subscription_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mentor_id?: string
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string | null
          student_id?: string
          subscription_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_subscriptions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_subscriptions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "public_mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "mentor_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      module_hero_content: {
        Row: {
          background_image: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module_key: string
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_key: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_key?: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mou_documents: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          document_url: string | null
          id: string
          is_active: boolean | null
          target_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          target_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          target_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      olympiads: {
        Row: {
          benefits: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          eligibility_criteria: string | null
          exam_date: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_international: boolean | null
          name: string
          official_website: string | null
          registration_deadline: string | null
          short_name: string | null
          stream_id: string | null
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          exam_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_international?: boolean | null
          name: string
          official_website?: string | null
          registration_deadline?: string | null
          short_name?: string | null
          stream_id?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          exam_date?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_international?: boolean | null
          name?: string
          official_website?: string | null
          registration_deadline?: string | null
          short_name?: string | null
          stream_id?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "olympiads_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_inquiries: {
        Row: {
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          inquiry_status: string | null
          message: string | null
          notes: string | null
          organization_name: string
          organization_type: string
          plan_interested_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          inquiry_status?: string | null
          message?: string | null
          notes?: string | null
          organization_name: string
          organization_type: string
          plan_interested_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          inquiry_status?: string | null
          message?: string | null
          notes?: string | null
          organization_name?: string
          organization_type?: string
          plan_interested_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_inquiries_plan_interested_id_fkey"
            columns: ["plan_interested_id"]
            isOneToOne: false
            referencedRelation: "organization_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string
          currency: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_events: number | null
          max_resources: number | null
          name: string
          plan_type: string
          price: number | null
          support_level: string | null
          updated_at: string
          visibility_level: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_events?: number | null
          max_resources?: number | null
          name: string
          plan_type: string
          price?: number | null
          support_level?: string | null
          updated_at?: string
          visibility_level?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_events?: number | null
          max_resources?: number | null
          name?: string
          plan_type?: string
          price?: number | null
          support_level?: string | null
          updated_at?: string
          visibility_level?: string | null
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          organization_id: string
          organization_type: string
          payment_amount: number | null
          payment_reference: string | null
          plan_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          organization_id: string
          organization_type: string
          payment_amount?: number | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          organization_type?: string
          payment_amount?: number | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "organization_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_events: {
        Row: {
          category_id: string | null
          created_at: string
          current_registrations: number | null
          description: string | null
          event_date: string | null
          event_type: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          location: string | null
          max_attendees: number | null
          mode: string | null
          partner_id: string
          registration_url: string | null
          stream_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_registrations?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          partner_id: string
          registration_url?: string | null
          stream_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_registrations?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          partner_id?: string
          registration_url?: string | null
          stream_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_events_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_profiles: {
        Row: {
          approval_status: string | null
          company_description: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          email: string | null
          events_initiatives: string | null
          hiring_focus: string[] | null
          id: string
          industry: string | null
          internship_opportunities: string | null
          is_approved: boolean | null
          is_visible: boolean | null
          jobs_posted: number | null
          logo_url: string | null
          partner_id: string | null
          phone: string | null
          profile_views: number | null
          project_opportunities: string | null
          social_links: Json | null
          students_engaged: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email?: string | null
          events_initiatives?: string | null
          hiring_focus?: string[] | null
          id?: string
          industry?: string | null
          internship_opportunities?: string | null
          is_approved?: boolean | null
          is_visible?: boolean | null
          jobs_posted?: number | null
          logo_url?: string | null
          partner_id?: string | null
          phone?: string | null
          profile_views?: number | null
          project_opportunities?: string | null
          social_links?: Json | null
          students_engaged?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email?: string | null
          events_initiatives?: string | null
          hiring_focus?: string[] | null
          id?: string
          industry?: string | null
          internship_opportunities?: string | null
          is_approved?: boolean | null
          is_visible?: boolean | null
          jobs_posted?: number | null
          logo_url?: string | null
          partner_id?: string | null
          phone?: string | null
          profile_views?: number | null
          project_opportunities?: string | null
          social_links?: Json | null
          students_engaged?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_verified: boolean | null
          is_visible: boolean | null
          logo_url: string | null
          name: string
          partner_type: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          logo_url?: string | null
          name: string
          partner_type?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          logo_url?: string | null
          name?: string
          partner_type?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_module: string | null
          avatar_url: string | null
          bio: string | null
          career_goals: string | null
          created_at: string
          current_company: string | null
          current_level: string | null
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          is_mentor: boolean | null
          is_public: boolean | null
          is_recruiter: boolean | null
          job_title: string | null
          linkedin_url: string | null
          long_term_goals: string | null
          portfolio_url: string | null
          preferred_experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          profile_completed: boolean | null
          short_term_goals: string | null
          skills: string[] | null
          status: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          years_experience: number | null
        }
        Insert: {
          active_module?: string | null
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          current_company?: string | null
          current_level?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          is_mentor?: boolean | null
          is_public?: boolean | null
          is_recruiter?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          long_term_goals?: string | null
          portfolio_url?: string | null
          preferred_experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          profile_completed?: boolean | null
          short_term_goals?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          years_experience?: number | null
        }
        Update: {
          active_module?: string | null
          avatar_url?: string | null
          bio?: string | null
          career_goals?: string | null
          created_at?: string
          current_company?: string | null
          current_level?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          is_mentor?: boolean | null
          is_public?: boolean | null
          is_recruiter?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          long_term_goals?: string | null
          portfolio_url?: string | null
          preferred_experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          profile_completed?: boolean | null
          short_term_goals?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          years_experience?: number | null
        }
        Relationships: []
      }
      program_payment_details: {
        Row: {
          created_at: string | null
          id: string
          payment_processor: string | null
          payment_reference: string | null
          registration_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_processor?: string | null
          payment_reference?: string | null
          registration_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_processor?: string | null
          payment_reference?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_payment_details_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "program_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      program_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_reminder_sent: string | null
          payment_amount: number | null
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
      psychometric_answers: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          question_id: string
          response_id: string
          score_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          question_id: string
          response_id: string
          score_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          question_id?: string
          response_id?: string
          score_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "psychometric_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "psychometric_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychometric_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "psychometric_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychometric_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "psychometric_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      psychometric_options: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          option_text: string
          question_id: string
          score_value: number | null
          stream_mapping: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          option_text: string
          question_id: string
          score_value?: number | null
          stream_mapping?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          option_text?: string
          question_id?: string
          score_value?: number | null
          stream_mapping?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychometric_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "psychometric_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychometric_options_stream_mapping_fkey"
            columns: ["stream_mapping"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      psychometric_questions: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          section_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychometric_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "psychometric_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      psychometric_responses: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          recommended_stream_id: string | null
          test_id: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          recommended_stream_id?: string | null
          test_id: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          recommended_stream_id?: string | null
          test_id?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychometric_responses_recommended_stream_id_fkey"
            columns: ["recommended_stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychometric_responses_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "psychometric_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      psychometric_sections: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          test_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          test_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          test_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychometric_sections_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "psychometric_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      psychometric_tests: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          target_role: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          target_role?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          target_role?: string | null
          title?: string
          updated_at?: string | null
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
      roadmap_enrollments: {
        Row: {
          enrolled_at: string
          id: string
          roadmap_id: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          roadmap_id: string
          user_id: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          roadmap_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_enrollments_roadmap_id_fkey"
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
      scholarships: {
        Row: {
          amount: string | null
          application_deadline: string | null
          application_link: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          eligibility_criteria: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_government: boolean | null
          name: string
          provider: string | null
          stream_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: string | null
          application_deadline?: string | null
          application_link?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_government?: boolean | null
          name: string
          provider?: string | null
          stream_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: string | null
          application_deadline?: string | null
          application_link?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eligibility_criteria?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_government?: boolean | null
          name?: string
          provider?: string | null
          stream_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "career_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "career_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      site_metrics: {
        Row: {
          count_condition: Json | null
          created_at: string | null
          custom_value: string | null
          display_label: string
          display_order: number | null
          id: string
          is_visible: boolean | null
          metric_key: string
          table_name: string | null
          updated_at: string | null
          value_type: string | null
        }
        Insert: {
          count_condition?: Json | null
          created_at?: string | null
          custom_value?: string | null
          display_label: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metric_key: string
          table_name?: string | null
          updated_at?: string | null
          value_type?: string | null
        }
        Update: {
          count_condition?: Json | null
          created_at?: string | null
          custom_value?: string | null
          display_label?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metric_key?: string
          table_name?: string | null
          updated_at?: string | null
          value_type?: string | null
        }
        Relationships: []
      }
      student_stream_selections: {
        Row: {
          id: string
          is_confirmed: boolean | null
          psychometric_response_id: string | null
          selected_at: string
          selected_stream: string
          user_id: string
        }
        Insert: {
          id?: string
          is_confirmed?: boolean | null
          psychometric_response_id?: string | null
          selected_at?: string
          selected_stream: string
          user_id: string
        }
        Update: {
          id?: string
          is_confirmed?: boolean | null
          psychometric_response_id?: string | null
          selected_at?: string
          selected_stream?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_stream_selections_psychometric_response_id_fkey"
            columns: ["psychometric_response_id"]
            isOneToOne: false
            referencedRelation: "psychometric_responses"
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
      visitor_roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_mentor_profiles: {
        Row: {
          achievements: string[] | null
          availability_status: string | null
          bio: string | null
          certifications: string[] | null
          consultation_rate: number | null
          created_at: string | null
          expertise: string[] | null
          featured_video_url: string | null
          hourly_rate: number | null
          id: string | null
          is_featured: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          portfolio_url: string | null
          rating: number | null
          sessions_conducted: number | null
          specialization: string | null
          students_mentored: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          achievements?: string[] | null
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          consultation_rate?: number | null
          created_at?: string | null
          expertise?: string[] | null
          featured_video_url?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_featured?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          sessions_conducted?: number | null
          specialization?: string | null
          students_mentored?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          achievements?: string[] | null
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          consultation_rate?: number | null
          created_at?: string | null
          expertise?: string[] | null
          featured_video_url?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_featured?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          sessions_conducted?: number | null
          specialization?: string | null
          students_mentored?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          institution: string | null
          is_public: boolean | null
          skills: string[] | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          institution?: string | null
          is_public?: boolean | null
          skills?: string[] | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          institution?: string | null
          is_public?: boolean | null
          skills?: string[] | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_tier: "super_admin" | "admin" | "moderator"
      app_role: "admin" | "moderator" | "user" | "mentor" | "partner"
      experience_level: "entry" | "mid" | "senior"
      question_type: "mcq" | "likert"
      user_type: "school_student" | "college_student" | "mentor" | "partner"
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
      admin_tier: ["super_admin", "admin", "moderator"],
      app_role: ["admin", "moderator", "user", "mentor", "partner"],
      experience_level: ["entry", "mid", "senior"],
      question_type: ["mcq", "likert"],
      user_type: ["school_student", "college_student", "mentor", "partner"],
    },
  },
} as const
