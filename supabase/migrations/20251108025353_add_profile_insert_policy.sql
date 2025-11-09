/*
  # Fix Profile Creation Policy

  ## Changes
  - Add INSERT policy for profiles table to allow users to create their own profile during signup
  
  ## Security
  - Users can only insert their own profile (where id matches auth.uid())
  - This is essential for the signup flow to work properly
*/

-- Allow users to create their own profile during signup
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
