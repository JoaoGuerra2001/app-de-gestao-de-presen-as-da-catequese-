
import { 
  User, UserRole, CatechesisClass, Student, Attendance, 
  AttendanceStatus, Report, AppNotification, ReportFormat 
} from './types';

class BackendService {
  private storageKey = 'catequese_digital_db';
  private sessionKey = 'catequese_session';

  private db: {
    users: User[];
    classes: CatechesisClass[];
    students: Student[];
    attendances: Attendance[];
    reports: Report[];
    notifications: AppNotification[];
  };

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.db = JSON.parse(saved);
    } else {
      this.db = {
        users: [
          { 
            id: 'admin-1', 
            name: 'Administrador Sistema', 
            email: 'admin@paroquia.pt', 
            password: '123', 
            role: 'ADMIN', 
            parish: 'S. Simão',
            birthDate: '1985-05-20',
            entryDate: '2010',
            address: 'Rua Principal, S. Simão, Oiã',
            formationLevel: 'Curso Geral de Catequistas',
            bio: 'Responsável pela coordenação técnica da catequese digital na paróquia.',
            photoUrl: 'https://picsum.photos/seed/admin/200'
          }
        ],
        classes: [],
        students: [],
        attendances: [],
        reports: [],
        notifications: []
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.db));
  }

  private generateId() {
    return typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  // --- AUTHENTICATION ---
  
  async login(email: string, password: string): Promise<User | null> {
    const user = this.db.users.find(u => u.email === email && u.password === password);
    if (user) {
      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
      return sessionUser;
    }
    return null;
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
    const newUser: User = {
      id: this.generateId(),
      name: data.name || '',
      email: data.email || '',
      password: data.password || 'mudar123',
      role: data.role || 'CATECHIST',
      parish: data.parish || 'S. Simão',
      photoUrl: data.photoUrl || `https://picsum.photos/seed/${data.email}/200`,
      birthDate: data.birthDate || '',
      entryDate: data.entryDate || new Date().getFullYear().toString(),
      address: data.address || '',
      formationLevel: data.formationLevel || 'Curso Básico',
      bio: data.bio || 'Novo catequista da Paróquia de S. Simão.'
    };
    this.db.users.push(newUser);
    this.save();
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const index = this.db.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Utilizador não encontrado');

    const updatedUser = { ...this.db.users[index], ...data };
    this.db.users[index] = updatedUser;
    this.save();

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      const sessionUser = { ...updatedUser };
      delete sessionUser.password;
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
    }

    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    if (!this.checkPermission('ADMIN_ONLY')) throw new Error('403 Forbidden');
    return this.db.users.map(({ password, ...u }) => u as User);
  }

  async listUsersForAssignment(): Promise<User[]> {
    return this.db.users.map(({ password, ...u }) => u as User);
  }

  // --- CLASSES ---

  async createClass(data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    if (!this.getCurrentUser()) throw new Error('401 Unauthorized');
    
    const newClass: CatechesisClass = {
      id: this.generateId(),
      name: data.name || '',
      yearCycle: data.yearCycle || '',
      parish: data.parish || '',
      room: data.room || '',
      schedule: data.schedule || '',
      assignedCatechistIds: data.assignedCatechistIds || [],
      photoUrl: data.photoUrl || ''
    };

    if (newClass.assignedCatechistIds.length === 0) {
      const user = this.getCurrentUser();
      if (user) {
        newClass.assignedCatechistIds.push(user.id);
      }
    }

    this.db.classes.push(newClass);
    this.save();
    return newClass;
  }

  async updateClass(id: string, data: Partial<CatechesisClass>): Promise<CatechesisClass> {
    const index = this.db.classes.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Turma não encontrada');
    
    this.db.classes[index] = { ...this.db.classes[index], ...data };
    this.save();
    return this.db.classes[index];
  }

  async deleteClass(id: string): Promise<void> {
    this.db.classes = this.db.classes.filter(c => c.id !== id);
    this.db.students = this.db.students.filter(s => s.classId !== id);
    this.db.attendances = this.db.attendances.filter(a => a.classId !== id);
    this.save();
  }

  async listClasses(): Promise<CatechesisClass[]> {
    const user = this.getCurrentUser();
    if (!user) return [];
    if (user.role === 'ADMIN') return this.db.classes;
    return this.db.classes.filter(c => c.assignedCatechistIds.includes(user.id));
  }

  async getCatechistsByClass(classId: string): Promise<User[]> {
    const cls = this.db.classes.find(c => c.id === classId);
    if (!cls) return [];
    return this.db.users
      .filter(u => cls.assignedCatechistIds.includes(u.id))
      .map(({ password, ...u }) => u as User);
  }

  async removeCatechistFromClass(classId: string, userId: string): Promise<void> {
    const clsIndex = this.db.classes.findIndex(c => c.id === classId);
    if (clsIndex === -1) return;
    
    this.db.classes[clsIndex].assignedCatechistIds = 
      this.db.classes[clsIndex].assignedCatechistIds.filter(id => id !== userId);
    this.save();
  }

  // --- STUDENTS ---

  async createStudent(data: Partial<Student>): Promise<Student> {
    const newStudent: Student = {
      id: this.generateId(),
      classId: data.classId || '',
      fullName: data.fullName || '',
      birthDate: data.birthDate || '',
      guardianName: data.guardianName || '',
      guardianContact: data.guardianContact || '',
      photoUrl: data.photoUrl || `https://picsum.photos/seed/${this.generateId()}/200`
    };
    this.db.students.push(newStudent);
    this.save();
    return newStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    this.db.students = this.db.students.filter(s => s.id !== id);
    this.db.attendances = this.db.attendances.map(a => ({
      ...a,
      items: a.items.filter(item => item.studentId !== id)
    }));
    this.save();
  }

  async listStudents(classId: string): Promise<Student[]> {
    return this.db.students.filter(s => s.classId === classId);
  }

  async getStudentAttendanceHistory(studentId: string): Promise<{date: string, status: AttendanceStatus, className: string}[]> {
    const history: {date: string, status: AttendanceStatus, className: string}[] = [];
    
    this.db.attendances.forEach(att => {
      const item = att.items.find(i => i.studentId === studentId);
      if (item) {
        const cls = this.db.classes.find(c => c.id === att.classId);
        history.push({
          date: att.date,
          status: item.status,
          className: cls?.name || 'Turma Desconhecida'
        });
      }
    });

    return history.sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- ATTENDANCE ---

  async markAttendance(classId: string, date: string, items: { studentId: string, status: AttendanceStatus, note?: string }[]): Promise<Attendance> {
    const user = this.getCurrentUser();
    const existingIndex = this.db.attendances.findIndex(a => a.classId === classId && a.date === date);
    
    const attendance: Attendance = {
      id: existingIndex >= 0 ? this.db.attendances[existingIndex].id : this.generateId(),
      classId,
      date,
      catechistId: user?.id || 'unknown',
      items: items.map(i => ({ studentId: i.studentId, status: i.status, note: i.note }))
    };

    if (existingIndex >= 0) {
      this.db.attendances[existingIndex] = attendance;
    } else {
      this.db.attendances.push(attendance);
    }
    
    this.save();
    return attendance;
  }
}

export const backend = new BackendService();
