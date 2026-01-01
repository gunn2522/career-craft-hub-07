-- Fix RLS policy for profiles to allow viewing public profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can view public profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_public = true);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Insert a sample roadmap for testing
INSERT INTO public.roadmaps (title, description, duration, difficulty, category, steps)
VALUES (
  'Full Stack Web Developer',
  'Master modern web development from frontend to backend. Learn HTML, CSS, JavaScript, React, Node.js, and databases.',
  '12 weeks',
  'intermediate',
  'Technology',
  '[
    {"order": 1, "title": "HTML & CSS Fundamentals", "completed": false},
    {"order": 2, "title": "JavaScript Essentials", "completed": false},
    {"order": 3, "title": "React.js Development", "completed": false},
    {"order": 4, "title": "Node.js & Express", "completed": false},
    {"order": 5, "title": "Database Design", "completed": false},
    {"order": 6, "title": "API Development", "completed": false},
    {"order": 7, "title": "Deployment & DevOps", "completed": false}
  ]'::jsonb
);

INSERT INTO public.roadmaps (title, description, duration, difficulty, category, steps)
VALUES (
  'Data Science & Analytics',
  'Learn data analysis, visualization, machine learning, and statistical modeling to become a data scientist.',
  '16 weeks',
  'advanced',
  'Data Science',
  '[
    {"order": 1, "title": "Python Programming", "completed": false},
    {"order": 2, "title": "Data Analysis with Pandas", "completed": false},
    {"order": 3, "title": "Data Visualization", "completed": false},
    {"order": 4, "title": "Statistics & Probability", "completed": false},
    {"order": 5, "title": "Machine Learning Basics", "completed": false},
    {"order": 6, "title": "Advanced ML Models", "completed": false}
  ]'::jsonb
);

INSERT INTO public.roadmaps (title, description, duration, difficulty, category, steps)
VALUES (
  'UI/UX Design',
  'Master user interface and user experience design principles, tools like Figma, and create stunning digital products.',
  '8 weeks',
  'beginner',
  'Design',
  '[
    {"order": 1, "title": "Design Fundamentals", "completed": false},
    {"order": 2, "title": "User Research", "completed": false},
    {"order": 3, "title": "Wireframing & Prototyping", "completed": false},
    {"order": 4, "title": "Figma Mastery", "completed": false},
    {"order": 5, "title": "Design Systems", "completed": false}
  ]'::jsonb
);