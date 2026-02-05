
import React, { useState, useEffect, useRef } from 'react';
import { CatechesisClass, Student, User } from '../types';
import { backend } from '../backend';

interface Props {
  classData: CatechesisClass | null;
  onBack: () => void;
  onSelectStudent: (s: Student) => void;
  onAttendance: () => void;
  onNewStudent: () => void;
}

const ClassDetailsView: React.FC<Props> = ({ classData, onBack, onSelectStudent, onAttendance, onNewStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [catechists, setCatechists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catechistSearch, setCatechistSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmStudent, setShowConfirmStudent] = useState<{id: string, name: string} | null>(null);
  const [currentClassPhoto, setCurrentClassPhoto] = useState(classData?.photoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (classData) {
      setLoading(true);
      try {
        const [studentData, catechistData] = await Promise.all([
          backend.listStudents(classData.id),
          backend.getCatechistsByClass(classData.id)
        ]);
        setStudents(studentData);
        setCatechists(catechistData);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    if (classData) setCurrentClassPhoto(classData.photoUrl || '');
  }, [classData]);

  const handleClassPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && classData) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const b64 = reader.result as string;
        setCurrentClassPhoto(b64);
        try {
          await backend.updateClass(classData.id, { photoUrl: b64 });
        } catch (err) {
          alert('Erro ao atualizar foto da turma.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDeleteStudent = async () => {
    if (!showConfirmStudent) return;
    const { id } = showConfirmStudent;
    setDeletingId(id);
    setShowConfirmStudent(null);
    try {
      await backend.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = students
    .filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const filteredCatechists = catechists.filter(c => 
    c.name.toLowerCase().includes(catechistSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span onClick={onBack} className="hover:text-primary cursor-pointer transition-colors">Turmas</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-gray-900">Detalhes</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{classData?.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onAttendance} className="bg-primary text-white h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-hover active:scale-95 transition-all">
                <span className="material-symbols-outlined">how_to_reg</span>
                Registar Presenças
            </button>
            <button onClick={onNewStudent} className="bg-white text-gray-700 border border-gray-200 h-12 px-6 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span>
                Novo Aluno
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="flex flex-col gap-8 lg:sticky lg:top-10">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="size-24 rounded-3xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                         onClick={() => fileInputRef.current?.click()}>
                        <img src={currentClassPhoto || `https://picsum.photos/seed/${classData?.id}/200/200`} alt="class" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="material-symbols-outlined text-white">photo_camera</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleClassPhotoChange} />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{classData?.parish}</h2>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">{classData?.schedule}</span>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-50 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400">meeting_room</span>
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{classData?.room}</p>
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-tighter">Sala de Sessão</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{classData?.yearCycle}</p>
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-tighter">Ciclo / Ano</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Equipa Técnica</h3>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase">{filteredCatechists.length} Catequistas</span>
                </div>
                <div className="space-y-2">
                    {filteredCatechists.map(cat => (
                        <div key={cat.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src={cat.photoUrl || "https://picsum.photos/100"} className="size-10 rounded-full border border-gray-100" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{cat.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">
                                    {cat.role === 'ADMIN' ? 'Administrador' : 'Catequista'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Catequizandos</h3>
                    <div className="relative w-full md:w-72">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input type="text" placeholder="Pesquisar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 pl-10 rounded-xl border-gray-200 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encarregado</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map(s => (
                                <tr key={s.id} className={`group hover:bg-primary/5 transition-colors duration-300 ${deletingId === s.id ? 'opacity-30' : ''}`}>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectStudent(s)}>
                                        <div className="flex items-center gap-3">
                                            <img src={s.photoUrl || "https://picsum.photos/100"} className="size-10 rounded-full border border-gray-100 object-cover" />
                                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{s.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.guardianName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.guardianContact}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onSelectStudent(s)} className="size-9 bg-gray-50 text-gray-400 hover:bg-white hover:text-primary hover:shadow-md rounded-lg flex items-center justify-center transition-all">
                                                <span className="material-symbols-outlined text-[18px]">history</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setShowConfirmStudent({id: s.id, name: s.fullName}); }} className="size-9 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:shadow-md rounded-lg flex items-center justify-center transition-all">
                                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {showConfirmStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] filled">person_remove</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Remover Aluno?</h4>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Estás prestes a remover <span className="font-bold text-gray-900">"{showConfirmStudent.name}"</span> desta turma.
              </p>
            </div>
            <div className="grid grid-cols-2 w-full gap-4">
              <button onClick={() => setShowConfirmStudent(null)} className="h-14 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200">Cancelar</button>
              <button onClick={confirmDeleteStudent} className="h-14 bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:bg-red-700">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailsView;
