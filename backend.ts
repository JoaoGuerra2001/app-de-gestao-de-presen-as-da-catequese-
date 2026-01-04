
import {
  User, UserRole, CatechesisClass, Student, Attendance,
  AttendanceStatus, Report, AppNotification, ReportFormat
} from './types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

class BackendService {
  private sessionKey = 'catequese_session';
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) return null;

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as UserRole,
      parish: data.parish,
      birthDate: data.birth_date,
      entryDate: data.entry_date,
      address: data.address,
      formationLevel: data.formation_level,
      bio: data.bio,
      photoUrl: data.photo_url
    };

    delete user.password;
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
  }

  // --- PERMISSIONS ---

  checkPermission(action: 'ADMIN_ONLY' | 'CATECHIST_OWN' | 'ANY', targetId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return action === 'ANY';
    if (user.role === 'ADMIN') return true;
    if (action === 'ADMIN_ONLY') return false;
    return true;
  }

  // --- USERS ---

  async createUser(data: Partial<User>): Promise<User> {
    const { data: newData, error } = await this.supabase
      .from('users')
      .insert([
        {
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
        }
      ])
      .select()
      .single();

    if (error || !newData) throw error || new Error('Failed to create user');

    return {
      id: newData.id,
      name: newData.name,
      email: newData.email,
      password: newData.password,
      role: newData.role,
      parish: newData.parish,
      birthDate: newData.birth_date,
      entryDate: newData.entry_date,
      address: newData.address,
      formationLevel: newData.formation_level,
      bio: newData.bio,
      photoUrl: newData.photo_url
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await this.supabase
      .from('users')
      .update({
        name: data.name,
        email: data.email,
        role: data.role,
        parish: data.parish,
        photo_url: data.photoUrl,
        birth_date: data.birthDate,
        entry_date: data.entryDate,
        address: data.address,
        formation_level: data.formationLevel,
        bio: data.bio
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw error || new Error('Utilizador não encontrado');

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      const sessionUser = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        parish: updated.parish,
        birthDate: updated.birth_date,
        entryDate: updated.entry_date,
        address: updated.address,
        formationLevel: updated.formation_level,
        bio: updated.bio,
        photoUrl: updated.photo_url
      };
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      password: updated.password,
      role: updated.role,
      parish: updated.parish,
      birthDate: updated.birth_date,
      entryDate: updated.entry_date,
      address: updated.address,
      formationLevel: updated.formation_level,
      bio: updated.bio,
      photoUrl: updated.photo_url
    };
  }

  async listUsers(): Promise<User[]> {
    if (!this.checkPermission('ADMIN_ONLY')) throw new Error('403 Forbidden');

    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) throw error;

    return data.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      parish: u.parish,
      birthDate: u.birth_date,
      entryDate: u.entry_date,
      address: u.address,
      formationLevel: u.formation_level,
      bio: u.bio,
      photoUrl: u.photo_url
    }));
  }

  async listUsersForAssignment(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) throw error;

    return data.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      parish: u.parish,
      birthDate: u.birth_date,
      entryDate: u.entry_date,
      address: u.address,
      formationLevel: u.formation_level,
      bio: u.bio,
      photoUrl: u.photo_url
    }));
  }

  // --- CLASSES ---

  async createClass(data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    if (!this.getCurrentUser()) throw new Error('401 Unauthorized');

    const { data: classData, error: classError } = await this.supabase
      .from('classes')
      .insert([
        {
          name: data.name || '',
          year_cycle: data.yearCycle || '',
          parish: data.parish || '',
          room: data.room || '',
          schedule: data.schedule || '',
          photo_url: data.photoUrl || ''
        }
      ])
      .select()
      .single();

    if (classError || !classData) throw classError || new Error('Failed to create class');

    const catechistIds = data.assignedCatechistIds || [];
    if (catechistIds.length === 0) {
      const user = this.getCurrentUser();
      if (user) catechistIds.push(user.id);
    }

    for (const catechistId of catechistIds) {
      await this.supabase
        .from('class_catechists')
        .insert([{ class_id: classData.id, user_id: catechistId }])
        .single();
    }

    return {
      id: classData.id,
      name: classData.name,
      yearCycle: classData.year_cycle,
      parish: classData.parish,
      room: classData.room,
      schedule: classData.schedule,
      photoUrl: classData.photo_url,
      assignedCatechistIds: catechistIds
    };
  }

  async updateClass(id: string, data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    const { data: updated, error } = await this.supabase
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

    if (error || !updated) throw error || new Error('Turma não encontrada');

    const { data: catechists } = await this.supabase
      .from('class_catechists')
      .select('user_id')
      .eq('class_id', id);

    return {
      id: updated.id,
      name: updated.name,
      yearCycle: updated.year_cycle,
      parish: updated.parish,
      room: updated.room,
      schedule: updated.schedule,
      photoUrl: updated.photo_url,
      assignedCatechistIds: (catechists || []).map(c => c.user_id)
    };
  }

  async deleteClass(id: string): Promise<void> {
    await this.supabase.from('classes').delete().eq('id', id);
  }

  async listClasses(): Promise<CatechesisClass[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    const { data: allClasses, error } = await this.supabase
      .from('classes')
      .select('*');

    if (error) throw error;

    if (user.role === 'ADMIN') {
      const classesWithCatechists = await Promise.all(
        allClasses.map(async (cls) => {
          const { data: catechists } = await this.supabase
            .from('class_catechists')
            .select('user_id')
            .eq('class_id', cls.id);
          return {
            id: cls.id,
            name: cls.name,
            yearCycle: cls.year_cycle,
            parish: cls.parish,
            room: cls.room,
            schedule: cls.schedule,
            photoUrl: cls.photo_url,
            assignedCatechistIds: (catechists || []).map(c => c.user_id)
          };
        })
      );
      return classesWithCatechists;
    }

    const { data: userClasses } = await this.supabase
      .from('class_catechists')
      .select('class_id')
      .eq('user_id', user.id);

    const userClassIds = (userClasses || []).map(c => c.class_id);

    const classesWithCatechists = await Promise.all(
      allClasses
        .filter(cls => userClassIds.includes(cls.id))
        .map(async (cls) => {
          const { data: catechists } = await this.supabase
            .from('class_catechists')
            .select('user_id')
            .eq('class_id', cls.id);
          return {
            id: cls.id,
            name: cls.name,
            yearCycle: cls.year_cycle,
            parish: cls.parish,
            room: cls.room,
            schedule: cls.schedule,
            photoUrl: cls.photo_url,
            assignedCatechistIds: (catechists || []).map(c => c.user_id)
          };
        })
    );
    return classesWithCatechists;
  }

  async getCatechistsByClass(classId: string): Promise<User[]> {
    const { data: catechists, error } = await this.supabase
      .from('class_catechists')
      .select('user_id')
      .eq('class_id', classId);

    if (error) throw error;

    const catechistIds = (catechists || []).map(c => c.user_id);

    const { data: users } = await this.supabase
      .from('users')
      .select('*')
      .in('id', catechistIds);

    return (users || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      parish: u.parish,
      birthDate: u.birth_date,
      entryDate: u.entry_date,
      address: u.address,
      formationLevel: u.formation_level,
      bio: u.bio,
      photoUrl: u.photo_url
    }));
  }

  async removeCatechistFromClass(classId: string, userId: string): Promise<void> {
    await this.supabase
      .from('class_catechists')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', userId);
  }

  // --- STUDENTS ---

  async createStudent(data: Partial<Student>): Promise<Student> {
    const { data: student, error } = await this.supabase
      .from('students')
      .insert([
        {
          class_id: data.classId,
          full_name: data.fullName || '',
          birth_date: data.birthDate || '',
          guardian_name: data.guardianName || '',
          guardian_contact: data.guardianContact || '',
          photo_url: data.photoUrl || `https://picsum.photos/seed/${Math.random()}/200`
        }
      ])
      .select()
      .single();

    if (error || !student) throw error || new Error('Failed to create student');

    return {
      id: student.id,
      classId: student.class_id,
      fullName: student.full_name,
      birthDate: student.birth_date,
      guardianName: student.guardian_name,
      guardianContact: student.guardian_contact,
      photoUrl: student.photo_url
    };
  }

  async deleteStudent(id: string): Promise<void> {
    await this.supabase.from('students').delete().eq('id', id);
  }

  async listStudents(classId: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('class_id', classId);

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      classId: s.class_id,
      fullName: s.full_name,
      birthDate: s.birth_date,
      guardianName: s.guardian_name,
      guardianContact: s.guardian_contact,
      photoUrl: s.photo_url
    }));
  }

  async getStudentAttendanceHistory(studentId: string): Promise<{date: string, status: AttendanceStatus, className: string}[]> {
    const { data: attendanceItems, error } = await this.supabase
      .from('attendance_items')
      .select('attendance_id, status')
      .eq('student_id', studentId);

    if (error) throw error;

    const attendanceIds = (attendanceItems || []).map(ai => ai.attendance_id);

    if (attendanceIds.length === 0) return [];

    const { data: attendances } = await this.supabase
      .from('attendances')
      .select('id, date, class_id')
      .in('id', attendanceIds);

    const classIds = [...new Set((attendances || []).map(a => a.class_id))];

    const { data: classes } = await this.supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    const classMap = Object.fromEntries((classes || []).map(c => [c.id, c.name]));

    const history = (attendanceItems || []).map(item => {
      const attendance = (attendances || []).find(a => a.id === item.attendance_id);
      return {
        date: attendance?.date || '',
        status: item.status as AttendanceStatus,
        className: attendance ? classMap[attendance.class_id] || 'Turma Desconhecida' : 'Turma Desconhecida'
      };
    });

    return history.sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- ATTENDANCE ---

  async markAttendance(classId: string, date: string, items: { studentId: string, status: AttendanceStatus, note?: string }[]): Promise<Attendance> {
    const user = this.getCurrentUser();

    const { data: existingAtt } = await this.supabase
      .from('attendances')
      .select('id')
      .eq('class_id', classId)
      .eq('date', date)
      .maybeSingle();

    let attendanceId = existingAtt?.id;

    if (!attendanceId) {
      const { data: newAtt, error } = await this.supabase
        .from('attendances')
        .insert([{ class_id: classId, date, catechist_id: user?.id || 'unknown' }])
        .select()
        .single();

      if (error || !newAtt) throw error || new Error('Failed to create attendance');
      attendanceId = newAtt.id;
    }

    for (const item of items) {
      await this.supabase
        .from('attendance_items')
        .upsert([
          {
            attendance_id: attendanceId,
            student_id: item.studentId,
            status: item.status,
            note: item.note || null
          }
        ], { onConflict: 'attendance_id,student_id' });
    }

    return {
      id: attendanceId,
      classId,
      date,
      catechistId: user?.id || 'unknown',
      items
    };
  }
}

export const backend = new BackendService();
