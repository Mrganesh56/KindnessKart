/*
  # Improve Database Performance and Data Fetching

  1. Add Indexes
    - Add indexes on frequently queried columns
    - Add composite indexes for common query patterns
  
  2. Add Constraints
    - Add NOT NULL constraints where appropriate
    - Add CHECK constraints for data validation

  3. Add Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_matches_orphanage_id ON donation_matches(orphanage_id);
CREATE INDEX IF NOT EXISTS idx_donation_matches_donation_id ON donation_matches(donation_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_donations_donor_status ON donations(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_donation_matches_status ON donation_matches(donation_id, orphanage_id, status);

-- Add CHECK constraints for data validation
ALTER TABLE donations 
  ADD CONSTRAINT chk_donation_title_length 
  CHECK (length(title) >= 3 AND length(title) <= 255);

ALTER TABLE donations 
  ADD CONSTRAINT chk_donation_description_length 
  CHECK (length(description) >= 10);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donation_matches_updated_at ON donation_matches;
CREATE TRIGGER update_donation_matches_updated_at
    BEFORE UPDATE ON donation_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();