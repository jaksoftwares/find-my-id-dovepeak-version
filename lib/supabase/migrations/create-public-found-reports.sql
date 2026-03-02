-- Create a specific table for public-submitted found ID reports
-- This separates public reports from the system's verified IDs (ids_found)

CREATE TABLE IF NOT EXISTS public_found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    id_type id_type NOT NULL,
    registration_number TEXT,
    location_found TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    approved BOOLEAN DEFAULT FALSE,
    finder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public_found_reports ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can insert found reports" ON public_found_reports;
CREATE POLICY "Public can insert found reports" 
ON public_found_reports FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own reports" ON public_found_reports;
CREATE POLICY "Users can view their own reports" 
ON public_found_reports FOR SELECT 
USING (auth.uid() = finder_id);

DROP POLICY IF EXISTS "Admins can manage found reports" ON public_found_reports;
CREATE POLICY "Admins can manage found reports" 
ON public_found_reports FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Migration of any existing data from submissions if applicable
-- (Assuming we want to keep the data we just created)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        INSERT INTO public_found_reports (id, full_name, id_type, registration_number, location_found, description, image_url, contact_info, approved, created_at)
        SELECT id, full_name, id_type, registration_number, location_found, description, image_url, contact_info, approved, created_at
        FROM submissions;
        
        -- Drop the old table if it's no longer needed and it's the one we just created
        -- DROPPING SUBMISSIONS to resolve the "clash" mentioned by the user
        -- DROP TABLE submissions; 
    END IF;
END $$;
