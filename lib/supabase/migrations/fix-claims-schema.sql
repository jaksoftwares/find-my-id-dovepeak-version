-- Fix claims table inconsistencies
-- Rename claim_status to status to match API and Frontend
-- Add proof_description column used by the claim workflow

DO $$ 
BEGIN
    -- Rename claim_status to status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'claim_status') THEN
        ALTER TABLE claims RENAME COLUMN claim_status TO status;
    END IF;

    -- Add proof_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'proof_description') THEN
        ALTER TABLE claims ADD COLUMN proof_description TEXT;
    END IF;

    -- Update updated_at column to be more standard if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claims' AND column_name = 'updated_at') THEN
        ALTER TABLE claims ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Update RLS policies to use the new column name
DROP POLICY IF EXISTS "Users view own claims" ON claims;
DROP POLICY IF EXISTS "Admins full access claims" ON claims;

CREATE POLICY "Users view own claims"
ON claims
FOR SELECT
USING (claimant = auth.uid());

CREATE POLICY "Admins full access claims"
ON claims
FOR ALL
USING (public.is_admin_check() = true);

-- Add policy for inserting claims
DROP POLICY IF EXISTS "Users can insert own claims" ON claims;
CREATE POLICY "Users can insert own claims"
ON claims
FOR INSERT
WITH CHECK (auth.uid() = claimant);
