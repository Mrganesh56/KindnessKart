/*
  # Initial Database Schema

  1. New Tables
    - `profiles`
    - `donations`
    - `donation_matches`
  
  2. Security
    - Enable RLS
    - Add policies
    - Set up triggers
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('donor', 'orphanage');
CREATE TYPE donation_status AS ENUM ('pending', 'matched', 'completed', 'cancelled');

-- Create tables
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

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT
    USING (true);

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
CREATE TRIGGER update_donation_status_trigger
    AFTER INSERT OR UPDATE ON donation_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_donation_status();