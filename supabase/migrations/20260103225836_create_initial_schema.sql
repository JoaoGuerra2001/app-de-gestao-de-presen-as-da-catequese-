/*
  # Create initial schema for catequese digital

  1. New Tables
    - `users` - Utilizadores do sistema (admin e catequistas)
    - `classes` - Turmas de catequese
    - `students` - Alunos das turmas
    - `attendances` - Registos de presença
    - `class_catechists` - Relação entre turmas e catequistas

  2. Security
    - Enable RLS on all tables
    - Policies for data access control
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'CATECHIST',
  parish text NOT NULL DEFAULT 'S. Simão',
  birth_date text DEFAULT '',
  entry_date text DEFAULT '',
  address text DEFAULT '',
  formation_level text DEFAULT '',
  bio text DEFAULT '',
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year_cycle text NOT NULL,
  parish text NOT NULL,
  room text NOT NULL,
  schedule text NOT NULL,
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_catechists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, user_id)
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  birth_date text DEFAULT '',
  guardian_name text DEFAULT '',
  guardian_contact text DEFAULT '',
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date text NOT NULL,
  status text NOT NULL,
  note text DEFAULT '',
  catechist_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id, date)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_catechists ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Anyone can read class_catechists" ON class_catechists FOR SELECT USING (true);
CREATE POLICY "Anyone can read students" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can read attendance" ON attendance_records FOR SELECT USING (true);

CREATE POLICY "Only admin can insert users" ON users FOR INSERT WITH CHECK (false);
CREATE POLICY "Only admin can update users" ON users FOR UPDATE WITH CHECK (false);
CREATE POLICY "Only admin can delete users" ON users FOR DELETE USING (false);

CREATE POLICY "Anyone can insert classes" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update classes" ON classes FOR UPDATE WITH CHECK (true);
CREATE POLICY "Anyone can delete classes" ON classes FOR DELETE USING (true);

CREATE POLICY "Anyone can insert class_catechists" ON class_catechists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete class_catechists" ON class_catechists FOR DELETE USING (true);

CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE WITH CHECK (true);
CREATE POLICY "Anyone can delete students" ON students FOR DELETE USING (true);

CREATE POLICY "Anyone can insert attendance" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attendance" ON attendance_records FOR UPDATE WITH CHECK (true);
CREATE POLICY "Anyone can delete attendance" ON attendance_records FOR DELETE USING (true);
