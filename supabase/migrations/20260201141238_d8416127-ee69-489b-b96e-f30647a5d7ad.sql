-- Fix remaining policies that might not exist yet
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.mentor_posts;
DROP POLICY IF EXISTS "Mentors can manage own posts" ON public.mentor_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.mentor_posts;

CREATE POLICY "view_published_posts" ON public.mentor_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "mentor_manage_own_posts" ON public.mentor_posts
  FOR ALL USING (
    mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_all_posts" ON public.mentor_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));