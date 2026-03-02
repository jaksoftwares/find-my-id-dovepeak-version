-- Add image_url to lost_requests table to allow users to upload photos
-- representing their lost IDs (e.g. proof or old photo)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_requests' AND column_name = 'image_url') THEN
        ALTER TABLE lost_requests ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Also ensuring public_found_reports table exists and has all correct columns
-- This is a safety check in case the previous one wasn't run or needs adjustment

CREATE TABLE IF NOT EXISTS public_found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    id_type id_type NOT NULL,
    registration_number TEXT,
    location_found TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    approved BOOLEAN DEFAULT FALSE,
    finder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
