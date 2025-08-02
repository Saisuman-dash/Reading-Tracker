import { format, subDays, startOfWeek, endOfWeek, startOfMonth, 
         endOfMonth, isWithinInterval, parseISO, differenceInDays,
         isToday, isYesterday } from 'date-fns';
import { ReadingSession, HeatmapData, UserStats } from '../types';

export const dateUtils = {
  // Format dates
  formatDate: (date: Date | string): string => {
    return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
  },

  formatDisplayDate: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    return format(dateObj, 'MMM d, yyyy');
  },

  formatTime: (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  },

  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  },

  // Calculate duration between times
  calculateDuration: (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  },

  // Get time slot for a given time
  getTimeSlot: (time: string): 'morning' | 'afternoon' | 'evening' => {
    const [hours] = time.split(':').map(Number);
    if (hours >= 6 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 18) return 'afternoon';
    return 'evening';
  },

  // Generate heatmap data for last 365 days
  generateHeatmapData: (sessions: ReadingSession[]): HeatmapData[] => {
    const today = new Date();
    const heatmapData: HeatmapData[] = [];
    
    // Create map of sessions by date
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Generate data for last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = dateUtils.formatDate(date);
      const count = sessionsByDate[dateString] || 0;
      
      let level: 0 | 1 | 2 | 3 | 4 | 5 = 0;
      if (count >= 3) level = 5;
      else if (count >= 2) level = 4;
      else if (count >= 1) level = 3;
      else if (count === 0) level = 0;

      heatmapData.push({
        date: dateString,
        count,
        level
      });
    }

    return heatmapData;
  },

  // Calculate user statistics
  calculateStats: (sessions: ReadingSession[]): UserStats => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Basic stats
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Weekly and monthly stats
    const sessionsThisWeek = sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    }).length;

    const sessionsThisMonth = sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
    }).length;

    const minutesThisWeek = sessions
      .filter(session => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
      })
      .reduce((sum, session) => sum + session.duration, 0);

    const minutesThisMonth = sessions
      .filter(session => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, session) => sum + session.duration, 0);

    // Calculate streaks
    const { currentStreak, longestStreak } = dateUtils.calculateStreaks(sessions);

    return {
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      averageSessionDuration,
      sessionsThisWeek,
      sessionsThisMonth,
      minutesThisWeek,
      minutesThisMonth,
    };
  },

  // Calculate reading streaks
  calculateStreaks: (sessions: ReadingSession[]): { currentStreak: number; longestStreak: number } => {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique dates with sessions
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = dateUtils.formatDate(new Date());
    const yesterday = dateUtils.formatDate(subDays(new Date(), 1));

    // Check if there's a session today or yesterday to start current streak
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      let checkDate = new Date();
      
      // Start from today and go backwards
      while (true) {
        const dateString = dateUtils.formatDate(checkDate);
        if (uniqueDates.includes(dateString)) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = parseISO(uniqueDates[i - 1]);
        const currentDate = parseISO(uniqueDates[i]);
        const daysDiff = differenceInDays(currentDate, prevDate);
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }
};