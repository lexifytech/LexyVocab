/*
  # Initial Schema Setup

  1. New Tables
    - `decks`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `flashcards`
      - `id` (uuid, primary key)
      - `front` (text)
      - `verse` (text)
      - `sentence` (text)
      - `deck_id` (uuid, references decks)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `last_reviewed` (timestamp)
      - `next_review` (timestamp)
      - `review_count` (integer)
      - `confidence` (float)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  front text NOT NULL,
  verse text NOT NULL,
  sentence text NOT NULL,
  deck_id uuid REFERENCES decks ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_reviewed timestamptz,
  next_review timestamptz DEFAULT now(),
  review_count integer DEFAULT 0,
  confidence float DEFAULT 0
);

-- Enable RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Policies for decks
CREATE POLICY "Users can create their own decks"
  ON decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for flashcards
CREATE POLICY "Users can create their own flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);