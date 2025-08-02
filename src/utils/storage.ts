import { ReadingSession, Badge } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'reading-tracker-sessions',
  BADGES: 'reading-tracker-badges',
  LAST_SESSION_DATE: 'reading-tracker-last-session-date',
} as const;

export const storageUtils = {
  // Session management
  saveSessions: (sessions: ReadingSession[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  },

  loadSessions: (): ReadingSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  addSession: (session: ReadingSession): void => {
    const sessions = storageUtils.loadSessions();
    sessions.push(session);
    sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    storageUtils.saveSessions(sessions);
  },

  updateSession: (sessionId: string, updates: Partial<ReadingSession>): void => {
    const sessions = storageUtils.loadSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      storageUtils.saveSessions(sessions);
    }
  },

  deleteSession: (sessionId: string): void => {
    const sessions = storageUtils.loadSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    storageUtils.saveSessions(filtered);
  },

  // Badge management
  saveBadges: (badges: Badge[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (error) {
      console.error('Failed to save badges:', error);
    }
  },

  loadBadges: (): Badge[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load badges:', error);
      return [];
    }
  },

  // Session date tracking
  setLastSessionDate: (date: string): void => {
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION_DATE, date);
  },

  getLastSessionDate: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SESSION_DATE);
  },

  // Export functionality
  exportData: (): string => {
    const sessions = storageUtils.loadSessions();
    const badges = storageUtils.loadBadges();
    return JSON.stringify({ sessions, badges }, null, 2);
  },

  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.sessions && Array.isArray(data.sessions)) {
        storageUtils.saveSessions(data.sessions);
      }
      if (data.badges && Array.isArray(data.badges)) {
        storageUtils.saveBadges(data.badges);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};