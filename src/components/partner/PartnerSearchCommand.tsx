import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase, Calendar, FileText, Building2,
  Settings, Users, TrendingUp, ListOrdered,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerSearchCommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PartnerSearchCommand = ({ open: controlledOpen, onOpenChange }: PartnerSearchCommandProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Fetch partner profile
  const { data: partnerProfile } = useQuery({
    queryKey: ["partner-profile-search", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  // Fetch jobs
  const { data: jobs } = useQuery({
    queryKey: ["partner-jobs-search", partnerProfile?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_jobs")
        .select("id, title, job_type")
        .eq("partner_id", partnerProfile?.id)
        .limit(5);
      return data || [];
    },
    enabled: !!partnerProfile?.id
  });

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ["partner-events-search", partnerProfile?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_events")
        .select("id, title, event_type")
        .eq("partner_id", partnerProfile?.id)
        .limit(5);
      return data || [];
    },
    enabled: !!partnerProfile?.id
  });

  // Fetch posts
  const { data: posts } = useQuery({
    queryKey: ["partner-posts-search", partnerProfile?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_posts")
        .select("id, title, post_type")
        .eq("partner_id", partnerProfile?.id)
        .limit(5);
      return data || [];
    },
    enabled: !!partnerProfile?.id
  });

  const navigationItems = [
    { label: "Dashboard", icon: Building2, path: "/partner-dashboard" },
    { label: "Company Profile", icon: Building2, path: "/partner-dashboard/profile" },
    { label: "Job Postings", icon: Briefcase, path: "/partner-dashboard/jobs" },
    { label: "Events", icon: Calendar, path: "/partner-dashboard/events" },
    { label: "Posts", icon: FileText, path: "/partner-dashboard/posts" },
    { label: "Interview Process", icon: ListOrdered, path: "/partner-dashboard/interview-process" },
    { label: "Student Engagement", icon: Users, path: "/partner-dashboard/engagement" },
    { label: "Analytics", icon: TrendingUp, path: "/partner-dashboard/analytics" },
    { label: "Settings", icon: Settings, path: "/partner-dashboard/settings" },
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search jobs, events, posts..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSelect(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {jobs && jobs.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Jobs">
                {jobs.map((job: any) => (
                  <CommandItem
                    key={job.id}
                    onSelect={() => handleSelect("/partner-dashboard/jobs")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>{job.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {job.job_type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {events && events.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Events">
                {events.map((event: any) => (
                  <CommandItem
                    key={event.id}
                    onSelect={() => handleSelect("/partner-dashboard/events")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{event.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {event.event_type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {posts && posts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Posts">
                {posts.map((post: any) => (
                  <CommandItem
                    key={post.id}
                    onSelect={() => handleSelect("/partner-dashboard/posts")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{post.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {post.post_type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
