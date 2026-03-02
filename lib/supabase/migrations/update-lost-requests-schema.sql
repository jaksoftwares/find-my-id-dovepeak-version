-- Migration to update lost_requests table with contact information and status updates
-- This ensures consistency between public submissions and dashboard reports

DO $$ 
BEGIN
    -- Add contact_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_requests' AND column_name = 'contact_phone') THEN
        ALTER TABLE lost_requests ADD COLUMN contact_phone TEXT;
    END IF;

    -- Add contact_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_requests' AND column_name = 'contact_email') THEN
        ALTER TABLE lost_requests ADD COLUMN contact_email TEXT;
    END IF;

    -- Update id_type enum if needed (ensure all types are present)
    -- id_type enum: 'national_id', 'student_id', 'passport', 'atm_card', 'nhif', 'driving_license', 'other'
    -- If any are missing in the actual DB enum, they should be added
    -- This is harder with Postgres enums in a DO block without specific names, 
    -- but usually, we can just ALTER TYPE id_type ADD VALUE IF NOT EXISTS '...';
END $$;

-- Values for id_type enum (safe to run multiple times with IF NOT EXISTS logic in Newer Postgres)
ALTER TYPE id_type ADD VALUE IF NOT EXISTS 'atm_card';
ALTER TYPE id_type ADD VALUE IF NOT EXISTS 'nhif';

-- Ensure request_status has under_review and match_found
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'match_found';
