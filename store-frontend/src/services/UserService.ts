export type UserRole = 'user' | 'admin' | 'superuser';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // Note: In a real app, we wouldn't store passwords in the client
  role: UserRole;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'store_users';
const CURRENT_USER_KEY = 'current_user';

class UserService {
  // Get all users from storage
  getUsers(): User[] {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersData) {
      // Initialize with default test users
      const defaultUsers: User[] = [
        {
          id: 1,
          name: 'Super Admin',
          email: 'super@example.com',
          password: 'password123', // In a real app, this would be hashed
          role: 'superuser',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Regular User',
          email: 'user@example.com',
          password: 'password123',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersData);
  }

  // Save users to storage
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Get current user
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Set current user
  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  }

  // Clear current user (logout)
  clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('isAuthenticated');
  }

  // Register a new user
  registerUser(name: string, email: string, password: string): User {
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    const newUser: User = {
      id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password, // Again, in a real app, this would be hashed
      role: 'user', // Default role is user
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveUsers(users);
    
    return newUser;
  }

  // Login user
  loginUser(email: string, password: string): User {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Неверный email или пароль');
    }
    
    this.setCurrentUser(user);
    return user;
  }

  // Check if current user has a specific role
  hasRole(role: UserRole | UserRole[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  }

  // Change user role (superuser only)
  changeUserRole(userId: number, newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    
    // Only superuser can change roles
    if (!currentUser || currentUser.role !== 'superuser') {
      throw new Error('Недостаточно прав для изменения ролей');
    }
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Пользователь не найден');
    }
    
    // Don't allow changing own role
    if (users[userIndex].id === currentUser.id) {
      throw new Error('Нельзя изменить собственную роль');
    }
    
    users[userIndex].role = newRole;
    this.saveUsers(users);
  }
}

export default new UserService(); 