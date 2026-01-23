-- =============================================
-- SCHOOL STUDENT MODULE - COMPLETE SCHEMA
-- =============================================

-- 1. PSYCHOMETRIC ASSESSMENT SYSTEM
-- =============================================

-- Test question types enum
CREATE TYPE public.question_type AS ENUM ('mcq', 'likert');

-- Psychometric Tests (admin can create multiple tests)
CREATE TABLE public.psychometric_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  target_role TEXT DEFAULT 'school_student',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Psychometric Test Sections (group questions by category)
CREATE TABLE public.psychometric_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.psychometric_tests(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Psychometric Questions
CREATE TABLE public.psychometric_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.psychometric_sections(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'mcq',
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Psychometric Question Options (for MCQ and Likert)
CREATE TABLE public.psychometric_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.psychometric_questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  score_value INTEGER DEFAULT 0,
  stream_mapping UUID REFERENCES public.career_domains(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Test Responses (store user answers)
CREATE TABLE public.psychometric_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.psychometric_tests(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ,
  total_score INTEGER,
  recommended_stream_id UUID REFERENCES public.career_domains(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Individual Answers
CREATE TABLE public.psychometric_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES public.psychometric_responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.psychometric_questions(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.psychometric_options(id) ON DELETE CASCADE,
  score_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GOVERNMENT EXAMS SYSTEM
-- =============================================

CREATE TABLE public.government_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  eligibility_criteria TEXT,
  exam_pattern TEXT,
  official_website TEXT,
  stream_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  exam_date TEXT,
  registration_deadline TEXT,
  preparation_tips TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exam to Career mapping (which careers require this exam)
CREATE TABLE public.exam_career_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.government_exams(id) ON DELETE CASCADE NOT NULL,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, career_id)
);

-- 3. SCHOLARSHIPS SYSTEM
-- =============================================

CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  description TEXT,
  eligibility_criteria TEXT,
  amount TEXT,
  application_deadline TEXT,
  application_link TEXT,
  stream_id UUID REFERENCES public.career_domains(id),
  category_id UUID REFERENCES public.career_categories(id),
  is_government BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. OLYMPIADS & COMPETITIONS SYSTEM
-- =============================================

CREATE TABLE public.olympiads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  eligibility_criteria TEXT,
  subjects TEXT[],
  official_website TEXT,
  stream_id UUID REFERENCES public.career_domains(id),
  exam_date TEXT,
  registration_deadline TEXT,
  benefits TEXT,
  is_international BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MODULE HERO CONTENT (per user type)
-- =============================================

CREATE TABLE public.module_hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  secondary_cta_text TEXT,
  secondary_cta_link TEXT,
  background_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default hero content for each module
INSERT INTO public.module_hero_content (module_key, title, subtitle, cta_text, cta_link) VALUES
('school_student', 'Discover Your Perfect Career Path', 'Take our psychometric assessment and find the right stream for your future', 'Start Assessment', '/school-careers'),
('college_student', 'Master Your Career Skills', 'Follow structured roadmaps and build expertise in your chosen field', 'Explore Roadmaps', '/craft'),
('mentor', 'Guide the Next Generation', 'Share your expertise and help students achieve their career goals', 'Start Mentoring', '/my-career-lab'),
('institution', 'Partner for Student Success', 'Connect your institution with top career resources and opportunities', 'Partner With Us', '/partner'),
('partner_company', 'Find Top Talent', 'Access skilled candidates ready to contribute to your organization', 'Hire Talent', '/partner');

-- 6. USER MODULE PREFERENCES (for switching)
-- =============================================

-- Add active_module to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_module TEXT DEFAULT 'college_student';

-- 7. ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.psychometric_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychometric_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychometric_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychometric_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychometric_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychometric_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_career_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olympiads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_hero_content ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
-- =============================================

-- Psychometric Tests - Public read, admin write
CREATE POLICY "Anyone can view active tests" ON public.psychometric_tests FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tests" ON public.psychometric_tests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Psychometric Sections - Public read, admin write
CREATE POLICY "Anyone can view sections" ON public.psychometric_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage sections" ON public.psychometric_sections FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Psychometric Questions - Public read, admin write
CREATE POLICY "Anyone can view questions" ON public.psychometric_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage questions" ON public.psychometric_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Psychometric Options - Public read, admin write
CREATE POLICY "Anyone can view options" ON public.psychometric_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage options" ON public.psychometric_options FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Psychometric Responses - User owns their responses
CREATE POLICY "Users can view own responses" ON public.psychometric_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own responses" ON public.psychometric_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON public.psychometric_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all responses" ON public.psychometric_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Psychometric Answers - User owns their answers
CREATE POLICY "Users can manage own answers" ON public.psychometric_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.psychometric_responses pr WHERE pr.id = response_id AND pr.user_id = auth.uid())
);
CREATE POLICY "Admins can view all answers" ON public.psychometric_answers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Government Exams - Public read, admin write
CREATE POLICY "Anyone can view active exams" ON public.government_exams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exams" ON public.government_exams FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Exam Career Mapping - Public read, admin write
CREATE POLICY "Anyone can view exam mappings" ON public.exam_career_mapping FOR SELECT USING (true);
CREATE POLICY "Admins can manage exam mappings" ON public.exam_career_mapping FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Scholarships - Public read, admin write
CREATE POLICY "Anyone can view active scholarships" ON public.scholarships FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage scholarships" ON public.scholarships FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Olympiads - Public read, admin write
CREATE POLICY "Anyone can view active olympiads" ON public.olympiads FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage olympiads" ON public.olympiads FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Module Hero Content - Public read, admin write
CREATE POLICY "Anyone can view hero content" ON public.module_hero_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero content" ON public.module_hero_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_psychometric_tests_updated_at BEFORE UPDATE ON public.psychometric_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_exams_updated_at BEFORE UPDATE ON public.government_exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_olympiads_updated_at BEFORE UPDATE ON public.olympiads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_hero_content_updated_at BEFORE UPDATE ON public.module_hero_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();