import { createClient } from '@supabase/supabase-js';
import { UserProfile, Goal, DailyLog, Achievement, ReadingSession } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create client with fallback values - will show connection error in UI instead of crashing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-anon-key' &&
         supabaseUrl && supabaseAnonKey;
};

// Database service functions
export const supabaseService = {
  // Check configuration before any operation
  async checkConnection(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.');
      return false;
    }
    return true;
  },

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!await this.checkConnection()) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    if (!await this.checkConnection()) return false;
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profile);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
    return true;
  },

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    if (!await this.checkConnection()) return [];
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
    return data || [];
  },

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal | null> {
    if (!await this.checkConnection()) return null;
    
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }
    return data;
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<boolean> {
    if (!await this.checkConnection()) return false;
    
    const { error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId);
    
    if (error) {
      console.error('Error updating goal:', error);
      return false;
    }
    return true;
  },

  // Daily Logs
  async getDailyLogs(userId: string, limit?: number): Promise<DailyLog[]> {
    if (!await this.checkConnection()) return [];
    
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching daily logs:', error);
      return [];
    }
    return data || [];
  },

  async createDailyLog(log: Omit<DailyLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyLog | null> {
    if (!await this.checkConnection()) return null;
    
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating daily log:', error);
      return null;
    }
    return data;
  },

  async getPublicDailyLog(shareableUrl: string): Promise<DailyLog | null> {
    if (!await this.checkConnection()) return null;
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('shareable_url', shareableUrl)
      .eq('is_public', true)
      .single();
    
    if (error) {
      console.error('Error fetching public daily log:', error);
      return null;
    }
    return data;
  },

  // Reading Sessions (enhanced)
  async getReadingSessions(userId: string): Promise<ReadingSession[]> {
    if (!await this.checkConnection()) return [];
    
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching reading sessions:', error);
      return [];
    }
    return data || [];
  },

  async createReadingSession(session: Omit<ReadingSession, 'id' | 'createdAt'>): Promise<ReadingSession | null> {
    if (!await this.checkConnection()) return null;
    
    const { data, error } = await supabase
      .from('reading_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reading session:', error);
      return null;
    }
    return data;
  },

  // Achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    if (!await this.checkConnection()) return [];
    
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
    return data || [];
  },

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    if (!await this.checkConnection()) return false;
    
    const { error } = await supabase
      .from('achievements')
      .update({
        unlocked: true,
        unlocked_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('id', achievementId);
    
    if (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
    return true;
  }
};