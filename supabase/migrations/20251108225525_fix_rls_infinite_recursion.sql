/*
  # Fix RLS Infinite Recursion

  1. Changes
    - Drop the problematic "Admins can view all profiles" policy
    - Simplify to only allow users to view their own profile
    - This prevents infinite recursion while maintaining security

  2. Security
    - Users can only view and update their own profile
    - No recursive policy checks
*/

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- The remaining policies are safe:
-- 1. "Users can view own profile" - simple auth.uid() check
-- 2. "Users can update own profile" - simple auth.uid() check
-- 3. "Users can create own profile" - simple auth.uid() check
