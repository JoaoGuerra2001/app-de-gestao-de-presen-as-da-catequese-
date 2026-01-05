
import React, { useState, useEffect } from 'react';
import { backend } from '../backend';
import { User } from '../types';

interface Props {
  onBack: () => void;
}

const ManageUsersView: React.FC<Props> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await backend.listUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem a certeza que pretende eliminar ${userName}?`)) return;

    setDeletingId(userId);
    try {
      await backend.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert('Erro ao eliminar utilizador: ' + (err.message || 'Tente novamente'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background-light overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-text-main">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold">Gerir Catequistas</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 pb-20">
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">search</span>
            <input
              type="text"
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border-gray-200 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-300"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-400">A carregar...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-400">Nenhum utilizador encontrado</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="size-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                    <img
                      src={user.photoUrl || `https://picsum.photos/seed/${user.id}/100`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-tighter truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.role === 'ADMIN' ? 'Administrador' : 'Catequista'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    disabled={deletingId === user.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {deletingId === user.id ? 'sync' : 'delete'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsersView;
