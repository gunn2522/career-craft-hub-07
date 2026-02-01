
-- =====================================================
-- RE-FIX ALL BROKEN RLS POLICIES (Proper Role Specification)
-- =====================================================

-- =====================================================
-- 1. MENTOR_PROFILES - Drop old and recreate
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Admins can view all mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Public can view verified mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can insert their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can update their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can view own mentor profile" ON public.mentor_profiles;

CREATE POLICY "Admins manage all mentor profiles"
  ON public.mentor_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view verified mentor profiles"
  ON public.mentor_profiles FOR SELECT
  TO anon, authenticated
  USING (verification_status = 'verified');

CREATE POLICY "Users view own mentor profile"
  ON public.mentor_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mentor profile"
  ON public.mentor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mentor profile"
  ON public.mentor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. MENTOR_EVENTS
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all events" ON public.mentor_events;
DROP POLICY IF EXISTS "Anyone can view active events" ON public.mentor_events;
DROP POLICY IF EXISTS "Mentors can manage own events" ON public.mentor_events;

CREATE POLICY "Admins manage all mentor events"
  ON public.mentor_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view active mentor events"
  ON public.mentor_events FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Mentors manage own events"
  ON public.mentor_events FOR ALL
  TO authenticated
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()))
  WITH CHECK (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- =====================================================
-- 3. MENTOR_ROOMS
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all rooms" ON public.mentor_rooms;
DROP POLICY IF EXISTS "Anyone can view active public rooms" ON public.mentor_rooms;
DROP POLICY IF EXISTS "Mentors can manage own rooms" ON public.mentor_rooms;
DROP POLICY IF EXISTS "Subscribers can view subscriber rooms" ON public.mentor_rooms;

CREATE POLICY "Admins manage all mentor rooms"
  ON public.mentor_rooms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view free active rooms"
  ON public.mentor_rooms FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND access_type = 'free');

CREATE POLICY "Mentors manage own rooms"
  ON public.mentor_rooms FOR ALL
  TO authenticated
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()))
  WITH CHECK (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Subscribers view subscriber rooms"
  ON public.mentor_rooms FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      access_type = 'free' OR 
      EXISTS (
        SELECT 1 FROM public.mentor_subscriptions 
        WHERE student_id = auth.uid() 
        AND mentor_id = mentor_rooms.mentor_id 
        AND status = 'active'
      )
    )
  );

-- =====================================================
-- 4. MENTOR_SUBSCRIPTIONS
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.mentor_subscriptions;
DROP POLICY IF EXISTS "Mentors can view their subscribers" ON public.mentor_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.mentor_subscriptions;
DROP POLICY IF EXISTS "Users can subscribe" ON public.mentor_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.mentor_subscriptions;

CREATE POLICY "Admins manage all subscriptions"
  ON public.mentor_subscriptions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors view their subscribers"
  ON public.mentor_subscriptions FOR SELECT
  TO authenticated
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users view own subscriptions"
  ON public.mentor_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users subscribe"
  ON public.mentor_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users manage own subscriptions"
  ON public.mentor_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- =====================================================
-- 5. MENTOR_DAILY_GUIDANCE
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all guidance" ON public.mentor_daily_guidance;
DROP POLICY IF EXISTS "Anyone can view published public guidance" ON public.mentor_daily_guidance;
DROP POLICY IF EXISTS "Mentors can manage own guidance" ON public.mentor_daily_guidance;
DROP POLICY IF EXISTS "Subscribers can view subscriber guidance" ON public.mentor_daily_guidance;

CREATE POLICY "Admins manage all guidance"
  ON public.mentor_daily_guidance FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view published public guidance"
  ON public.mentor_daily_guidance FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND target_audience = 'all');

CREATE POLICY "Mentors manage own guidance"
  ON public.mentor_daily_guidance FOR ALL
  TO authenticated
  USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()))
  WITH CHECK (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Subscribers view subscriber guidance"
  ON public.mentor_daily_guidance FOR SELECT
  TO authenticated
  USING (
    is_published = true AND (
      target_audience = 'all' OR 
      EXISTS (
        SELECT 1 FROM public.mentor_subscriptions 
        WHERE student_id = auth.uid() 
        AND mentor_id = mentor_daily_guidance.mentor_id 
        AND status = 'active'
      )
    )
  );

-- =====================================================
-- 6. MENTOR_NOTIFICATIONS
-- =====================================================
DROP POLICY IF EXISTS "Mentors can create notifications" ON public.mentor_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.mentor_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.mentor_notifications;

CREATE POLICY "Mentors create notifications"
  ON public.mentor_notifications FOR INSERT
  TO authenticated
  WITH CHECK (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users view own notifications"
  ON public.mentor_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users update own notifications"
  ON public.mentor_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- =====================================================
-- 7. MENTOR_EVENT_REGISTRATIONS
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.mentor_event_registrations;
DROP POLICY IF EXISTS "Mentors can view event registrations" ON public.mentor_event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON public.mentor_event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.mentor_event_registrations;

CREATE POLICY "Admins manage all event registrations"
  ON public.mentor_event_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors view event registrations"
  ON public.mentor_event_registrations FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT me.id FROM public.mentor_events me
      WHERE me.mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users view own registrations"
  ON public.mentor_event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users register for events"
  ON public.mentor_event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. PARTNER_PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Users can insert their own partner profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Users can update their own partner profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Users can view their own partner profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Public can view verified partner profiles" ON public.partner_profiles;

CREATE POLICY "Admins manage all partner profiles"
  ON public.partner_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view verified partner profiles"
  ON public.partner_profiles FOR SELECT
  TO anon, authenticated
  USING (verification_status = 'verified' AND is_visible = true AND is_approved = true);

CREATE POLICY "Users view own partner profile"
  ON public.partner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own partner profile"
  ON public.partner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own partner profile"
  ON public.partner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. PARTNER_JOBS
-- =====================================================
DROP POLICY IF EXISTS "Admin manage all jobs" ON public.partner_jobs;
DROP POLICY IF EXISTS "Partners manage own jobs" ON public.partner_jobs;
DROP POLICY IF EXISTS "Public read active jobs" ON public.partner_jobs;

CREATE POLICY "Admins manage all partner jobs"
  ON public.partner_jobs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners manage own jobs"
  ON public.partner_jobs FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public view active approved jobs"
  ON public.partner_jobs FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_approved = true);

-- =====================================================
-- 10. PARTNER_EVENTS
-- =====================================================
DROP POLICY IF EXISTS "Admin manage all events" ON public.partner_events;
DROP POLICY IF EXISTS "Anyone can view approved partner events" ON public.partner_events;
DROP POLICY IF EXISTS "Partners can manage their events" ON public.partner_events;
DROP POLICY IF EXISTS "Partners manage own events" ON public.partner_events;
DROP POLICY IF EXISTS "Public read active events" ON public.partner_events;

CREATE POLICY "Admins manage all partner events"
  ON public.partner_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners manage own events"
  ON public.partner_events FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public view active approved events"
  ON public.partner_events FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_approved = true);

-- =====================================================
-- 11. PARTNER_POSTS
-- =====================================================
DROP POLICY IF EXISTS "Admin manage all posts" ON public.partner_posts;
DROP POLICY IF EXISTS "Partners manage own posts" ON public.partner_posts;
DROP POLICY IF EXISTS "Public read published posts" ON public.partner_posts;

CREATE POLICY "Admins manage all partner posts"
  ON public.partner_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners manage own posts"
  ON public.partner_posts FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public view published approved posts"
  ON public.partner_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND is_approved = true);

-- =====================================================
-- 12. PARTNER_AUDIT_LOGS
-- =====================================================
DROP POLICY IF EXISTS "Admin read all audit logs" ON public.partner_audit_logs;
DROP POLICY IF EXISTS "Partner insert own audit logs" ON public.partner_audit_logs;
DROP POLICY IF EXISTS "Partners read own audit logs" ON public.partner_audit_logs;

CREATE POLICY "Admins read all audit logs"
  ON public.partner_audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own audit logs"
  ON public.partner_audit_logs FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners insert own audit logs"
  ON public.partner_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
