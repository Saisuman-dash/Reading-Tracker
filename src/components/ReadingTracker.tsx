import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, TrendingUp, Calendar, Search, Download, Filter, Target, User, Heart } from 'lucide-react';
import { ReadingSession, UserStats } from '../types';
import { storageUtils } from '../utils/storage';
import { dateUtils } from '../utils/dateUtils';
import { SessionLogger } from './SessionLogger';
import { CalendarHeatmap } from './CalendarHeatmap';
import { DataVisualization } from './DataVisualization';
import { BadgeSystem } from './BadgeSystem';
import { UserProfile } from './UserProfile';
import { CreatorSection } from './CreatorSection';
import { GoalTracker } from './GoalTracker';
import { EnhancedDailyLog } from './EnhancedDailyLog';
import toast, { Toaster } from 'react-hot-toast';

export const ReadingTracker: React.FC = () => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionDuration: 0,
    sessionsThisWeek: 0,
    sessionsThisMonth: 0,
    minutesThisWeek: 0,
    minutesThisMonth: 0,
  });
  const [showSessionLogger, setShowSessionLogger] = useState(false);
  const [editSession, setEditSession] = useState<ReadingSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'stats' | 'badges' | 'profile' | 'goals' | 'logs' | 'creator'>('overview');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSessions = storageUtils.loadSessions();
    setSessions(savedSessions);
    setStats(dateUtils.calculateStats(savedSessions));
  };

  const handleSessionAdded = () => {
    loadData();
    setEditSession(null);
  };

  const handleEditSession = (session: ReadingSession) => {
    setEditSession(session);
    setShowSessionLogger(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      storageUtils.deleteSession(sessionId);
      loadData();
      toast.success('Session deleted successfully');
    }
  };

  const handleExportData = () => {
    try {
      const data = storageUtils.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reading-tracker-export-${dateUtils.formatDate(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const heatmapData = dateUtils.generateHeatmapData(sessions);

  const StatCard = ({ title, value, icon: Icon, description, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    color?: 'blue' | 'violet' | 'success' | 'warning';
  }) => {
    const colorClasses = {
      blue: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
      violet: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20',
      success: 'text-accent-success bg-accent-success/10 border-accent-success/20',
      warning: 'text-accent-warning bg-accent-warning/10 border-accent-warning/20',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-dark-text-primary mt-1">{value}</p>
            {description && (
              <p className="text-xs text-dark-text-muted mt-1">{description}</p>
            )}
          </div>
          <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[0]}`} />
        </div>
      </motion.div>
    );
  };

  const RecentSessionCard = ({ session }: { session: ReadingSession }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 sm:p-4 bg-dark-surface/50 border border-dark-border rounded-lg hover:border-dark-text-secondary/30 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              session.timeSlot === 'morning' ? 'bg-accent-blue/20 text-accent-blue' :
              session.timeSlot === 'afternoon' ? 'bg-accent-violet/20 text-accent-violet' :
              'bg-accent-warning/20 text-accent-warning'
            }`}>
              {session.timeSlot}
            </span>
            <span className="text-xs text-dark-text-muted">
              {dateUtils.formatDisplayDate(session.date)}
            </span>
          </div>
          
          <h4 className="font-medium text-dark-text-primary truncate mb-1 text-sm sm:text-base">
            {session.content}
          </h4>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-dark-text-secondary space-y-1 sm:space-y-0">
            <span>{dateUtils.formatTime(session.startTime)} - {dateUtils.formatTime(session.endTime)}</span>
            <span className="font-medium">{dateUtils.formatDuration(session.duration)}</span>
          </div>
          
          {session.notes && (
            <p className="text-xs sm:text-sm text-dark-text-muted mt-2 line-clamp-2 sm:truncate">
              {session.notes}
            </p>
          )}
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
          <button
            onClick={() => handleEditSession(session)}
            className="p-1 sm:p-2 text-dark-text-muted hover:text-accent-blue transition-colors text-sm"
            title="Edit session"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDeleteSession(session.id)}
            className="p-1 sm:p-2 text-dark-text-muted hover:text-accent-error transition-colors text-sm"
            title="Delete session"
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-dark-surface/50 backdrop-blur-xl border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-accent-blue" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dark-text-primary">ReadingFlow</h1>
                <p className="text-xs sm:text-sm text-dark-text-secondary">Track your reading journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleExportData}
                className="p-2 text-dark-text-secondary hover:text-accent-blue hover:bg-dark-card rounded-lg transition-colors flex-shrink-0"
                title="Export data"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <motion.button
                onClick={() => setShowSessionLogger(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-accent-blue text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Log Session</span>
              </motion.button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 sm:gap-2 pb-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'stats', label: 'Analytics', icon: Filter },
              { id: 'badges', label: 'Achievements', icon: BookOpen },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'logs', label: 'Daily Logs', icon: Plus },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'creator', label: 'Creator', icon: Heart },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === tab.id
                    ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card whitespace-nowrap'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Current Streak"
                  value={`${stats.currentStreak} days`}
                  icon={TrendingUp}
                  description={`Longest: ${stats.longestStreak} days`}
                  color="blue"
                />
                <StatCard
                  title="Total Sessions"
                  value={stats.totalSessions}
                  icon={BookOpen}
                  description={`${stats.sessionsThisWeek} this week`}
                  color="violet"
                />
                <StatCard
                  title="Total Reading Time"
                  value={dateUtils.formatDuration(stats.totalMinutes)}
                  icon={Calendar}
                  description={`${dateUtils.formatDuration(stats.minutesThisWeek)} this week`}
                  color="success"
                />
                <StatCard
                  title="Average Session"
                  value={dateUtils.formatDuration(stats.averageSessionDuration)}
                  icon={Filter}
                  description="Per session"
                  color="warning"
                />
              </div>

              {/* Search Bar */}
              <div className="relative max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-dark-text-primary placeholder-dark-text-muted"
                />
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-dark-text-primary mb-4">
                  Recent Sessions ({filteredSessions.length})
                </h3>
                {filteredSessions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSessions.slice(0, 10).map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <RecentSessionCard session={session} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                    <p className="text-dark-text-secondary">
                      {searchTerm ? 'No sessions match your search' : 'No reading sessions yet'}
                    </p>
                    <button
                      onClick={() => setShowSessionLogger(true)}
                      className="mt-4 text-accent-blue hover:text-accent-blue/80 font-medium"
                    >
                      Log your first session →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CalendarHeatmap data={heatmapData} />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DataVisualization sessions={sessions} />
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BadgeSystem sessions={sessions} stats={stats} />
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GoalTracker userId="user-1" />
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EnhancedDailyLog userId="user-1" />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserProfile userId="user-1" />
            </motion.div>
          )}

          {activeTab === 'creator' && (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CreatorSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session Logger Modal */}
      <AnimatePresence>
        {showSessionLogger && (
          <SessionLogger
            isOpen={showSessionLogger}
            onClose={() => {
              setShowSessionLogger(false);
              setEditSession(null);
            }}
            onSessionAdded={handleSessionAdded}
            editSession={editSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
};