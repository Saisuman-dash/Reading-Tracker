import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Save, X } from 'lucide-react';
import { ReadingSession, TimeSlot } from '../types';
import { dateUtils } from '../utils/dateUtils';
import { storageUtils } from '../utils/storage';
import toast from 'react-hot-toast';

interface SessionLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded: () => void;
  editSession?: ReadingSession | null;
}

const TimeSlotCard = ({ 
  slot, 
  selected, 
  onClick 
}: { 
  slot: TimeSlot; 
  selected: boolean; 
  onClick: () => void;
}) => {
  const slotInfo = {
    morning: { label: 'Morning', time: '06:00 - 12:00', icon: '🌅' },
    afternoon: { label: 'Afternoon', time: '12:00 - 18:00', icon: '☀️' },
    evening: { label: 'Evening', time: '18:00 - 23:59', icon: '🌙' },
  };

  const info = slotInfo[slot];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full ${
        selected
          ? 'border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/20'
          : 'border-dark-border bg-dark-surface hover:border-dark-text-secondary'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <h3 className="font-medium text-dark-text-primary">{info.label}</h3>
          <p className="text-sm text-dark-text-secondary">{info.time}</p>
        </div>
      </div>
    </motion.button>
  );
};

export const SessionLogger: React.FC<SessionLoggerProps> = ({
  isOpen,
  onClose,
  onSessionAdded,
  editSession
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>(
    editSession?.timeSlot || 'morning'
  );
  const [startTime, setStartTime] = useState(editSession?.startTime || '09:00');
  const [endTime, setEndTime] = useState(editSession?.endTime || '10:00');
  const [content, setContent] = useState(editSession?.content || '');
  const [notes, setNotes] = useState(editSession?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const duration = startTime && endTime ? dateUtils.calculateDuration(startTime, endTime) : 0;
  const isValidForm = content.trim() && startTime && endTime && duration > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidForm) {
      toast.error('Please fill in all required fields with valid times');
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionData: ReadingSession = {
        id: editSession?.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: editSession?.date || dateUtils.formatDate(new Date()),
        timeSlot: selectedTimeSlot,
        startTime,
        endTime,
        duration,
        content: content.trim(),
        notes: notes.trim() || undefined,
        createdAt: editSession?.createdAt || Date.now(),
      };

      if (editSession) {
        storageUtils.updateSession(editSession.id, sessionData);
        toast.success('Session updated successfully!');
      } else {
        storageUtils.addSession(sessionData);
        toast.success(`Reading session logged! ${dateUtils.formatDuration(duration)} added to your streak.`);
      }

      onSessionAdded();
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTimeSlot('morning');
    setStartTime('09:00');
    setEndTime('10:00');
    setContent('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-surface/90 backdrop-blur-xl border border-dark-border rounded-xl shadow-2xl"
      >
        <div className="p-4 sm:p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-dark-text-primary flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-accent-blue" />
              <span>{editSession ? 'Edit Reading Session' : 'Log Reading Session'}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-dark-text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-3">
              Time Slot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['morning', 'afternoon', 'evening'] as TimeSlot[]).map((slot) => (
                <TimeSlotCard
                  key={slot}
                  slot={slot}
                  selected={selectedTimeSlot === slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                />
              ))}
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-dark-text-primary mb-2">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-dark-text-primary font-mono text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-dark-text-primary mb-2">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-dark-text-primary font-mono text-sm sm:text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 sm:p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg"
            >
              <p className="text-accent-blue font-medium text-sm sm:text-base">
                Duration: {dateUtils.formatDuration(duration)}
              </p>
            </motion.div>
          )}

          {/* Content Input */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-dark-text-primary mb-2">
              What did you read? *
            </label>
            <input
              type="text"
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Book title, pages read, article name..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-dark-text-primary placeholder-dark-text-muted text-sm sm:text-base"
              required
            />
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-dark-text-primary mb-2">
              Notes & Reflections (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key insights, thoughts, or reflections..."
              rows={2}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-card border border-dark-border rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-dark-text-primary placeholder-dark-text-muted resize-none text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={!isValidForm || isSubmitting}
              whileHover={{ scale: isValidForm ? 1.02 : 1 }}
              whileTap={{ scale: isValidForm ? 0.98 : 1 }}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 text-sm sm:text-base ${
                isValidForm
                  ? 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20'
                  : 'bg-dark-card text-dark-text-muted cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editSession ? 'Update Session' : 'Save Session'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};