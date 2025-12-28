
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { backend } from '../backend';

interface Props {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<Props> = ({ user, onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    parish: user.parish,
    group: user.group || '',
    phone: user.phone || '',
    photoUrl: user.photoUrl || ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await backend.updateUser(user.id, formData);
      setIsEditing(false);
      // Forçar atualização local se necessário ou o App.tsx tratará via re-render
    } catch (err) {
      alert('Erro ao guardar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">O Meu Perfil</h1>
        <div className="flex gap-2">
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-primary text-white h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-hover transition-all">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Editar Perfil
                </button>
            ) : (
                <>
                    <button onClick={() => setIsEditing(false)} className="bg-white text-gray-500 border border-gray-200 h-11 px-6 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="bg-emerald-600 text-white h-11 px-6 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 hover:bg-emerald-700 transition-all">
                        <span className="material-symbols-outlined text-[20px]">{loading ? 'sync' : 'check'}</span>
                        Guardar Alterações
                    </button>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center gap-4 h-fit">
              <div className="relative group">
                <div className={`size-32 rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-xl transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                     onClick={() => isEditing && fileInputRef.current?.click()}>
                    <img src={formData.photoUrl || "https://picsum.photos/300"} alt="profile" className="w-full h-full object-cover" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                      </div>
                    )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <div className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
              </div>
              <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
                  <p className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest mt-1">
                      {user.role === 'ADMIN' ? 'Administrador' : 'Catequista'}
                  </p>
              </div>
          </div>

          <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome de Utilizador</label>
                          {isEditing ? (
                              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-11 bg-gray-50 rounded-xl px-4 text-sm border-none focus:ring-primary/20" />
                          ) : (
                              <p className="font-bold text-gray-900">{formData.name}</p>
                          )}
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Principal</label>
                          {isEditing ? (
                              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-11 bg-gray-50 rounded-xl px-4 text-sm border-none focus:ring-primary/20" />
                          ) : (
                              <p className="font-bold text-gray-900">{formData.email}</p>
                          )}
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paróquia</label>
                          {isEditing ? (
                              <input value={formData.parish} onChange={e => setFormData({...formData, parish: e.target.value})} className="w-full h-11 bg-gray-50 rounded-xl px-4 text-sm border-none focus:ring-primary/20" />
                          ) : (
                              <p className="font-bold text-gray-900">{formData.parish}</p>
                          )}
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telemóvel</label>
                          {isEditing ? (
                              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-11 bg-gray-50 rounded-xl px-4 text-sm border-none focus:ring-primary/20" />
                          ) : (
                              <p className="font-bold text-gray-900">{formData.phone || 'N/A'}</p>
                          )}
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Zona de Perigo</h3>
                  <button onClick={onLogout} className="text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                      <span className="material-symbols-outlined">logout</span>
                      Terminar Sessão em todos os dispositivos
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileView;
