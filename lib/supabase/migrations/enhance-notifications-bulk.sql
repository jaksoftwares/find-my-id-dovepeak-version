-- Enhance notifications for bulk support and efficient reading

-- 1. Update notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_broadcast BOOLEAN DEFAULT false;
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

-- 2. Create notification_reads table to track who read what broadcast
CREATE TABLE IF NOT EXISTS notification_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, notification_id)
);

-- 3. RLS for notification_reads
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own reads" ON notification_reads;
CREATE POLICY "Users can manage their own reads"
ON notification_reads
FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reads" ON notification_reads;
CREATE POLICY "Admins can view all reads"
ON notification_reads
FOR SELECT
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Update existing notifications to be non-broadcast (they should already be)
UPDATE notifications SET is_broadcast = false WHERE is_broadcast IS NULL;

-- 5. Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own and broadcast notifications" ON notifications;
CREATE POLICY "Users can view own and broadcast notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id OR is_broadcast = true);

DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications;
CREATE POLICY "Admins manage all notifications"
ON notifications
FOR ALL
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
