/*
  # Customs Dispatch Tracking System - Core Schema

  ## Overview
  This migration creates the foundational database structure for a customs dispatch tracking system
  with role-based access control, client management, dispatch tracking, and document management.

  ## New Tables
  
  ### 1. `profiles`
  Extended user profile information linked to auth.users
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - User role: 'admin' or 'client'
  - `phone` (text) - Contact phone
  - `company_name` (text) - Company/business name
  - `ruc` (text) - Tax ID (RUC)
  - `address` (text) - Physical address
  - `created_at` (timestamptz) - Registration date
  - `updated_at` (timestamptz) - Last update date

  ### 2. `clients`
  Client companies managed by administrators
  - `id` (uuid, PK) - Client identifier
  - `user_id` (uuid, FK to profiles) - Associated user account (nullable)
  - `company_name` (text) - Company name
  - `ruc` (text) - Tax ID, unique
  - `email` (text) - Primary contact email
  - `phone` (text) - Contact phone
  - `address` (text) - Company address
  - `contact_person` (text) - Contact person name
  - `notes` (text) - Additional notes
  - `created_by` (uuid, FK to profiles) - Admin who created
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update

  ### 3. `dispatches`
  Customs dispatches/shipments
  - `id` (uuid, PK) - Dispatch identifier
  - `client_id` (uuid, FK to clients) - Associated client
  - `dispatch_number` (text) - Unique dispatch number
  - `bl_number` (text) - Bill of Lading number
  - `supplier` (text) - Supplier name
  - `shipping_line` (text) - Naviera/shipping company
  - `arrival_date` (date) - Expected/actual arrival date
  - `channel` (text) - Customs channel (red/orange/green)
  - `status` (text) - Current status
  - `container_number` (text) - Container identifier
  - `port` (text) - Port of arrival
  - `weight` (numeric) - Shipment weight
  - `value` (numeric) - Declared value
  - `created_by` (uuid, FK to profiles) - Creator
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update

  ### 4. `dispatch_timeline`
  Timeline/history of dispatch status changes
  - `id` (uuid, PK) - Timeline entry identifier
  - `dispatch_id` (uuid, FK to dispatches) - Associated dispatch
  - `status` (text) - New status
  - `notes` (text) - Status change notes
  - `updated_by` (uuid, FK to profiles) - User who made change
  - `created_at` (timestamptz) - When status changed

  ### 5. `documents`
  Document repository for dispatches
  - `id` (uuid, PK) - Document identifier
  - `dispatch_id` (uuid, FK to dispatches) - Associated dispatch
  - `document_type` (text) - Type: invoice, packing_list, bl, vuce, co, payment_proof, etc.
  - `file_name` (text) - Original filename
  - `file_path` (text) - Storage path
  - `file_size` (integer) - File size in bytes
  - `version` (integer) - Document version number
  - `notes` (text) - Document notes
  - `uploaded_by` (uuid, FK to profiles) - Uploader
  - `created_at` (timestamptz) - Upload date

  ### 6. `notifications`
  System notifications for users
  - `id` (uuid, PK) - Notification identifier
  - `user_id` (uuid, FK to profiles) - Recipient
  - `dispatch_id` (uuid, FK to dispatches, nullable) - Related dispatch
  - `type` (text) - Notification type
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation date

  ### 7. `calendar_events`
  Calendar for scheduling dispatch-related events
  - `id` (uuid, PK) - Event identifier
  - `dispatch_id` (uuid, FK to dispatches, nullable) - Related dispatch
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `event_date` (timestamptz) - Event date/time
  - `event_type` (text) - Event type
  - `reminder_sent` (boolean) - Reminder sent flag
  - `created_by` (uuid, FK to profiles) - Creator
  - `created_at` (timestamptz) - Creation date

  ### 8. `payments`
  Payment tracking for dispatches
  - `id` (uuid, PK) - Payment identifier
  - `dispatch_id` (uuid, FK to dispatches) - Associated dispatch
  - `amount` (numeric) - Payment amount
  - `payment_type` (text) - Payment type/concept
  - `status` (text) - Payment status
  - `due_date` (date) - Due date
  - `paid_date` (date) - Actual payment date
  - `proof_document_id` (uuid, FK to documents, nullable) - Payment proof
  - `notes` (text) - Payment notes
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update

  ## Security
  - RLS enabled on all tables
  - Admins have full access to all records
  - Clients can only access their own data
  - Public users have no access
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client')),
  phone text,
  company_name text,
  ruc text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  ruc text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  contact_person text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dispatches table
CREATE TABLE IF NOT EXISTS dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  dispatch_number text UNIQUE NOT NULL,
  bl_number text,
  supplier text,
  shipping_line text,
  arrival_date date,
  channel text CHECK (channel IN ('red', 'orange', 'green', 'pending')),
  status text NOT NULL DEFAULT 'pending',
  container_number text,
  port text,
  weight numeric,
  value numeric,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dispatch_timeline table
CREATE TABLE IF NOT EXISTS dispatch_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid REFERENCES dispatches(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  notes text,
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid REFERENCES dispatches(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  version integer DEFAULT 1,
  notes text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dispatch_id uuid REFERENCES dispatches(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid REFERENCES dispatches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  event_type text NOT NULL,
  reminder_sent boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid REFERENCES dispatches(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  payment_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  paid_date date,
  proof_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_ruc ON clients(ruc);
CREATE INDEX IF NOT EXISTS idx_dispatches_client_id ON dispatches(client_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_arrival_date ON dispatches(arrival_date);
CREATE INDEX IF NOT EXISTS idx_dispatch_timeline_dispatch_id ON dispatch_timeline(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_documents_dispatch_id ON documents(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_payments_dispatch_id ON payments(dispatch_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view own client record"
  ON clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for dispatches
CREATE POLICY "Admins can view all dispatches"
  ON dispatches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view own dispatches"
  ON dispatches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = dispatches.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert dispatches"
  ON dispatches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update dispatches"
  ON dispatches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete dispatches"
  ON dispatches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for dispatch_timeline
CREATE POLICY "Admins can view all timeline entries"
  ON dispatch_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view own dispatch timeline"
  ON dispatch_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dispatches d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = dispatch_timeline.dispatch_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert timeline entries"
  ON dispatch_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view own dispatch documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dispatches d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = documents.dispatch_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for calendar_events
CREATE POLICY "Admins can view all events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view own dispatch payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dispatches d
      JOIN clients c ON c.id = d.client_id
      WHERE d.id = payments.dispatch_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispatches_updated_at BEFORE UPDATE ON dispatches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();