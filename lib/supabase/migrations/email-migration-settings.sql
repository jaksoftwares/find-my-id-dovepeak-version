-- Migration to enhance email settings for Super Admin
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT 'JKUAT Customer Service Center',
ADD COLUMN IF NOT EXISTS admin_email_submissions TEXT,
ADD COLUMN IF NOT EXISTS admin_email_claims TEXT,
ADD COLUMN IF NOT EXISTS admin_email_messages TEXT,
ADD COLUMN IF NOT EXISTS admin_email_found_ids TEXT,
ADD COLUMN IF NOT EXISTS admin_email_lost_ids TEXT;

-- Initialize defaults using existing contact_email
UPDATE public.settings 
SET 
  sender_name = COALESCE(sender_name, 'JKUAT Customer Service Center'),
  admin_email_submissions = COALESCE(admin_email_submissions, contact_email),
  admin_email_claims = COALESCE(admin_email_claims, contact_email),
  admin_email_messages = COALESCE(admin_email_messages, contact_email),
  admin_email_found_ids = COALESCE(admin_email_found_ids, contact_email),
  admin_email_lost_ids = COALESCE(admin_email_lost_ids, contact_email)
WHERE id IS NOT NULL;
