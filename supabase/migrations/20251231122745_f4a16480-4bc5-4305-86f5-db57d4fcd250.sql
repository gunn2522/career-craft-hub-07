-- Create user_career_profiles table for storing user's selected career goal
CREATE TABLE public.user_career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  selected_roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  aspiration TEXT,
  target_job_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_streaks table for tracking learning streaks
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create daily_assignments table for admin-created assignments
CREATE TABLE public.daily_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  step_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  skill_focus TEXT,
  difficulty TEXT DEFAULT 'medium',
  estimated_time TEXT DEFAULT '30-60 mins',
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create assignment_submissions table for user submissions
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.daily_assignments(id) ON DELETE CASCADE NOT NULL,
  submission_type TEXT NOT NULL, -- 'file', 'github', 'document'
  submission_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'approved', 'needs_improvement'
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, assignment_id)
);

-- Create badges table for available badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- icon name or emoji
  category TEXT, -- 'streak', 'skill', 'project', 'milestone'
  requirement_type TEXT, -- 'streak_days', 'assignments_completed', 'roadmap_progress'
  requirement_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_badges table for earned badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  shared_on_linkedin BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Create user_roadmap_progress table for detailed step progress
CREATE TABLE public.user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  step_index INTEGER NOT NULL,
  status TEXT DEFAULT 'locked', -- 'locked', 'in_progress', 'completed'
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, roadmap_id, step_index)
);

-- Enable RLS on all tables
ALTER TABLE public.user_career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_career_profiles
CREATE POLICY "Users can view their own career profile"
ON public.user_career_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career profile"
ON public.user_career_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career profile"
ON public.user_career_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all career profiles"
ON public.user_career_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks"
ON public.user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for daily_assignments
CREATE POLICY "Anyone can view active assignments"
ON public.daily_assignments FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage assignments"
ON public.daily_assignments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for assignment_submissions
CREATE POLICY "Users can view their own submissions"
ON public.assignment_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
ON public.assignment_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
ON public.assignment_submissions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions"
ON public.assignment_submissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
ON public.user_badges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user badges"
ON public.user_badges FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roadmap_progress
CREATE POLICY "Users can view their own progress"
ON public.user_roadmap_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_roadmap_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_roadmap_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all progress"
ON public.user_roadmap_progress FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_user_career_profiles_updated_at
BEFORE UPDATE ON public.user_career_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_assignments_updated_at
BEFORE UPDATE ON public.daily_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roadmap_progress_updated_at
BEFORE UPDATE ON public.user_roadmap_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('First Step', 'Started your career journey', '🚀', 'milestone', 'assignments_completed', 1),
('Week Warrior', '7-day learning streak', '🔥', 'streak', 'streak_days', 7),
('Consistency King', '30-day learning streak', '👑', 'streak', 'streak_days', 30),
('Skill Starter', 'Completed first skill module', '⭐', 'skill', 'assignments_completed', 5),
('Project Pro', 'Completed a mini project', '🏆', 'project', 'assignments_completed', 10),
('Roadmap Master', 'Completed 50% of roadmap', '🎯', 'milestone', 'roadmap_progress', 50),
('Career Champion', 'Completed entire roadmap', '🏅', 'milestone', 'roadmap_progress', 100);