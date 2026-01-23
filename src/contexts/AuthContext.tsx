import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserType = "school_student" | "college_student" | "mentor" | "partner";
type AppRole = "admin" | "moderator" | "user" | "mentor" | "partner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isMentor: boolean;
  isPartner: boolean;
  isInstitution: boolean;
  userRole: AppRole | null;
  signUp: (email: string, password: string, fullName: string, userType: UserType, institution?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [isInstitution, setIsInstitution] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check user role with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
            checkInstitutionMembership(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsMentor(false);
          setIsPartner(false);
          setIsInstitution(false);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
        checkInstitutionMembership(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
        setIsMentor(false);
        setIsPartner(false);
        setUserRole(null);
        return;
      }
      
      if (data) {
        const role = data.role as AppRole;
        setUserRole(role);
        setIsAdmin(role === "admin");
        setIsMentor(role === "mentor");
        setIsPartner(role === "partner");
      } else {
        setUserRole(null);
        setIsAdmin(false);
        setIsMentor(false);
        setIsPartner(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
      setIsMentor(false);
      setIsPartner(false);
      setUserRole(null);
    }
  };

  const checkInstitutionMembership = async (userId: string) => {
    try {
      // Check if user is linked to an institution
      const { data, error } = await supabase
        .from("institutions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking institution membership:", error);
        setIsInstitution(false);
        return;
      }
      
      setIsInstitution(!!data);
    } catch (error) {
      console.error("Error checking institution membership:", error);
      setIsInstitution(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: UserType,
    institution?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType,
          institution: institution,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };


  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsMentor(false);
    setIsPartner(false);
    setIsInstitution(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        isMentor,
        isPartner,
        isInstitution,
        userRole,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
