/*
  # Insert initial admin user

  1. Inserts the default admin user that was previously in localStorage
*/

INSERT INTO users (name, email, password, role, parish, birth_date, entry_date, address, formation_level, bio, photo_url)
VALUES (
  'Administrador Sistema',
  'admin@paroquia.pt',
  '123',
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
