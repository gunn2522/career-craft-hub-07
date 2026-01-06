import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ROLE_KEY = 'ccc_visitor_role';
const VISITOR_ROLE_ID_KEY = 'ccc_visitor_role_id';

export type VisitorRoleType = 'school_student' | 'college_student' | 'mentor' | 'institution' | 'partner' | null;

interface VisitorRoleData {
  id: string;
  name: string;
  display_name: string;
}

export const useVisitorRole = () => {
  const [visitorRole, setVisitorRoleState] = useState<VisitorRoleType>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VISITOR_ROLE_KEY) as VisitorRoleType;
    }
    return null;
  });

  const [visitorRoleId, setVisitorRoleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VISITOR_ROLE_ID_KEY);
    }
    return null;
  });

  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VISITOR_ROLE_KEY) !== null;
    }
    return false;
  });

  // Fetch visitor roles from database to get ID
  const { data: visitorRoles } = useQuery({
    queryKey: ['visitor-roles-lookup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_roles')
        .select('id, name, display_name')
        .eq('is_active', true);
      if (error) throw error;
      return data as VisitorRoleData[];
    },
  });

  useEffect(() => {
    const storedRole = localStorage.getItem(VISITOR_ROLE_KEY);
    const storedRoleId = localStorage.getItem(VISITOR_ROLE_ID_KEY);
    if (storedRole) {
      setVisitorRoleState(storedRole as VisitorRoleType);
      setHasVisited(true);
    }
    if (storedRoleId) {
      setVisitorRoleId(storedRoleId);
    }
  }, []);

  // Sync role ID when roles are loaded
  useEffect(() => {
    if (visitorRole && visitorRoles && !visitorRoleId) {
      const foundRole = visitorRoles.find(r => r.name === visitorRole);
      if (foundRole) {
        localStorage.setItem(VISITOR_ROLE_ID_KEY, foundRole.id);
        setVisitorRoleId(foundRole.id);
      }
    }
  }, [visitorRole, visitorRoles, visitorRoleId]);

  const setVisitorRole = (role: VisitorRoleType, roleId?: string) => {
    if (role) {
      localStorage.setItem(VISITOR_ROLE_KEY, role);
      setVisitorRoleState(role);
      setHasVisited(true);
      
      // Store role ID if provided or find it from loaded roles
      if (roleId) {
        localStorage.setItem(VISITOR_ROLE_ID_KEY, roleId);
        setVisitorRoleId(roleId);
      } else if (visitorRoles) {
        const foundRole = visitorRoles.find(r => r.name === role);
        if (foundRole) {
          localStorage.setItem(VISITOR_ROLE_ID_KEY, foundRole.id);
          setVisitorRoleId(foundRole.id);
        }
      }
    } else {
      localStorage.removeItem(VISITOR_ROLE_KEY);
      localStorage.removeItem(VISITOR_ROLE_ID_KEY);
      setVisitorRoleState(null);
      setVisitorRoleId(null);
      setHasVisited(false);
    }
  };

  const clearVisitorRole = () => {
    localStorage.removeItem(VISITOR_ROLE_KEY);
    localStorage.removeItem(VISITOR_ROLE_ID_KEY);
    setVisitorRoleState(null);
    setVisitorRoleId(null);
    setHasVisited(false);
  };

  return {
    visitorRole,
    visitorRoleId,
    hasVisited,
    setVisitorRole,
    clearVisitorRole,
    visitorRoles,
  };
};