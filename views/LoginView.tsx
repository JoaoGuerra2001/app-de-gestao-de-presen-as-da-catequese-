
import React, { useState } from 'react';
import { backend } from '../backend';
import { User } from '../types';

interface Props {
  onLoginSuccess: (user: User) => void;
  onRegister: () => void;
}

const LoginView: React.FC<Props> = ({ onLoginSuccess, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const user = await backend.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Email ou palavra-passe incorretos.');
      }
    } catch (e) {
      setError('Erro ao ligar ao servidor.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center pt-10 pb-4 px-8 text-center">
        <div className="w-36 h-36 mb-4 relative">
          <img
            src="/img_20260205_205522.jpg"
            alt="Logo Paróquia"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-text-main">Bem-vindo</h1>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed px-4">
          Catequese S. Simão • Gestão de Presenças
        </p>
      </div>

      <div className="px-8 space-y-4 flex flex-col">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main ml-1">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" 
              placeholder="exemplo@paroquia.pt" 
              className="w-full h-14 pl-12 rounded-xl bg-[#F8F9FC] border-gray-200 focus:ring-primary/20 focus:border-primary border transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main ml-1">Palavra-passe</label>
          <div className="relative flex">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">lock</span>
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password" 
              placeholder="Sua senha" 
              className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#F8F9FC] border-gray-200 focus:ring-primary/20 focus:border-primary border transition-all"
            />
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button 
            onClick={handleLogin}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>Entrar</span>
            <span className="material-symbols-outlined">login</span>
          </button>
          
          <button 
            onClick={onRegister}
            className="w-full h-14 bg-transparent border-2 border-primary text-primary font-bold rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-transform"
          >
            <span>Criar Conta</span>
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </div>

      <div className="mt-auto py-10 text-center">
        <p className="text-xs text-gray-400">
          Dica: admin@paroquia.pt / 123
        </p>
      </div>
    </div>
  );
};

export default LoginView;
