/*
  # Database Schema Update

  1. Tables
    - Create tables if they don't exist
    - Add proper constraints and defaults
  
  2. Security
    - Enable RLS
    - Create policies for access control
    
  3. Functions
    - Add donation status update trigger
*/

-- Create enums if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('donor', 'orphanage');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status') THEN
        CREATE TYPE donation_status AS ENUM ('pending', 'matched', 'completed', 'cancelled');
    END IF;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    role user_role NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id uuid REFERENCES profiles(id) NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    images text[] DEFAULT '{}',
    pickup_location text NOT NULL,
    status donation_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donation_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id uuid REFERENCES donations(id) NOT NULL,
    orphanage_id uuid REFERENCES profiles(id) NOT NULL,
    status donation_status DEFAULT 'matched',
    communication_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(donation_id, orphanage_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Donations are viewable by everyone" ON donations;
DROP POLICY IF EXISTS "Donors can insert own donations" ON donations;
DROP POLICY IF EXISTS "Donors can update own donations" ON donations;
DROP POLICY IF EXISTS "Matches are viewable by involved parties" ON donation_matches;
DROP POLICY IF EXISTS "Orphanages can create matches" ON donation_matches;

-- Create policies
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Donations are viewable by everyone"
    ON donations FOR SELECT
    USING (true);

CREATE POLICY "Donors can insert own donations"
    ON donations FOR INSERT
    WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update own donations"
    ON donations FOR UPDATE
    USING (auth.uid() = donor_id);

CREATE POLICY "Matches are viewable by involved parties"
    ON donation_matches FOR SELECT
    USING (
        auth.uid() IN (
            SELECT donor_id FROM donations WHERE id = donation_id
            UNION
            SELECT orphanage_id
        )
    );

CREATE POLICY "Orphanages can create matches"
    ON donation_matches FOR INSERT
    WITH CHECK (
        auth.uid() = orphanage_id AND
        EXISTS (
            SELECT 1 FROM donations
            WHERE id = donation_matches.donation_id
            AND status = 'pending'
        )
    );

-- Create function for donation status updates
CREATE OR REPLACE FUNCTION update_donation_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE donations
    SET status = NEW.status
    WHERE id = NEW.donation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_donation_status_trigger ON donation_matches;
CREATE TRIGGER update_donation_status_trigger
    AFTER INSERT OR UPDATE ON donation_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_donation_status();