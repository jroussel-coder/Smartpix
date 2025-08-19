/*
  # Create user images table

  1. New Tables
    - `user_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `original_image_url` (text)
      - `edited_image_url` (text, nullable)
      - `edit_type` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_images` table
    - Add policies for authenticated users to manage their own images
*/

CREATE TABLE IF NOT EXISTS user_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  original_image_url text NOT NULL,
  edited_image_url text,
  edit_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own images"
  ON user_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON user_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON user_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON user_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_images_updated_at
  BEFORE UPDATE ON user_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();