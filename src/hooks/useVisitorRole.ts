import { useState, useEffect } from 'react';

const VISITOR_ROLE_KEY = 'ccc_visitor_role';

export type VisitorRoleType = 'school_student' | 'college_student' | 'mentor' | 'institution' | 'partner' | null;

export const useVisitorRole = () => {
  const [visitorRole, setVisitorRoleState] = useState<VisitorRoleType>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VISITOR_ROLE_KEY) as VisitorRoleType;
    }
    return null;
  });

  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VISITOR_ROLE_KEY) !== null;
    }
    return false;
  });

  useEffect(() => {
    const stored = localStorage.getItem(VISITOR_ROLE_KEY);
    if (stored) {
      setVisitorRoleState(stored as VisitorRoleType);
      setHasVisited(true);
    }
  }, []);

  const setVisitorRole = (role: VisitorRoleType) => {
    if (role) {
      localStorage.setItem(VISITOR_ROLE_KEY, role);
    } else {
      localStorage.removeItem(VISITOR_ROLE_KEY);
    }
    setVisitorRoleState(role);
    setHasVisited(role !== null);
  };

  const clearVisitorRole = () => {
    localStorage.removeItem(VISITOR_ROLE_KEY);
    setVisitorRoleState(null);
    setHasVisited(false);
  };

  return {
    visitorRole,
    hasVisited,
    setVisitorRole,
    clearVisitorRole,
  };
};
