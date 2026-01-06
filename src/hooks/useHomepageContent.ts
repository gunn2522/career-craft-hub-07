import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisitorRole } from './useVisitorRole';

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

export interface HomepageRoleContent {
  id: string;
  visitor_role_id: string | null;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  content: Record<string, unknown>;
  is_visible: boolean;
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

// Fetch role-specific content for homepage sections
export const useHomepageRoleContent = () => {
  const { visitorRoleId } = useVisitorRole();
  
  return useQuery({
    queryKey: ['homepage-role-content', visitorRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_role_content')
        .select('*')
        .eq('is_visible', true);
      
      if (error) throw error;
      return data as HomepageRoleContent[];
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
      const [profilesResult, mentorsResult, partnersResult, roadmapsResult, eventsResult, careersResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('mentor_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('roadmaps').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('careers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      return {
        total_students: profilesResult.count || 0,
        total_mentors: mentorsResult.count || 0,
        total_partners: partnersResult.count || 0,
        total_roadmaps: roadmapsResult.count || 0,
        total_events: eventsResult.count || 0,
        total_careers: careersResult.count || 0,
      };
    },
    staleTime: 30000, // Refresh every 30 seconds
  });
};

// Get section content based on current visitor role
export const useRoleBasedSection = (sectionKey: string) => {
  const { visitorRoleId } = useVisitorRole();
  const { data: sections } = useHomepageSections();
  const { data: roleContent } = useHomepageRoleContent();
  
  // First check for role-specific content
  const roleSpecificContent = roleContent?.find(
    rc => rc.section_key === sectionKey && rc.visitor_role_id === visitorRoleId
  );
  
  // Fall back to default section content
  const defaultContent = sections?.find(s => s.section_key === sectionKey);
  
  if (roleSpecificContent) {
    return {
      title: roleSpecificContent.title || defaultContent?.title,
      subtitle: roleSpecificContent.subtitle || defaultContent?.subtitle,
      cta_text: roleSpecificContent.cta_text,
      cta_link: roleSpecificContent.cta_link,
      content: roleSpecificContent.content,
      is_role_specific: true,
    };
  }
  
  return {
    title: defaultContent?.title || null,
    subtitle: defaultContent?.subtitle || null,
    cta_text: null,
    cta_link: null,
    content: defaultContent?.content || {},
    is_role_specific: false,
  };
};

export const useHomepageSection = (sectionKey: string) => {
  const { data: sections } = useHomepageSections();
  return sections?.find(s => s.section_key === sectionKey);
};
