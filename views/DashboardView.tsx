
import React, { useState, useEffect } from 'react';
import { CatechesisClass, User } from '../types';
import { backend } from '../backend';

interface Props {
  user: User | null;
  onSelectClass: (c: CatechesisClass) => void;
  onProfile: () => void;
  onNewClass: () => void;
}

const DashboardView: React.FC<Props> = ({ user, onSelectClass, onProfile, onNewClass }) => {
  const [classes, setClasses] = useState<CatechesisClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{id: string, name: string} | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await backend.listClasses();
      setClasses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const confirmDelete = async () => {
    if (!showConfirm) return;
    const { id } = showConfirm;
    setDeletingId(id);
    setShowConfirm(null);
    try {
      await backend.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Erro ao eliminar a turma.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao portal de gestão da Catequese S. Simão.</p>
        </div>
        <button 
          onClick={onNewClass}
          className="bg-primary text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nova Turma
        </button>
      </div>

      {/* Estatísticas Web */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="size-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">school</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Total de Turmas</p>
          <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="size-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Presença Média</p>
          <p className="text-2xl font-bold text-gray-900">85%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-50">
          <div className="size-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">notifications</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Alertas Ativos</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="size-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">event</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Próxima Sessão</p>
          <p className="text-lg font-bold text-gray-900">Sábado, 10:00</p>
        </div>
      </div>

      {/* Grelha de Turmas */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          As Minhas Turmas
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center flex flex-col items-center gap-4">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-[48px]">library_add</span>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-xl">Ainda não tens turmas</p>
              <p className="text-gray-500">Começa por criar a tua primeira turma de catequese.</p>
            </div>
            <button onClick={onNewClass} className="text-primary font-bold hover:underline">Criar Turma Agora</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div 
                key={c.id} 
                className={`group bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${deletingId === c.id ? 'opacity-30 scale-95 pointer-events-none' : ''}`}
              >
                <div className="p-6 flex-1 cursor-pointer" onClick={() => onSelectClass(c)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined">local_library</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowConfirm({id: c.id, name: c.name}); }}
                      className="size-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                      <span>{c.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-[16px]">church</span>
                      <span>{c.parish}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="size-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${c.id}${i}/100`} alt="student" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="size-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">+12</div>
                  </div>
                  <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Gerir Turma
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação Personalizado */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] filled">warning</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Eliminar Turma?</h4>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Estás prestes a eliminar permanentemente a turma <span className="font-bold text-gray-900">"{showConfirm.name}"</span>. Esta ação apagará todos os registos de presença associados.
              </p>
            </div>
            <div className="grid grid-cols-2 w-full gap-4">
              <button 
                onClick={() => setShowConfirm(null)}
                className="h-14 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="h-14 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
