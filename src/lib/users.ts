import { UserProfile, AVATAR_COLORS } from '@/types/user';

const ALL_USERS_KEY = 'calories_users';
const CURRENT_USER_KEY = 'calories_current_user';

export function getAllUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): UserProfile | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getAllUsers().find((u) => u.id === id) ?? null;
}

export function createUser(name: string): UserProfile {
  const users = getAllUsers();
  const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
  const user: UserProfile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color,
    createdAt: Date.now(),
  };
  users.push(user);
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  return user;
}

export function setCurrentUser(id: string): void {
  localStorage.setItem(CURRENT_USER_KEY, id);
}

export function deleteUser(id: string): void {
  // Remove all user data
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(`u_${id}_`));
  keys.forEach((k) => localStorage.removeItem(k));
  // Remove from users list
  const users = getAllUsers().filter((u) => u.id !== id);
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  // Clear current if it was this user
  if (getCurrentUserId() === id) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function updateUser(updated: UserProfile): void {
  const users = getAllUsers().map((u) => (u.id === updated.id ? updated : u));
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
