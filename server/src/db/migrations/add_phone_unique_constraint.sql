-- Add unique constraint on phone (partial index: only for non-null values)
-- This allows multiple users to have NULL phone while preventing duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique 
ON users (phone) WHERE phone IS NOT NULL;
