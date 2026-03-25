-- Migration: Add Communication & Threaded Replies to Notifications
-- Description: Extends the notifications table to support threaded messaging between users and admins.
-- Includes support for sender tracking, parent-child message relationships, and role-based permissions for super_admins.

-- 1. Enum Synchronization: Add 'super_admin' to user_role if it doesn't exist
-- Note: Outside of DO $$ because ALTER TYPE ADD VALUE cannot run in transaction blocks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin') THEN
        ALTER TYPE user_role ADD VALUE 'super_admin';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Columns Addition: Safely add all necessary messaging fields
DO $$ 
BEGIN
    -- Track who sent the message
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'sender_id') THEN
        ALTER TABLE notifications ADD COLUMN sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Enable threading (reply chain)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'parent_id') THEN
        ALTER TABLE notifications ADD COLUMN parent_id UUID REFERENCES notifications(id) ON DELETE CASCADE;
    END IF;

    -- Entity association (Linking to a specific claim or submission)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'entity_type') THEN
        ALTER TABLE notifications ADD COLUMN entity_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'entity_id') THEN
        ALTER TABLE notifications ADD COLUMN entity_id UUID;
    END IF;

    -- Communication control
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'allow_reply') THEN
        ALTER TABLE notifications ADD COLUMN allow_reply BOOLEAN DEFAULT FALSE;
    END IF;

    -- Thread grouping
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'conversation_id') THEN
        ALTER TABLE notifications ADD COLUMN conversation_id UUID;
    END IF;
END $$;

-- 3. Policy Redefinitions: Implementing Row Level Security (RLS) for messaging
-- Drop existing policies first to ensure a clean update
DROP POLICY IF EXISTS "Users can view own and broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "Users can send replies" ON notifications;
DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications;

-- RLS: SELECT - Allow recipients, senders, and broadcast recipients
CREATE POLICY "Users can view own and broadcast notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = sender_id OR is_broadcast = true);

-- RLS: INSERT - Allow users to send messages (replies are checked at API level)
CREATE POLICY "Users can send replies"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- RLS: ALL ACCESS - Grant full management rights to Admins and Super Admins
CREATE POLICY "Admins manage all notifications"
ON notifications
FOR ALL
USING ( 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- 4. Performance Indexes: Optimizing for thread lookups
CREATE INDEX IF NOT EXISTS idx_notifications_conversation_id ON notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
