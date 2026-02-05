const BACKUP_INTERVAL = 3 * 24 * 60 * 60 * 1000;
const DEVICE_ID_KEY = 'catequese_device_id';
const LAST_SYNC_KEY = 'catequese_last_sync';
const BACKUP_CACHE_KEY = 'catequese_backup_cache';

function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

let supabaseClient: any;

export function setSupabaseClient(client: any) {
  supabaseClient = client;
}

async function getAllData() {
  const [users, classes, students, attendance] = await Promise.all([
    supabaseClient.from('users').select('*'),
    supabaseClient.from('classes').select('*'),
    supabaseClient.from('students').select('*'),
    supabaseClient.from('attendance').select('*'),
  ]);

  return {
    users: users.data || [],
    classes: classes.data || [],
    students: students.data || [],
    attendance: attendance.data || [],
    timestamp: new Date().toISOString(),
  };
}

export async function createBackup() {
  try {
    const data = await getAllData();

    const { error } = await supabaseClient.from('db_backups').insert({
      data_snapshot: data,
      backup_type: 'auto',
    });

    if (error) throw error;

    localStorage.setItem(BACKUP_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    return true;
  } catch (error) {
    console.error('Backup failed:', error);
    return false;
  }
}

export async function updateSyncCheckpoint() {
  try {
    const deviceId = getDeviceId();

    const { data: backup } = await supabaseClient
      .from('db_backups')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const backupId = backup?.id;

    const { data: existing } = await supabaseClient
      .from('sync_checkpoint')
      .select('id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existing) {
      await supabaseClient
        .from('sync_checkpoint')
        .update({
          last_sync: new Date().toISOString(),
          last_backup_id: backupId,
          updated_at: new Date().toISOString(),
        })
        .eq('device_id', deviceId);
    } else {
      await supabaseClient.from('sync_checkpoint').insert({
        device_id: deviceId,
        last_backup_id: backupId,
        last_sync: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error('Sync checkpoint update failed:', error);
    return false;
  }
}

export async function getLastBackup() {
  try {
    const { data } = await supabaseClient
      .from('db_backups')
      .select('data_snapshot')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.data_snapshot) {
      localStorage.setItem(BACKUP_CACHE_KEY, JSON.stringify(data.data_snapshot));
      return data.data_snapshot;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch backup:', error);
    const cached = localStorage.getItem(BACKUP_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }
}

export function getOfflineData() {
  const cached = localStorage.getItem(BACKUP_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

export function shouldCreateBackup(): boolean {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  if (!lastSync) return true;

  const lastSyncTime = new Date(lastSync).getTime();
  const now = new Date().getTime();
  return now - lastSyncTime >= BACKUP_INTERVAL;
}

export async function initializeSync(client?: any) {
  if (client) {
    setSupabaseClient(client);
  }
  if (shouldCreateBackup()) {
    await createBackup();
  }
  await updateSyncCheckpoint();
}
