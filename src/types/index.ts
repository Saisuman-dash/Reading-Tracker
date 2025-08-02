export interface ReadingSession {
  id: string;
  date: string; // YYYY-MM-DD format
  timeSlot: 'morning' | 'afternoon' | 'evening';
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // total minutes
  content: string; // book/article title, pages read
  notes?: string; // optional insights/reflections
  createdAt: number; // timestamp
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'time' | 'content';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionDuration: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  minutesThisWeek: number;
  minutesThisMonth: number;
}

export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4 | 5;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type ViewMode = 'week' | 'month' | 'all';

// Enhanced types for dashboard features
export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  profilePicture?: string;
  email: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  location?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'coding' | 'learning' | 'projects' | 'reading' | 'fitness' | 'other';
  targetValue: number;
  currentValue: number;
  unit: string; // 'hours', 'pages', 'problems', 'days', etc.
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: number;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'coding' | 'learning' | 'reading' | 'project' | 'other';
  duration: number; // minutes
  resources: ResourceLink[];
  tags: string[];
  mood: 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent
  achievements: string[]; // achievement IDs unlocked today
  isPublic: boolean;
  shareableUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  platform: 'leetcode' | 'codechef' | 'github' | 'youtube' | 'documentation' | 'article' | 'other';
  description?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'time' | 'content' | 'goal' | 'social';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface CreatorInfo {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
  bio: string;
}