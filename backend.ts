
import { createClient } from '@supabase/supabase-js';
import {
  User, UserRole, CatechesisClass, Student, Attendance,
  AttendanceStatus, Report, AppNotification, ReportFormat
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sessionKey = 'catequese_session';

class BackendService {
  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) return null;

    const user: User = this.mapDatabaseUser(data);
    localStorage.setItem(sessionKey, JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(sessionKey);
    return session ? JSON.parse(session) : null;
  }

  logout() {
    localStorage.removeItem(sessionKey);
  }

  // --- PERMISSIONS ---

  checkPermission(action: 'ADMIN_ONLY' | 'CATECHIST_OWN' | 'ANY', targetId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return action === 'ANY';
    if (user.role === 'ADMIN') return true;
    if (action === 'ADMIN_ONLY') return false;
    return true;
  }

  // --- HELPER METHODS ---

  private mapDatabaseUser(dbUser: any): User {
    const { password, ...rest } = dbUser;
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      password: '',
      role: dbUser.role,
      parish: dbUser.parish,
      photoUrl: dbUser.photo_url,
      birthDate: dbUser.birth_date,
      entryDate: dbUser.entry_date,
      address: dbUser.address,
      formationLevel: dbUser.formation_level,
      bio: dbUser.bio
    };
  }

  // --- USERS ---

  async createUser(data: Partial<User>): Promise<User> {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name: data.name || '',
        email: data.email || '',
        password: data.password || 'mudar123',
        role: data.role || 'CATECHIST',
        parish: data.parish || 'S. Simão',
        photo_url: data.photoUrl || `https://picsum.photos/seed/${data.email}/200`,
        birth_date: data.birthDate || '',
        entry_date: data.entryDate || new Date().getFullYear().toString(),
        address: data.address || '',
        formation_level: data.formationLevel || 'Curso Básico',
        bio: data.bio || 'Novo catequista da Paróquia de S. Simão.'
      })
      .select()
      .single();

    if (error || !newUser) throw new Error('Erro ao criar utilizador');
    return this.mapDatabaseUser(newUser);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        birth_date: data.birthDate,
        entry_date: data.entryDate,
        address: data.address,
        formation_level: data.formationLevel,
        bio: data.bio,
        photo_url: data.photoUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedUser) throw new Error('Utilizador não encontrado');

    const user = this.mapDatabaseUser(updatedUser);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      localStorage.setItem(sessionKey, JSON.stringify(user));
    }

    return user;
  }

  async listUsers(): Promise<User[]> {
    if (!this.checkPermission('ADMIN_ONLY')) throw new Error('403 Forbidden');

    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return (data || []).map(u => this.mapDatabaseUser(u));
  }

  async listUsersForAssignment(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'ADMIN');

    if (error) throw error;
    return (data || []).map(u => this.mapDatabaseUser(u));
  }

  // --- CLASSES ---

  async createClass(data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    if (!this.getCurrentUser()) throw new Error('401 Unauthorized');

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        name: data.name || '',
        year_cycle: data.yearCycle || '',
        parish: data.parish || '',
        room: data.room || '',
        schedule: data.schedule || '',
        photo_url: data.photoUrl || ''
      })
      .select()
      .single();

    if (error || !newClass) throw new Error('Erro ao criar turma');

    const classId = newClass.id;
    const catechistIds = data.assignedCatechistIds || [];

    if (catechistIds.length === 0) {
      const user = this.getCurrentUser();
      if (user) catechistIds.push(user.id);
    }

    for (const catechistId of catechistIds) {
      await supabase
        .from('class_catechists')
        .insert({ class_id: classId, user_id: catechistId });
    }

    return this.mapDatabaseClass(newClass, catechistIds);
  }

  async updateClass(id: string, data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    const { data: updated, error } = await supabase
      .from('classes')
      .update({
        name: data.name,
        year_cycle: data.yearCycle,
        parish: data.parish,
        room: data.room,
        schedule: data.schedule,
        photo_url: data.photoUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error('Turma não encontrada');
    return this.mapDatabaseClass(updated, data.assignedCatechistIds || []);
  }

  async deleteClass(id: string): Promise<void> {
    await supabase.from('classes').delete().eq('id', id);
  }

  async listClasses(): Promise<CatechesisClass[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    let query = supabase.from('classes').select('*');

    if (user.role !== 'ADMIN') {
      const { data: classCatechists } = await supabase
        .from('class_catechists')
        .select('class_id')
        .eq('user_id', user.id);

      const classIds = (classCatechists || []).map(cc => cc.class_id);
      if (classIds.length === 0) return [];
      query = query.in('id', classIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    const classes: CatechesisClass[] = [];
    for (const cls of data || []) {
      const { data: catechists } = await supabase
        .from('class_catechists')
        .select('user_id')
        .eq('class_id', cls.id);

      classes.push(this.mapDatabaseClass(cls, (catechists || []).map(c => c.user_id)));
    }

    return classes;
  }

  async getCatechistsByClass(classId: string): Promise<User[]> {
    const { data: classCatechists, error } = await supabase
      .from('class_catechists')
      .select('users(*)')
      .eq('class_id', classId);

    if (error) throw error;
    return (classCatechists || [])
      .map(cc => this.mapDatabaseUser(cc.users))
      .filter(u => u.id);
  }

  async removeCatechistFromClass(classId: string, userId: string): Promise<void> {
    await supabase
      .from('class_catechists')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', userId);
  }

  private mapDatabaseClass(dbClass: any, catechistIds: string[] = []): CatechesisClass {
    return {
      id: dbClass.id,
      name: dbClass.name,
      yearCycle: dbClass.year_cycle,
      parish: dbClass.parish,
      room: dbClass.room,
      schedule: dbClass.schedule,
      assignedCatechistIds: catechistIds,
      photoUrl: dbClass.photo_url
    };
  }

  // --- STUDENTS ---

  async createStudent(data: Partial<Student>): Promise<Student> {
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        class_id: data.classId || '',
        full_name: data.fullName || '',
        birth_date: data.birthDate || '',
        guardian_name: data.guardianName || '',
        guardian_contact: data.guardianContact || '',
        photo_url: data.photoUrl || `https://picsum.photos/seed/${Math.random()}/200`
      })
      .select()
      .single();

    if (error || !newStudent) throw new Error('Erro ao criar aluno');
    return this.mapDatabaseStudent(newStudent);
  }

  async deleteStudent(id: string): Promise<void> {
    await supabase.from('students').delete().eq('id', id);
  }

  async listStudents(classId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId);

    if (error) throw error;
    return (data || []).map(s => this.mapDatabaseStudent(s));
  }

  async getStudentAttendanceHistory(studentId: string): Promise<{date: string, status: AttendanceStatus, className: string}[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('date, status, classes(name)')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(record => ({
      date: record.date,
      status: record.status as AttendanceStatus,
      className: (record.classes as any)?.name || 'Turma Desconhecida'
    }));
  }

  private mapDatabaseStudent(dbStudent: any): Student {
    return {
      id: dbStudent.id,
      classId: dbStudent.class_id,
      fullName: dbStudent.full_name,
      birthDate: dbStudent.birth_date,
      guardianName: dbStudent.guardian_name,
      guardianContact: dbStudent.guardian_contact,
      photoUrl: dbStudent.photo_url
    };
  }

  // --- ATTENDANCE ---

  async markAttendance(classId: string, date: string, items: { studentId: string, status: AttendanceStatus, note?: string }[]): Promise<Attendance> {
    const user = this.getCurrentUser();

    for (const item of items) {
      await supabase
        .from('attendance_records')
        .upsert({
          class_id: classId,
          student_id: item.studentId,
          date: date,
          status: item.status,
          note: item.note || '',
          catechist_id: user?.id || null
        });
    }

    return {
      id: `${classId}-${date}`,
      classId,
      date,
      catechistId: user?.id || 'unknown',
      items
    };
  }
}

export const backend = new BackendService();
