-- Add performance indexes to improve query speed

-- Index on ids_found for status queries
CREATE INDEX IF NOT EXISTS idx_ids_found_status ON ids_found(status);

-- Index on ids_found for id_type queries  
CREATE INDEX IF NOT EXISTS idx_ids_found_id_type ON ids_found(id_type);

-- Index on ids_found for created_at sorting
CREATE INDEX IF NOT EXISTS idx_ids_found_created_at ON ids_found(created_at DESC);

-- Index on lost_requests for user_id
CREATE INDEX IF NOT EXISTS idx_lost_requests_user_id ON lost_requests(user_id);

-- Index on lost_requests for status queries
CREATE INDEX IF NOT EXISTS idx_lost_requests_status ON lost_requests(status);

-- Index on claims for id_found
CREATE INDEX IF NOT EXISTS idx_claims_id_found ON claims(id_found);

-- Index on claims for claimant
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON claims(claimant);

-- Index on claims for claim_status
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(claim_status);

-- Index on profiles for role (used in admin checks)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Index on notifications for user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Index on submissions for approved
CREATE INDEX IF NOT EXISTS idx_submissions_approved ON submissions(approved);

-- Composite index for ids_found common filter combination
CREATE INDEX IF NOT EXISTS idx_ids_found_status_visibility ON ids_found(status, visibility);

-- Index on audit_logs for actor
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE ids_found;
ANALYZE lost_requests;
ANALYZE claims;
ANALYZE notifications;
ANALYZE submissions;
ANALYZE audit_logs;
