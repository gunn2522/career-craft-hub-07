
-- Ambassador events table
CREATE TABLE public.ambassador_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  mode TEXT DEFAULT 'offline',
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  partner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ambassador_event_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.ambassador_events(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',
  file_url TEXT NOT NULL,
  file_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ambassador_community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ambassador_id, member_user_id)
);

CREATE TABLE public.ambassador_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ambassador_discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.ambassador_discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors manage own events" ON public.ambassador_events
  FOR ALL TO authenticated
  USING (ambassador_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ambassador'))
  WITH CHECK (ambassador_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view ambassador events" ON public.ambassador_events
  FOR SELECT TO anon, authenticated USING (status != 'draft');

CREATE POLICY "Ambassadors manage own media" ON public.ambassador_event_media
  FOR ALL TO authenticated
  USING (ambassador_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  WITH CHECK (ambassador_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Public view event media" ON public.ambassador_event_media
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Ambassadors manage community" ON public.ambassador_community_members
  FOR ALL TO authenticated
  USING (ambassador_id = auth.uid() OR member_user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  WITH CHECK (ambassador_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "View community members" ON public.ambassador_community_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manage discussions" ON public.ambassador_discussions
  FOR ALL TO authenticated
  USING (ambassador_id = auth.uid() OR author_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  WITH CHECK (author_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "View discussions" ON public.ambassador_discussions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manage replies" ON public.ambassador_discussion_replies
  FOR ALL TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "View replies" ON public.ambassador_discussion_replies
  FOR SELECT TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('ambassador-media', 'ambassador-media', true);

CREATE POLICY "Ambassadors upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ambassador-media' AND (has_role(auth.uid(), 'ambassador') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Public read ambassador media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ambassador-media');

CREATE POLICY "Ambassadors delete own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ambassador-media' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin')));

CREATE TRIGGER update_ambassador_events_updated_at
  BEFORE UPDATE ON public.ambassador_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassador_discussions_updated_at
  BEFORE UPDATE ON public.ambassador_discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
