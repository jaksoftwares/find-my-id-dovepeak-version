-- Update submissions table to link to the finder if they are logged in
-- and add necessary columns for better tracking

DO $$ 
BEGIN
    -- Add finder_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'finder_id') THEN
        ALTER TABLE submissions ADD COLUMN finder_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Add status column to submissions if it doesn't exist (to replace simple approved boolean if we want)
    -- But for now we'll stick to 'approved' boolean as per existing schema or add a status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'status') THEN
        ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- RLS for submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Finders can view their own submissions
-- Check if policy exists first (Supabase usually handles this via migrations, but for raw SQL):
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
CREATE POLICY "Users can view their own submissions"
ON submissions
FOR SELECT
USING (auth.uid() = finder_id);

-- Policy: Admins can view and update all submissions
DROP POLICY IF EXISTS "Admins can manage all submissions" ON submissions;
CREATE POLICY "Admins can manage all submissions"
ON submissions
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policy: Anyone can insert into submissions (public reporting)
DROP POLICY IF EXISTS "Anyone can submit a found ID" ON submissions;
CREATE POLICY "Anyone can submit a found ID"
ON submissions
FOR INSERT
WITH CHECK (true);
