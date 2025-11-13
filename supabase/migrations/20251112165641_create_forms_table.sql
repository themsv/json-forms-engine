/*
  # Create Forms Table

  1. New Tables
    - `forms`
      - `id` (uuid, primary key) - Unique identifier for each form
      - `name` (text) - Name of the form
      - `description` (text) - Description of the form
      - `schema` (jsonb) - JSON Schema definition for the form
      - `ui_schema` (jsonb) - UI Schema for JSONForms rendering customization
      - `created_at` (timestamptz) - Timestamp of form creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `forms` table
    - Add policy for public read access (forms are publicly viewable)
    - Add policy for public insert access (anyone can create forms)
    - Add policy for public update access (anyone can update forms)
    - Add policy for public delete access (anyone can delete forms)

  Notes:
    - This is a demo application with public access to all forms
    - In production, you would want to add user authentication and restrict access
    - JSONB columns store the JSON Schema and UI Schema for form definitions
*/

CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  schema jsonb NOT NULL DEFAULT '{"type": "object", "properties": {}}'::jsonb,
  ui_schema jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forms"
  ON forms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create forms"
  ON forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update forms"
  ON forms FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete forms"
  ON forms FOR DELETE
  USING (true);