import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit3, Trash2, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Goal, Milestone } from '../types';
import { supabaseService } from '../lib/supabase';
import { dateUtils } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface GoalTrackerProps {
  userId: string;
}

const categoryColors = {
  coding: 'text-blue-400 bg-blue-400/10',
  learning: 'text-green-400 bg-green-400/10',
  projects: 'text-purple-400 bg-purple-400/10',
  reading: 'text-amber-400 bg-amber-400/10',
  fitness: 'text-red-400 bg-red-400/10',
  other: 'text-gray-400 bg-gray-400/10'
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

export const GoalTracker: React.FC<GoalTrackerProps> = ({ userId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'coding' as Goal['category'],
    targetValue: 0,
    unit: 'hours',
    deadline: '',
    priority: 'medium' as Goal['priority']
  });

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    setLoading(true);
    const goalsData = await supabaseService.getGoals(userId);
    setGoals(goalsData);
    setLoading(false);
  };

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      currentValue: 0,
      status: 'active',
      milestones: []
    };

    const created = await supabaseService.createGoal(newGoal);
    if (created) {
      setGoals([created, ...goals]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Goal created successfully!');
    } else {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = { ...goal, currentValue: newValue };
    if (newValue >= goal.targetValue) {
      updatedGoal.status = 'completed';
    }

    const success = await supabaseService.updateGoal(goalId, updatedGoal);
    if (success) {
      setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
      if (updatedGoal.status === 'completed') {
        toast.success('🎉 Goal completed! Congratulations!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'coding',
      targetValue: 0,
      unit: 'hours',
      deadline: '',
      priority: 'medium'
    });
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-card rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-dark-card rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-accent-blue" />
          <h2 className="text-xl font-bold text-dark-text-primary">Goals</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-accent-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-dark-card rounded-lg border border-dark-border"
          >
            <h3 className="font-semibold text-dark-text-primary mb-4">Create New Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Goal title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
              >
                <option value="coding">Coding</option>
                <option value="learning">Learning</option>
                <option value="projects">Projects</option>
                <option value="reading">Reading</option>
                <option value="fitness">Fitness</option>
                <option value="other">Other</option>
              </select>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Target"
                  value={formData.targetValue || ''}
                  onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-20 px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                />
              </div>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full mt-4 px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none resize-none"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
            <p className="text-dark-text-secondary">No goals yet. Create your first goal to get started!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-dark-card rounded-lg border border-dark-border hover:border-dark-text-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-dark-text-primary">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[goal.category]}`}>
                        {goal.category}
                      </span>
                      {goal.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-dark-text-secondary mb-2">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-dark-text-muted">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      {goal.deadline && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {daysRemaining !== null && daysRemaining >= 0 
                              ? `${daysRemaining} days left`
                              : 'Overdue'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={goal.currentValue}
                      onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                      min="0"
                      max={goal.targetValue}
                    />
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-dark-surface rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-2 rounded-full ${
                        goal.status === 'completed' 
                          ? 'bg-green-400' 
                          : 'bg-gradient-to-r from-accent-blue to-accent-violet'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};