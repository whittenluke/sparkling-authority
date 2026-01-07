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
          username: string
          display_name: string | null
          bio: string | null
          website: string | null
          avatar_url: string | null
          is_admin: boolean
          reputation_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          website?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          website?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          country_of_origin: string | null
          founded_year: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          country_of_origin?: string | null
          founded_year?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          country_of_origin?: string | null
          founded_year?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string | null
          flavor_tags: string[] | null
          flavor_categories: string[] | null
          carbonation_level: 'light' | 'medium' | 'strong'
          container_type: 'can' | 'bottle' | 'other'
          container_size: string | null
          is_discontinued: boolean
          nutrition_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description?: string | null
          flavor_tags?: string[] | null
          flavor_categories?: string[] | null
          carbonation_level: 'light' | 'medium' | 'strong'
          container_type: 'can' | 'bottle' | 'other'
          container_size?: string | null
          is_discontinued?: boolean
          nutrition_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          description?: string | null
          flavor_tags?: string[] | null
          flavor_categories?: string[] | null
          carbonation_level?: 'light' | 'medium' | 'strong'
          container_type?: 'can' | 'bottle' | 'other'
          container_size?: string | null
          is_discontinued?: boolean
          nutrition_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          overall_rating: number
          taste_rating: number | null
          carbonation_rating: number | null
          aftertaste_rating: number | null
          review_text: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          overall_rating: number
          taste_rating?: number | null
          carbonation_rating?: number | null
          aftertaste_rating?: number | null
          review_text: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          overall_rating?: number
          taste_rating?: number | null
          carbonation_rating?: number | null
          aftertaste_rating?: number | null
          review_text?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          status: 'draft' | 'published' | 'archived'
          meta_description: string | null
          tags: string[] | null
          notion_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          meta_description?: string | null
          tags?: string[] | null
          notion_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          meta_description?: string | null
          tags?: string[] | null
          notion_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          content: string
          parent_id: string | null
          article_id: string | null
          review_id: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          parent_id?: string | null
          article_id?: string | null
          review_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          article_id?: string | null
          review_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          article_id: string | null
          review_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id?: string | null
          review_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string | null
          review_id?: string | null
          comment_id?: string | null
          created_at?: string
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