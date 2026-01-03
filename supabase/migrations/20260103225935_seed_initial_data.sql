/*
  # Seed initial data

  1. Insert default admin user
  2. Insert sample catechist for testing
*/

INSERT INTO users (email, password, name, role, parish, birth_date, entry_date, address, formation_level, bio, photo_url)
VALUES (
  'admin@paroquia.pt',
  '123',
  'Administrador Sistema',
  'ADMIN',
  'S. Simão',
  '1985-05-20',
  '2010',
  'Rua Principal, S. Simão, Oiã',
  'Curso Geral de Catequistas',
  'Responsável pela coordenação técnica da catequese digital na paróquia.',
  'https://picsum.photos/seed/admin/200'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, parish, birth_date, entry_date, address, formation_level, bio, photo_url)
VALUES (
  'joao@paroquia.pt',
  '123',
  'joao',
  'CATECHIST',
  'S. Simão',
  '1990-03-15',
  '2015',
  'Rua Secundária, S. Simão',
  'Curso Básico',
  'Catequista dedicado da Paróquia de S. Simão.',
  'https://picsum.photos/seed/joao@paroquia.pt/200'
)
ON CONFLICT (email) DO NOTHING;