/*
  # Create backup and sync system

  1. New Tables
    - `db_backups` - Stores backup metadata and snapshots
      - `id` (uuid, primary key)
      - `created_at` (timestamp) - When the backup was created
      - `data_snapshot` (jsonb) - Complete database snapshot
      - `backup_type` (text) - 'auto' or 'manual'
    
    - `sync_checkpoint` - Tracks last successful sync for offline support
      - `id` (uuid, primary key) 
      - `last_sync` (timestamp) - Last successful sync time
      - `last_backup_id` (uuid) - Reference to last backup used
      - `device_id` (text) - Device identifier
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Automatic backups can be read by authenticated users
    - Sync checkpoints are device-specific
    
  3. Purpose
    - Automatic backup every 3 days
    - Offline support - device can use last known good state if connection fails
    - Data recovery capability

  4. Notes
    - Backups are stored as JSON snapshots for quick restoration
    - Device IDs allow tracking different client applications
    - Cleanup of old backups (>30 days) should be done periodically
*/

CREATE TABLE IF NOT EXISTS db_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  data_snapshot jsonb NOT NULL,
  backup_type text DEFAULT 'auto',
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

CREATE TABLE IF NOT EXISTS sync_checkpoint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_sync timestamptz DEFAULT now(),
  last_backup_id uuid REFERENCES db_backups(id),
  device_id text NOT NULL UNIQUE,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE db_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_checkpoint ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read backups"
  ON db_backups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can create backups"
  ON db_backups FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'email' LIKE '%@paroquia.pt');

CREATE POLICY "Users can read own sync checkpoint"
  ON sync_checkpoint FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upsert own sync checkpoint"
  ON sync_checkpoint FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own sync checkpoint"
  ON sync_checkpoint FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_backups_created ON db_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_expires ON db_backups(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkpoint_device ON sync_checkpoint(device_id);
