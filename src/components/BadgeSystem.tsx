import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Flame, Clock, BookOpen, Star, Trophy, Target } from 'lucide-react';
import { Badge, ReadingSession, UserStats } from '../types';
import { storageUtils } from '../utils/storage';
import { dateUtils } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface BadgeSystemProps {
  sessions: ReadingSession[];
  stats: UserStats;
}

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  // Streak badges
  { id: 'streak-3', name: 'Getting Started', description: '3-day reading streak', icon: 'flame', type: 'streak', requirement: 3 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day reading streak', icon: 'flame', type: 'streak', requirement: 7 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day reading streak', icon: 'flame', type: 'streak', requirement: 30 },
  { id: 'streak-100', name: 'Century Club', description: '100-day reading streak', icon: 'trophy', type: 'streak', requirement: 100 },
  
  // Time-based badges (weekly goals in minutes)
  { id: 'time-300', name: 'Dedicated Reader', description: '5 hours in a week', icon: 'clock', type: 'time', requirement: 300 },
  { id: 'time-600', name: 'Bookworm', description: '10 hours in a week', icon: 'clock', type: 'time', requirement: 600 },
  { id: 'time-900', name: 'Reading Machine', description: '15 hours in a week', icon: 'star', type: 'time', requirement: 900 },
  { id: 'time-1200', name: 'Literary Legend', description: '20 hours in a week', icon: 'trophy', type: 'time', requirement: 1200 },
  
  // Content-based badges (total sessions)
  { id: 'sessions-10', name: 'First Steps', description: '10 reading sessions', icon: 'book-open', type: 'content', requirement: 10 },
  { id: 'sessions-50', name: 'Consistent Reader', description: '50 reading sessions', icon: 'book-open', type: 'content', requirement: 50 },
  { id: 'sessions-100', name: 'Century Reader', description: '100 reading sessions', icon: 'award', type: 'content', requirement: 100 },
  { id: 'sessions-250', name: 'Reading Expert', description: '250 reading sessions', icon: 'trophy', type: 'content', requirement: 250 },
];

const BadgeIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const iconMap = {
    flame: Flame,
    clock: Clock,
    'book-open': BookOpen,
    star: Star,
    trophy: Trophy,
    award: Award,
    target: Target,
  };
  
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Award;
  return <IconComponent className={className} />;
};

const BadgeCard = ({ badge, isNew, stats }: { badge: Badge; isNew?: boolean; stats: UserStats }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        badge.unlocked
          ? 'border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/20'
          : 'border-dark-border bg-dark-surface/50'
      }`}
    >
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-accent-success text-white text-xs px-2 py-1 rounded-full font-medium"
        >
          NEW!
        </motion.div>
      )}
      
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${
          badge.unlocked 
            ? 'bg-accent-blue/20 text-accent-blue' 
            : 'bg-dark-card text-dark-text-muted'
        }`}>
          <BadgeIcon icon={badge.icon} className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate ${
            badge.unlocked ? 'text-dark-text-primary' : 'text-dark-text-muted'
          }`}>
            {badge.name}
          </h4>
          <p className={`text-sm ${
            badge.unlocked ? 'text-dark-text-secondary' : 'text-dark-text-muted'
          }`}>
            {badge.description}
          </p>
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-accent-blue mt-1">
              Unlocked {dateUtils.formatDisplayDate(new Date(badge.unlockedAt))}
            </p>
          )}
        </div>
      </div>
      
      {!badge.unlocked && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-dark-text-muted mb-1">
            <span>Progress</span>
            <span>{badge.type === 'streak' ? stats.currentStreak : 
                   badge.type === 'time' ? Math.min(stats.minutesThisWeek, badge.requirement) : 
                   Math.min(stats.totalSessions, badge.requirement)} / {badge.requirement}</span>
          </div>
          <div className="w-full bg-dark-card rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (
                  (badge.type === 'streak' ? stats.currentStreak : 
                   badge.type === 'time' ? stats.minutesThisWeek : 
                   stats.totalSessions) / badge.requirement
                ) * 100)}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-accent-blue to-accent-violet h-2 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const BadgeNotification = ({ badge, onClose }: { badge: Badge; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="fixed top-4 right-4 z-50 bg-dark-surface border-2 border-accent-blue rounded-xl p-4 shadow-2xl shadow-accent-blue/20 max-w-sm"
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-3 bg-accent-blue/20 text-accent-blue rounded-lg"
        >
          <BadgeIcon icon={badge.icon} className="w-6 h-6" />
        </motion.div>
        
        <div>
          <h4 className="font-bold text-dark-text-primary">Badge Unlocked!</h4>
          <p className="text-sm font-medium text-accent-blue">{badge.name}</p>
          <p className="text-xs text-dark-text-secondary">{badge.description}</p>
        </div>
        
        <button
          onClick={onClose}
          className="text-dark-text-muted hover:text-dark-text-primary transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ sessions, stats }) => {
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNotification, setShowNotification] = useState<Badge | null>(null);

  const badges = useMemo(() => {
    const existingBadges = storageUtils.loadBadges();
    const badgeMap = new Map(existingBadges.map(b => [b.id, b]));
    
    const updatedBadges: Badge[] = BADGE_DEFINITIONS.map(badgeDef => {
      const existing = badgeMap.get(badgeDef.id);
      let isUnlocked = false;
      
      // Check if badge should be unlocked
      switch (badgeDef.type) {
        case 'streak':
          isUnlocked = stats.currentStreak >= badgeDef.requirement;
          break;
        case 'time':
          isUnlocked = stats.minutesThisWeek >= badgeDef.requirement;
          break;
        case 'content':
          isUnlocked = stats.totalSessions >= badgeDef.requirement;
          break;
      }
      
      // If newly unlocked, mark it
      if (isUnlocked && (!existing || !existing.unlocked)) {
        const newBadge: Badge = {
          ...badgeDef,
          unlocked: true,
          unlockedAt: Date.now(),
        };
        setNewBadges(prev => {
          if (!prev.find(b => b.id === newBadge.id)) {
            return [...prev, newBadge];
          }
          return prev;
        });
        return newBadge;
      }
      
      return existing || {
        ...badgeDef,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? Date.now() : undefined,
      };
    });
    
    // Save updated badges
    storageUtils.saveBadges(updatedBadges);
    return updatedBadges;
  }, [sessions, stats]);

  // Show notification for new badges
  useEffect(() => {
    if (newBadges.length > 0) {
      const badge = newBadges[0];
      setShowNotification(badge);
      
      // Show toast notification
      toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
        duration: 4000,
        style: {
          background: '#1e1e1e',
          color: '#ffffff',
          border: '1px solid #38bdf8',
        },
      });
      
      // Remove from new badges after showing
      setNewBadges(prev => prev.slice(1));
    }
  }, [newBadges]);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showNotification && (
          <BadgeNotification
            badge={showNotification}
            onClose={() => setShowNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark-text-primary">Achievements</h3>
          <p className="text-dark-text-secondary">
            {unlockedBadges.length} of {badges.length} badges unlocked
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-accent-blue">{unlockedBadges.length}</div>
          <div className="text-sm text-dark-text-secondary">Badges Earned</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-dark-surface/50 rounded-xl p-4">
        <div className="flex justify-between text-sm text-dark-text-secondary mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((unlockedBadges.length / badges.length) * 100)}%</span>
        </div>
        <div className="w-full bg-dark-card rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-accent-blue to-accent-violet h-3 rounded-full"
          />
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-dark-text-primary mb-4">
            Unlocked Badges ({unlockedBadges.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isNew={newBadges.some(nb => nb.id === badge.id)}
                stats={stats}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-dark-text-primary mb-4">
            Available Badges ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} stats={stats} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};