/*
  # Create initial schema for Catequese Digital

  1. New Tables
    - `users` - Catechists and admins
    - `classes` - Catechesis classes
    - `students` - Students in classes
    - `attendances` - Attendance records
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Create appropriate access policies
*/

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CATECHIST')),
  parish TEXT DEFAULT 'S. Simão',
  birth_date TEXT,
  entry_date TEXT,
  address TEXT,
  formation_level TEXT,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year_cycle TEXT,
  parish TEXT DEFAULT 'S. Simão',
  room TEXT,
  schedule TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_catechists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, user_id)
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  catechist_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendances(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'JUSTIFIED')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(attendance_id, student_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_catechists ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can create users" ON users FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Classes are viewable" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catechists can create classes" ON classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Catechists can update own classes" ON classes FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM class_catechists WHERE class_id = id AND user_id = auth.uid()));

CREATE POLICY "Catechist assignment viewable" ON class_catechists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Can manage class catechists" ON class_catechists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Can delete class catechists" ON class_catechists FOR DELETE TO authenticated USING (true);

CREATE POLICY "Students viewable in assigned classes" ON students FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM class_catechists WHERE class_id = students.class_id AND user_id = auth.uid()));
CREATE POLICY "Catechists can create students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Catechists can update students" ON students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Catechists can delete students" ON students FOR DELETE TO authenticated USING (true);

CREATE POLICY "Attendances viewable" ON attendances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catechists can create attendance" ON attendances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Catechists can update attendance" ON attendances FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Attendance items viewable" ON attendance_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Can manage attendance items" ON attendance_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Can update attendance items" ON attendance_items FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can view notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
