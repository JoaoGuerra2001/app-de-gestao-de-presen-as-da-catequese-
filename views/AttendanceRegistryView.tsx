
import React, { useState, useEffect } from 'react';
import { CatechesisClass, Student, AttendanceStatus } from '../types';
import { backend } from '../backend';

interface Props {
  classData: CatechesisClass | null;
  onBack: () => void;
}

const AttendanceRegistryView: React.FC<Props> = ({ classData, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados para o seletor de data personalizado
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

  useEffect(() => {
    if (classData) {
      backend.listStudents(classData.id).then(setStudents);
    }
  }, [classData]);

  const handleToggle = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (!classData) return;
    setSaving(true);
    
    // Constrói a data formatada para o backend (YYYY-MM-DD)
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    const items = students.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || 'ABSENT'
    }));
    
    await backend.markAttendance(classData.id, formattedDate, items);
    setSaving(false);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background-light overflow-y-auto no-scrollbar pb-32">
      <header className="sticky top-0 z-30 bg-background-light border-b border-gray-200 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-main">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Presenças</h2>
        <div className="w-10"></div>
      </header>

      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold">{classData?.name}</h1>
        <p className="text-gray-500 text-sm">Selecione a data e registe as faltas</p>
      </div>

      {/* Seção de Seleção de Data Personalizada */}
      <div className="px-6 py-4 space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Data da Sessão</label>
        <div className="flex gap-2">
          {/* Seletor de Dia */}
          <div className="flex-[0.8]">
            <div className="relative">
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full h-14 pl-3 pr-1 rounded-xl bg-white border-gray-200 focus:ring-primary focus:border-primary appearance-none font-bold text-text-main shadow-sm transition-all text-sm"
              >
                {days.map(d => (
                  <option key={d} value={d}>{d < 10 ? `0${d}` : d}</option>
                ))}
              </select>
            </div>
            <p className="text-[9px] text-center mt-1 text-gray-400 font-bold uppercase tracking-tighter">Dia</p>
          </div>

          {/* Seletor de Mês */}
          <div className="flex-[2]">
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full h-14 pl-4 pr-1 rounded-xl bg-white border-gray-200 focus:ring-primary focus:border-primary appearance-none font-bold text-text-main shadow-sm transition-all text-sm"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <p className="text-[9px] text-center mt-1 text-gray-400 font-bold uppercase tracking-tighter">Mês</p>
          </div>

          {/* Seletor de Ano (Adicionado) */}
          <div className="flex-1">
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-14 pl-3 pr-1 rounded-xl bg-white border-gray-200 focus:ring-primary focus:border-primary appearance-none font-bold text-text-main shadow-sm transition-all text-sm"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <p className="text-[9px] text-center mt-1 text-gray-400 font-bold uppercase tracking-tighter">Ano</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {students.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">Nenhum aluno nesta turma para registar.</p>
          </div>
        ) : (
          students.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                  <img src={s.photoUrl || `https://picsum.photos/seed/${s.id}/100/100`} alt={s.fullName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-text-main leading-tight truncate">{s.fullName}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">{s.guardianName}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleToggle(s.id, 'PRESENT')}
                  className={`h-11 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${attendance[s.id] === 'PRESENT' ? 'bg-green-500 border-green-500 text-white shadow-green-200' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${attendance[s.id] === 'PRESENT' ? 'filled' : ''}`}>check_circle</span>
                  PRESENTE
                </button>
                <button 
                  onClick={() => handleToggle(s.id, 'ABSENT')}
                  className={`h-11 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${attendance[s.id] === 'ABSENT' ? 'bg-primary border-primary text-white shadow-primary/20' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${attendance[s.id] === 'ABSENT' ? 'filled' : ''}`}>cancel</span>
                  FALTA
                </button>
                <button 
                  onClick={() => handleToggle(s.id, 'JUSTIFIED')}
                  className={`h-11 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${attendance[s.id] === 'JUSTIFIED' ? 'bg-amber-500 border-amber-500 text-white shadow-amber-200' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${attendance[s.id] === 'JUSTIFIED' ? 'filled' : ''}`}>info</span>
                  JUSTIF.
                </button>
              </div>
            </div>
          ))
        )}

        {students.length > 0 && (
          <div className="mt-8 mb-10 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notas da Sessão</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-primary focus:border-primary min-h-[120px] shadow-sm resize-none"
              placeholder="Algum incidente ou nota especial sobre este encontro?"
            ></textarea>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <button 
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
          {saving ? 'A guardar...' : 'Guardar Registo'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceRegistryView;
