export interface UserProfile {
  id: string;           // UUID
  name: string;
  color: string;        // avatar background color (hex)
  createdAt: number;
}

export const AVATAR_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];
