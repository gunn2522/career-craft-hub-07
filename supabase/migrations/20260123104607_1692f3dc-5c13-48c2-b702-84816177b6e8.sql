-- =============================================
-- MENTOR MODULE COMPREHENSIVE SCHEMA
-- =============================================

-- 1. Mentor Subscription Plans (admin-configured)
CREATE TABLE public.mentor_subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly, one-time
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  max_subscribers INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Student Mentor Subscriptions
CREATE TABLE public.mentor_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.mentor_subscription_plans(id),
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  subscription_type TEXT DEFAULT 'free', -- free, paid
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, mentor_id)
);

-- 3. Mentor Rooms (Communities)
CREATE TABLE public.mentor_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  room_type TEXT DEFAULT 'discussion', -- discussion, q&a, announcements
  access_type TEXT DEFAULT 'free', -- free, subscribers_only, paid
  price NUMERIC DEFAULT 0,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  cover_image TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Room Members
CREATE TABLE public.mentor_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.mentor_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- 5. Room Messages (Community Chat)
CREATE TABLE public.mentor_room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.mentor_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, file, image, link
  file_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.mentor_room_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Mentor Events (Paid/Free)
CREATE TABLE public.mentor_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'webinar', -- webinar, workshop, ama, masterclass
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  max_participants INTEGER,
  current_registrations INTEGER DEFAULT 0,
  meeting_link TEXT,
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'upcoming', -- upcoming, live, completed, cancelled
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Event Registrations
CREATE TABLE public.mentor_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.mentor_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, completed, refunded
  payment_amount NUMERIC,
  payment_reference TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id)
);

-- 8. Mentor Payouts
CREATE TABLE public.mentor_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  payout_type TEXT DEFAULT 'subscription', -- subscription, event, other
  source_id UUID, -- event_id or subscription_id
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_reference TEXT,
  platform_fee NUMERIC DEFAULT 0,
  net_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Mentor Daily Tasks/Guidance
CREATE TABLE public.mentor_daily_guidance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  guidance_type TEXT DEFAULT 'task', -- task, tip, challenge, resource
  target_audience TEXT DEFAULT 'all', -- all, subscribers_only
  scheduled_date DATE,
  is_published BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Mentor Notifications to Subscribers
CREATE TABLE public.mentor_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- new_post, new_event, new_task, new_room
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID, -- post_id, event_id, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Degree to Career Mapping (Multiple careers per degree)
CREATE TABLE public.degree_career_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id UUID NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 100, -- 0-100 for sorting
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(degree_id, career_id)
);

-- 12. Add columns to mentor_profiles for enhanced profile
ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS achievements TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{English}'::TEXT[],
ADD COLUMN IF NOT EXISTS total_subscribers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_video_url TEXT,
ADD COLUMN IF NOT EXISTS consultation_rate NUMERIC,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Enable RLS on all tables
ALTER TABLE public.mentor_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_daily_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_career_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_subscription_plans
CREATE POLICY "Anyone can view active plans" ON public.mentor_subscription_plans
  FOR SELECT USING (is_active = true);
CREATE POLICY "Mentors can manage own plans" ON public.mentor_subscription_plans
  FOR ALL USING (has_role(auth.uid(), 'mentor'::app_role) AND mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all plans" ON public.mentor_subscription_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.mentor_subscriptions
  FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Mentors can view their subscribers" ON public.mentor_subscriptions
  FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can subscribe" ON public.mentor_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can manage own subscriptions" ON public.mentor_subscriptions
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all subscriptions" ON public.mentor_subscriptions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_rooms
CREATE POLICY "Anyone can view active public rooms" ON public.mentor_rooms
  FOR SELECT USING (is_active = true AND access_type = 'free');
CREATE POLICY "Subscribers can view subscriber rooms" ON public.mentor_rooms
  FOR SELECT USING (
    is_active = true AND 
    (access_type = 'free' OR 
     EXISTS (SELECT 1 FROM mentor_subscriptions WHERE student_id = auth.uid() AND mentor_id = mentor_rooms.mentor_id AND status = 'active'))
  );
CREATE POLICY "Mentors can manage own rooms" ON public.mentor_rooms
  FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all rooms" ON public.mentor_rooms
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_room_members
CREATE POLICY "Users can view room members" ON public.mentor_room_members
  FOR SELECT USING (EXISTS (SELECT 1 FROM mentor_room_members mrm WHERE mrm.room_id = mentor_room_members.room_id AND mrm.user_id = auth.uid()));
CREATE POLICY "Users can join rooms" ON public.mentor_room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage members" ON public.mentor_room_members
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_room_messages
CREATE POLICY "Room members can view messages" ON public.mentor_room_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM mentor_room_members WHERE room_id = mentor_room_messages.room_id AND user_id = auth.uid()));
CREATE POLICY "Room members can send messages" ON public.mentor_room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (SELECT 1 FROM mentor_room_members WHERE room_id = mentor_room_messages.room_id AND user_id = auth.uid() AND NOT is_muted)
  );
CREATE POLICY "Users can edit own messages" ON public.mentor_room_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for mentor_events
CREATE POLICY "Anyone can view active events" ON public.mentor_events
  FOR SELECT USING (is_active = true);
CREATE POLICY "Mentors can manage own events" ON public.mentor_events
  FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all events" ON public.mentor_events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_event_registrations
CREATE POLICY "Users can view own registrations" ON public.mentor_event_registrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Mentors can view event registrations" ON public.mentor_event_registrations
  FOR SELECT USING (event_id IN (SELECT id FROM mentor_events WHERE mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can register for events" ON public.mentor_event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage registrations" ON public.mentor_event_registrations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_payouts
CREATE POLICY "Mentors can view own payouts" ON public.mentor_payouts
  FOR SELECT USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payouts" ON public.mentor_payouts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_daily_guidance
CREATE POLICY "Anyone can view published public guidance" ON public.mentor_daily_guidance
  FOR SELECT USING (is_published = true AND target_audience = 'all');
CREATE POLICY "Subscribers can view subscriber guidance" ON public.mentor_daily_guidance
  FOR SELECT USING (
    is_published = true AND 
    (target_audience = 'all' OR 
     EXISTS (SELECT 1 FROM mentor_subscriptions WHERE student_id = auth.uid() AND mentor_id = mentor_daily_guidance.mentor_id AND status = 'active'))
  );
CREATE POLICY "Mentors can manage own guidance" ON public.mentor_daily_guidance
  FOR ALL USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all guidance" ON public.mentor_daily_guidance
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentor_notifications
CREATE POLICY "Users can view own notifications" ON public.mentor_notifications
  FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON public.mentor_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Mentors can create notifications" ON public.mentor_notifications
  FOR INSERT WITH CHECK (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- RLS Policies for degree_career_mapping
CREATE POLICY "Anyone can view degree mappings" ON public.degree_career_mapping
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage mappings" ON public.degree_career_mapping
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for room messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_room_messages;

-- Update triggers
CREATE TRIGGER update_mentor_subscription_plans_updated_at BEFORE UPDATE ON public.mentor_subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_subscriptions_updated_at BEFORE UPDATE ON public.mentor_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_rooms_updated_at BEFORE UPDATE ON public.mentor_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_room_messages_updated_at BEFORE UPDATE ON public.mentor_room_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_events_updated_at BEFORE UPDATE ON public.mentor_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_daily_guidance_updated_at BEFORE UPDATE ON public.mentor_daily_guidance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();