
import React, { useState, useRef } from 'react';
import { backend } from '../backend';

interface Props {
  classId?: string;
  onBack: () => void;
}

const NewStudentView: React.FC<Props> = ({ classId, onBack }) => {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [guardian, setGuardian] = useState('');
  const [contact, setContact] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async () => {
    if (!classId) return;
    await backend.createStudent({
      classId,
      fullName: name,
      birthDate: birth,
      guardianName: guardian,
      guardianContact: contact,
      photoUrl
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background-light overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-main">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Novo Catequizando</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 pb-32 space-y-6">
        <div className="flex flex-col items-center py-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="size-32 rounded-full bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group shadow-sm"
          >
            {photoUrl ? (
              <>
                <img src={photoUrl} className="w-full h-full object-cover" alt="Student" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-gray-300 text-3xl">add_a_photo</span>
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Foto do Aluno</span>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Nome Completo</label>
            <input 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full h-12 border-b border-gray-100 focus:border-primary outline-none" placeholder="João Silva" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Data Nascimento</label>
            <input 
              value={birth} onChange={e => setBirth(e.target.value)}
              type="date" className="w-full h-12 border-b border-gray-100 focus:border-primary outline-none" 
            />
          </div>
        </div>

        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm">Encarregado de Educação</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Nome</label>
            <input 
              value={guardian} onChange={e => setGuardian(e.target.value)}
              className="w-full h-12 border-b border-gray-100 focus:border-primary outline-none" placeholder="Pai/Mãe..." 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Contacto</label>
            <input 
              value={contact} onChange={e => setContact(e.target.value)}
              className="w-full h-12 border-b border-gray-100 focus:border-primary outline-none" placeholder="912 345 678" 
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 border-t border-gray-100 z-30">
        <button 
          onClick={handleSave}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
        >
          Guardar Catequizando
        </button>
      </div>
    </div>
  );
};

export default NewStudentView;
