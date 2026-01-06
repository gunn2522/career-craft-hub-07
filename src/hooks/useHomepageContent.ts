import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VisitorRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  is_visible: boolean;
  display_order: number;
}

export interface SiteMetric {
  id: string;
  metric_key: string;
  display_label: string;
  value_type: string;
  custom_value: string | null;
  table_name: string | null;
  display_order: number;
  is_visible: boolean;
}

export const useVisitorRoles = () => {
  return useQuery({
    queryKey: ['visitor-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_roles')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as VisitorRole[];
    },
  });
};

export const useHomepageSections = () => {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');
      
      if (error) throw error;
      return data as HomepageSection[];
    },
  });
};

export const useSiteMetrics = () => {
  return useQuery({
    queryKey: ['site-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');
      
      if (error) throw error;
      return data as SiteMetric[];
    },
  });
};

export const useLiveMetricCounts = () => {
  return useQuery({
    queryKey: ['live-metric-counts'],
    queryFn: async () => {
      // Fetch counts from actual tables
      const [profilesResult, mentorsResult, partnersResult, roadmapsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('mentor_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('roadmaps').select('id', { count: 'exact', head: true }),
      ]);

      return {
        total_students: profilesResult.count || 0,
        total_mentors: mentorsResult.count || 0,
        total_partners: partnersResult.count || 0,
        total_roadmaps: roadmapsResult.count || 0,
      };
    },
    staleTime: 30000, // Refresh every 30 seconds
  });
};

export const useHomepageSection = (sectionKey: string) => {
  const { data: sections } = useHomepageSections();
  return sections?.find(s => s.section_key === sectionKey);
};
