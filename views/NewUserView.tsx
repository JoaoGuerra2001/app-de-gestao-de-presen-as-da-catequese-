
import React, { useState } from 'react';
import { backend } from '../backend';
import { UserRole } from '../types';

interface Props {
  onBack: () => void;
}

const NewUserView: React.FC<Props> = ({ onBack }) => {
  const [role, setRole] = useState<UserRole>('CATECHIST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    setError('');
    
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await backend.createUser({
        name,
        email,
        password,
        role,
        parish: 'S. Simão' // Valor padrão para este contexto
      });
      onBack();
    } catch (err: any) {
      if (err.message === '403 Forbidden') {
        setError('Apenas administradores podem criar novos utilizadores.');
      } else {
        setError('Ocorreu um erro ao criar o utilizador.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-main">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold">Novo Utilizador</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 pb-32">
        <div className="mb-6">
          <p className="text-gray-500 text-sm leading-relaxed">
            Preencha os dados abaixo para registar um novo catequista ou administrador no sistema paroquial.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">Dados Pessoais</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-main">Nome Completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome e Apelido" 
                    className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary focus:border-primary" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-main">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@paroquia.pt" 
                    className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary focus:border-primary" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">Tipo de Perfil</h3>
            <div className="bg-gray-200 p-1 rounded-2xl flex">
              {/* Fix: Using 'CATECHIST' instead of 'CATEQUISTA' to match UserRole type */}
              <button 
                onClick={() => setRole('CATECHIST')}
                className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'CATECHIST' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                Catequista
              </button>
              <button 
                onClick={() => setRole('ADMIN')}
                className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'ADMIN' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                Admin
              </button>
            </div>
            <p className="text-[11px] text-gray-400 px-1 leading-relaxed">
              Catequistas têm acesso apenas às suas turmas. Administradores gerem todo o sistema.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">Segurança</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-main">Palavra-passe</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary focus:border-primary" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-main">Confirmar palavra-passe</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock_reset</span>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary focus:border-primary" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 pb-8 bg-white border-t border-gray-100">
        <button 
          onClick={handleCreateUser}
          disabled={loading}
          className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            {loading ? 'sync' : 'person_add'}
          </span>
          {loading ? 'A criar...' : 'Criar Utilizador'}
        </button>
      </div>
    </div>
  );
};

export default NewUserView;
