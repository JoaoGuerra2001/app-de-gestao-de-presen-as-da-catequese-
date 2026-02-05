
import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../backend';
import { User } from '../types';

interface Props {
  onBack: () => void;
}

const NewClassView: React.FC<Props> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [parish, setParish] = useState('São Simão - Oiã');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Sábado');
  const [time, setTime] = useState('10:00');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [availableCatechists, setAvailableCatechists] = useState<User[]>([]);
  const [selectedCatechistIds, setSelectedCatechistIds] = useState<string[]>([]);
  const [catechistSearch, setCatechistSearch] = useState(''); 
  const currentUser = backend.getCurrentUser();

  useEffect(() => {
    backend.listUsersForAssignment().then(users => {
      setAvailableCatechists(users);
      if (currentUser) {
        setSelectedCatechistIds([currentUser.id]);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCatechist = (id: string) => {
    setSelectedCatechistIds(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id) 
        : [...prev, id]
    );
  };

  const filteredCatechists = availableCatechists.filter(cat =>
    cat.name.toLowerCase().includes(catechistSearch.toLowerCase()) ||
    cat.email.toLowerCase().includes(catechistSearch.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleSave = async () => {
    if (!name || !room) {
      alert('Por favor, preencha o nome da turma e a sala.');
      return;
    }
    if (selectedCatechistIds.length === 0) {
      alert('Selecione pelo menos um catequista para esta turma.');
      return;
    }
    setLoading(true);
    try {
      await backend.createClass({
        name,
        parish,
        room,
        schedule: `${day} • ${time}`,
        yearCycle: name,
        assignedCatechistIds: selectedCatechistIds,
        photoUrl
      });
      onBack();
    } catch (err) {
      alert('Erro ao criar turma.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-primary font-medium p-2 -ml-2 active:opacity-50 transition-opacity">Cancelar</button>
          <h1 className="text-[17px] font-bold">Nova Turma</h1>
          <button onClick={handleSave} disabled={loading} className="text-primary font-bold p-2 -mr-2 disabled:opacity-50 active:opacity-50 transition-opacity">
            {loading ? '...' : 'Salvar'}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-8 pb-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Criar Turma</h2>
          
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="size-32 rounded-3xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group"
            >
              {photoUrl ? (
                <>
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white">edit</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-gray-300 text-3xl">add_a_photo</span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Foto da Turma</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Informação Geral</span>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designação (Ano/Ciclo)</p>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 3º Ano - Primeira Comunhão" 
                  className="w-full border-none p-0 text-base font-medium focus:ring-0 placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-4 relative">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">church</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paróquia</p>
                <select 
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  className="w-full border-none p-0 text-base font-medium focus:ring-0 bg-transparent appearance-none"
                >
                  <option value="São Simão - Oiã">São Simão - Oiã</option>
                  <option value="Outra Paróquia">Outra Paróquia</option>
                </select>
              </div>
              <span className="material-symbols-outlined absolute right-4 text-gray-300 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Equipa de Catequese</span>
            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{selectedCatechistIds.length} Selecionados</span>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-50 bg-gray-50/20">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-[20px]">search</span>
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={catechistSearch}
                  onChange={(e) => setCatechistSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
              {filteredCatechists.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => toggleCatechist(cat.id)}
                  className={`flex items-center gap-3 p-3 active:bg-gray-50 transition-colors cursor-pointer group ${selectedCatechistIds.includes(cat.id) ? 'bg-primary/5' : ''}`}
                >
                  <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${selectedCatechistIds.includes(cat.id) ? 'bg-primary border-primary' : 'border-gray-200 group-hover:border-primary/50'}`}>
                    {selectedCatechistIds.includes(cat.id) && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                  </div>
                  <div className="size-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                    <img src={cat.photoUrl || `https://picsum.photos/seed/${cat.id}/100`} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${selectedCatechistIds.includes(cat.id) ? 'text-primary' : 'text-text-main'}`}>{cat.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate">{cat.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Logística & Horário</span>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="size-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">meeting_room</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sala / Localização</p>
                <input 
                  type="text" 
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ex: Sala 3 (Centro Paroquial)" 
                  className="w-full border-none p-0 text-base font-medium focus:ring-0 placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-4 relative">
              <div className="size-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dia da Semana</p>
                <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full border-none p-0 text-base font-medium focus:ring-0 bg-transparent appearance-none font-bold">
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Sexta-feira">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-4 relative">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário de Início</p>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border-none p-0 text-base font-medium focus:ring-0 font-bold" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50">
        <button onClick={handleSave} disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>
            {loading ? 'sync' : 'add_circle'}
          </span>
          {loading ? 'A criar...' : 'Confirmar Nova Turma'}
        </button>
      </div>
    </div>
  );
};

export default NewClassView;
