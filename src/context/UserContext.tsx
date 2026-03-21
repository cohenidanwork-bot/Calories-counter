'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserProfile } from '@/types/user';
import {
  getCurrentUser,
  setCurrentUser,
  createUser,
  getAllUsers,
  deleteUser,
  updateUser,
} from '@/lib/users';

interface UserContextValue {
  user: UserProfile | null;
  allUsers: UserProfile[];
  login: (id: string) => void;
  logout: () => void;
  register: (name: string) => UserProfile;
  removeUser: (id: string) => void;
  renameUser: (id: string, name: string) => void;
  refreshUsers: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => getAllUsers());

  const refreshUsers = useCallback(() => {
    setAllUsers(getAllUsers());
  }, []);

  const login = useCallback((id: string) => {
    setCurrentUser(id);
    const users = getAllUsers();
    const found = users.find((u) => u.id === id) ?? null;
    setUser(found);
    setAllUsers(users);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('calories_current_user');
    setUser(null);
  }, []);

  const register = useCallback((name: string): UserProfile => {
    const newUser = createUser(name);
    setCurrentUser(newUser.id);
    setUser(newUser);
    setAllUsers(getAllUsers());
    return newUser;
  }, []);

  const removeUser = useCallback((id: string) => {
    deleteUser(id);
    setAllUsers(getAllUsers());
    if (user?.id === id) setUser(null);
  }, [user]);

  const renameUser = useCallback((id: string, name: string) => {
    const users = getAllUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return;
    updateUser({ ...target, name: name.trim() });
    setAllUsers(getAllUsers());
    if (user?.id === id) setUser((prev) => prev ? { ...prev, name: name.trim() } : prev);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, allUsers, login, logout, register, removeUser, renameUser, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
