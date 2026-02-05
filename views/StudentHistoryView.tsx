
import React, { useState, useEffect } from 'react';
import { Student, AttendanceStatus } from '../types';
import { backend } from '../backend';

interface Props {
  student: Student | null;
  onBack: () => void;
}

interface HistoryItem {
  date: string;
  status: AttendanceStatus;
  className: string;
}

const StudentHistoryView: React.FC<Props> = ({ student, onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | AttendanceStatus>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);
  
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

  useEffect(() => {
    if (student) {
      backend.getStudentAttendanceHistory(student.id).then(data => {
        setHistory(data);
        setLoading(false);
      });
      setEditData(student);
    }
  }, [student]);

  const stats = {
    present: history.filter(h => h.status === 'PRESENT').length,
    absent: history.filter(h => h.status === 'ABSENT').length,
    justified: history.filter(h => h.status === 'JUSTIFIED').length,
    total: history.length,
    percent: history.length > 0 
      ? Math.round((history.filter(h => h.status === 'PRESENT' || h.status === 'JUSTIFIED').length / history.length) * 100) 
      : 0
  };

  // Filtrar por Status e por Ano
  const filteredHistory = history.filter(h => {
    const itemDate = new Date(h.date);
    const matchesStatus = filter === 'ALL' || h.status === filter;
    const matchesYear = itemDate.getFullYear() === selectedYear;
    return matchesStatus && matchesYear;
  });

  // Agrupar por mês/ano para exibição
  const groupedHistory: Record<string, HistoryItem[]> = {};
  filteredHistory.forEach(item => {
    const date = new Date(item.date);
    const monthYear = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!groupedHistory[capitalizedMonth]) groupedHistory[capitalizedMonth] = [];
    groupedHistory[capitalizedMonth].push(item);
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', weekday: 'long' });
  };

  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return 'Não definida';
    return new Date(dateStr).toLocaleDateString('pt-PT');
  };

  const handleSaveEdit = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await backend.updateStudent(student.id, editData);
      setIsEditing(false);
    } catch (err) {
      alert('Erro ao guardar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return { icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Presente' };
      case 'ABSENT': return { icon: 'cancel', color: 'text-primary', bg: 'bg-primary/5', label: 'Falta' };
      case 'JUSTIFIED': return { icon: 'info', color: 'text-amber-500', bg: 'bg-amber-50', label: 'Justificada' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light overflow-y-auto no-scrollbar pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm p-4 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-main">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Histórico</h2>
        <div className="flex items-center gap-2">
           <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-xs font-bold bg-gray-50 border-none rounded-lg focus:ring-primary py-1 pl-2 pr-8"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <section className="bg-white p-6 pb-4 shadow-sm space-y-6">
        {/* Cabeçalho de Identidade */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="size-28 rounded-3xl border-4 border-background-light shadow-lg overflow-hidden bg-gray-100">
              <img src={student?.photoUrl || `https://picsum.photos/seed/${student?.id}/300/300`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-7 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px] filled">verified</span>
            </div>
          </div>
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">{student?.fullName}</h1>
            <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">Catequese Paróquia S. Simão</p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background-light p-3 rounded-2xl flex flex-col items-center">
            <span className="text-2xl font-bold">{stats.percent}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Assiduidade</span>
          </div>
          <div className="bg-background-light p-3 rounded-2xl flex flex-col items-center">
            <span className="text-2xl font-bold text-emerald-600">{stats.present}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Presente</span>
          </div>
          <div className="bg-background-light p-3 rounded-2xl flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{stats.absent}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Faltas</span>
          </div>
        </div>

        {/* INFORMAÇÕES DO CATEQUIZANDO */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Informações do Catequizando
            </h4>
            <button
              onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
              disabled={saving}
              className="text-[10px] font-bold text-primary bg-white px-2.5 py-1 rounded-lg hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? '...' : isEditing ? 'Guardar' : 'Editar'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
              <span className="material-symbols-outlined text-[18px]">cake</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Nascimento</p>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.birthDate || ''}
                  onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                  className="w-full text-xs font-bold border-none p-0 focus:ring-0 bg-transparent"
                />
              ) : (
                <p className="text-xs font-bold text-text-main">{formatBirthDate(editData?.birthDate)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-500 shrink-0">
              <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Enc. Educação</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.guardianName || ''}
                  onChange={(e) => setEditData({...editData, guardianName: e.target.value})}
                  placeholder="Nome"
                  className="w-full text-xs font-bold border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-300"
                />
              ) : (
                <p className="text-xs font-bold text-text-main">{editData?.guardianName || 'Não definido'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
              <span className="material-symbols-outlined text-[18px]">call</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Contacto Emergência</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.guardianContact || ''}
                  onChange={(e) => setEditData({...editData, guardianContact: e.target.value})}
                  placeholder="Contacto"
                  className="w-full text-xs font-bold border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-300"
                />
              ) : (
                <p className="text-xs font-bold text-text-main">{editData?.guardianContact || 'Não definido'}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Filtros */}
      <div className="sticky top-[71px] z-20 bg-background-light p-4 shadow-sm border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-5 h-9 rounded-full text-xs font-bold shrink-0 transition-all ${filter === 'ALL' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-gray-200 text-gray-400'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('PRESENT')}
            className={`px-5 h-9 rounded-full text-xs font-bold shrink-0 transition-all ${filter === 'PRESENT' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-white border border-gray-200 text-gray-400'}`}
          >
            Presentes
          </button>
          <button 
            onClick={() => setFilter('ABSENT')}
            className={`px-5 h-9 rounded-full text-xs font-bold shrink-0 transition-all ${filter === 'ABSENT' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-gray-200 text-gray-400'}`}
          >
            Faltas
          </button>
          <button 
            onClick={() => setFilter('JUSTIFIED')}
            className={`px-5 h-9 rounded-full text-xs font-bold shrink-0 transition-all ${filter === 'JUSTIFIED' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-white border border-gray-200 text-gray-400'}`}
          >
            Justificadas
          </button>
        </div>
      </div>

      {/* Lista de Histórico */}
      <div className="p-4 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-gray-400 text-sm font-medium">A carregar histórico...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-gray-300 text-[32px]">event_busy</span>
            </div>
            <div>
              <p className="text-gray-500 font-bold">Sem registos em {selectedYear}</p>
              <p className="text-gray-400 text-xs">Não foram encontradas presenças para o ano selecionado.</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">{monthYear}</h3>
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const cfg = getStatusConfig(item.status);
                  return (
                    <div key={`${item.date}-${idx}`} className="flex gap-3">
                      <div className="flex flex-col items-center pt-1 shrink-0">
                        <span className={`material-symbols-outlined filled ${cfg.color} text-[22px]`}>{cfg.icon}</span>
                        {idx !== items.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-2"></div>}
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform">
                        {item.status === 'ABSENT' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-text-main truncate max-w-[140px]">{item.className}</h4>
                          <span className={`text-[9px] font-bold ${cfg.bg} ${cfg.color} px-2 py-0.5 rounded uppercase tracking-wider`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mt-1.5 font-medium">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          <span className="capitalize">{formatDate(item.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentHistoryView;
