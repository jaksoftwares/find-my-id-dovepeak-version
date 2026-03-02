-- Add admin_notes and matched_at columns to lost_requests table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE lost_requests ADD COLUMN admin_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_requests' AND column_name = 'matched_at') THEN
        ALTER TABLE lost_requests ADD COLUMN matched_at TIMESTAMPTZ;
    END IF;
END $$;
