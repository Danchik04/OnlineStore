import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import UserService, { User, UserRole } from '../../services/UserService';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is superuser
  const currentUser = UserService.getCurrentUser();
  const isSuperUser = currentUser?.role === 'superuser';

  useEffect(() => {
    if (!isSuperUser) {
      window.location.href = '/forbidden';
      return;
    }
    
    loadUsers();
  }, [isSuperUser]);

  const loadUsers = () => {
    setLoading(true);
    const allUsers = UserService.getUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }
    
    const filteredUsers = UserService.getUsers().filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setUsers(filteredUsers);
  };

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    try {
      UserService.changeUserRole(userId, newRole);
      setSuccessMessage('Роль пользователя успешно изменена');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'superuser':
        return 'bg-danger';
      case 'admin':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'superuser':
        return 'Суперпользователь';
      case 'admin':
        return 'Администратор';
      default:
        return 'Пользователь';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Управление пользователями</h1>
        <p className="text-muted">
          Здесь вы можете управлять ролями пользователей в системе
        </p>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="d-flex">
              <input 
                type="text" 
                className="form-control me-2" 
                placeholder="Поиск пользователей..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-primary">Поиск</button>
              {searchTerm && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => {
                    setSearchTerm('');
                    loadUsers();
                  }}
                >
                  Сбросить
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Имя</th>
                <th scope="col">Email</th>
                <th scope="col">Роль</th>
                <th scope="col">Дата регистрации</th>
                <th scope="col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user.id !== currentUser?.id ? (
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-primary dropdown-toggle" 
                            type="button" 
                            id={`role-dropdown-${user.id}`} 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                          >
                            Изменить роль
                          </button>
                          <ul className="dropdown-menu" aria-labelledby={`role-dropdown-${user.id}`}>
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleRoleChange(user.id, 'user')}
                                disabled={user.role === 'user'}
                              >
                                Пользователь
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleRoleChange(user.id, 'admin')}
                                disabled={user.role === 'admin'}
                              >
                                Администратор
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleRoleChange(user.id, 'superuser')}
                                disabled={user.role === 'superuser'}
                              >
                                Суперпользователь
                              </button>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <span className="text-muted">Ваш аккаунт</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 