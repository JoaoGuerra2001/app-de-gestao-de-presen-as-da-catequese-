
import React, { useState, useEffect } from 'react';
import { Screen, CatechesisClass, Student, User } from './types';
import { backend } from './backend';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ClassDetailsView from './views/ClassDetailsView';
import AttendanceRegistryView from './views/AttendanceRegistryView';
import StudentHistoryView from './views/StudentHistoryView';
import ProfileView from './views/ProfileView';
import NewStudentView from './views/NewStudentView';
import NewClassView from './views/NewClassView';
import NewUserView from './views/NewUserView';
import ManageUsersView from './views/ManageUsersView';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [user, setUser] = useState<User | null>(backend.getCurrentUser());
  const [selectedClass, setSelectedClass] = useState<CatechesisClass | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      setCurrentScreen('DASHBOARD');
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentScreen('DASHBOARD');
  };

  const handleLogout = () => {
    backend.logout();
    setUser(null);
    setCurrentScreen('LOGIN');
  };

  const navigateTo = (screen: Screen, data?: any) => {
    if (screen === 'CLASS_DETAILS') setSelectedClass(data);
    if (screen === 'STUDENT_HISTORY') setSelectedStudent(data);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN':
        return <LoginView onLoginSuccess={handleLogin} onRegister={() => navigateTo('NEW_USER')} />;
      case 'DASHBOARD':
        return <DashboardView user={user} onSelectClass={(c) => navigateTo('CLASS_DETAILS', c)} onProfile={() => navigateTo('PROFILE')} onNewClass={() => navigateTo('NEW_CLASS')} />;
      case 'CLASS_DETAILS':
        return <ClassDetailsView
          classData={selectedClass}
          onBack={() => navigateTo('DASHBOARD')}
          onSelectStudent={(s) => navigateTo('STUDENT_HISTORY', s)}
          onAttendance={() => navigateTo('ATTENDANCE_REGISTRY')}
          onNewStudent={() => navigateTo('NEW_STUDENT')}
        />;
      case 'ATTENDANCE_REGISTRY':
        return <AttendanceRegistryView classData={selectedClass} onBack={() => navigateTo('CLASS_DETAILS', selectedClass)} />;
      case 'STUDENT_HISTORY':
        return <StudentHistoryView student={selectedStudent} onBack={() => navigateTo('CLASS_DETAILS', selectedClass)} />;
      case 'PROFILE':
        return <ProfileView user={user} onBack={() => navigateTo('DASHBOARD')} onLogout={handleLogout} />;
      case 'NEW_STUDENT':
        return <NewStudentView classId={selectedClass?.id} onBack={() => navigateTo('CLASS_DETAILS', selectedClass)} />;
      case 'NEW_CLASS':
        return <NewClassView onBack={() => navigateTo('DASHBOARD')} />;
      case 'NEW_USER':
        return <NewUserView onBack={() => navigateTo(user ? 'DASHBOARD' : 'LOGIN')} />;
      case 'MANAGE_USERS':
        return <ManageUsersView onBack={() => navigateTo('DASHBOARD')} />;
      default:
        return <LoginView onLoginSuccess={handleLogin} onRegister={() => navigateTo('NEW_USER')} />;
    }
  };

  // Se estiver na tela de login, não mostramos a sidebar
  if (currentScreen === 'LOGIN' || currentScreen === 'NEW_USER' && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-[32px] overflow-hidden">
          {renderScreen()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex overflow-hidden font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white">church</span>
          </div>
          {isSidebarOpen && <h1 className="font-bold text-lg truncate">Catequese Digital</h1>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => navigateTo('DASHBOARD')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentScreen === 'DASHBOARD' || currentScreen === 'CLASS_DETAILS' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="material-symbols-outlined">school</span>
            {isSidebarOpen && <span>Turmas</span>}
          </button>
          <button
            onClick={() => navigateTo('PROFILE')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentScreen === 'PROFILE' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="material-symbols-outlined">person</span>
            {isSidebarOpen && <span>O Meu Perfil</span>}
          </button>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigateTo('MANAGE_USERS')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentScreen === 'MANAGE_USERS' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="material-symbols-outlined">group</span>
              {isSidebarOpen && <span>Gerir Catequistas</span>}
            </button>
          )}
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined">analytics</span>
            {isSidebarOpen && <span>Relatórios</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 md:hidden">
            <div className="flex items-center gap-2">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[18px]">church</span>
                </div>
                <h1 className="font-bold text-sm">Catequese Digital</h1>
            </div>
            <button onClick={() => navigateTo('PROFILE')} className="size-8 rounded-full overflow-hidden border border-gray-200">
                <img src={user?.photoUrl || "https://picsum.photos/100"} alt="User" />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto h-full">
            {renderScreen()}
          </div>
        </main>

        {/* NAVEGAÇÃO MOBILE (Bottom Bar) */}
        <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around py-3 pb-6 px-4 shrink-0">
          <button onClick={() => navigateTo('DASHBOARD')} className={`flex flex-col items-center gap-1 ${currentScreen === 'DASHBOARD' ? 'text-primary' : 'text-gray-400'}`}>
            <span className="material-symbols-outlined">school</span>
            <span className="text-[10px] font-bold">Turmas</span>
          </button>
          <button onClick={() => navigateTo('PROFILE')} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-primary' : 'text-gray-400'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-bold">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
