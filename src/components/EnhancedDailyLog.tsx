import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Code, Link, Share2, ExternalLink, Tag, Clock, Smile } from 'lucide-react';
import { DailyLog, ResourceLink } from '../types';
import { supabaseService } from '../lib/supabase';
import { dateUtils } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface EnhancedDailyLogProps {
  userId: string;
}

const platformIcons = {
  leetcode: '🔢',
  codechef: '👨‍💻',
  github: '🐙',
  youtube: '📺',
  documentation: '📚',
  article: '📄',
  other: '🔗'
};

const categoryColors = {
  coding: 'text-blue-400 bg-blue-400/10',
  learning: 'text-green-400 bg-green-400/10',
  reading: 'text-amber-400 bg-amber-400/10',
  project: 'text-purple-400 bg-purple-400/10',
  other: 'text-gray-400 bg-gray-400/10'
};

const moodEmojis = {
  1: '😞',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🤩'
};

export const EnhancedDailyLog: React.FC<EnhancedDailyLogProps> = ({ userId }) => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'learning' as DailyLog['category'],
    duration: 60,
    mood: 3 as DailyLog['mood'],
    tags: '',
    isPublic: false,
    resources: [] as ResourceLink[]
  });

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    platform: 'other' as ResourceLink['platform'],
    description: ''
  });

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const loadLogs = async () => {
    setLoading(true);
    const logsData = await supabaseService.getDailyLogs(userId, 10);
    setLogs(logsData);
    setLoading(false);
  };

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) {
      toast.error('Please fill in resource title and URL');
      return;
    }

    const resource: ResourceLink = {
      id: uuidv4(),
      ...newResource
    };

    setFormData({
      ...formData,
      resources: [...formData.resources, resource]
    });

    setNewResource({
      title: '',
      url: '',
      platform: 'other',
      description: ''
    });
  };

  const handleRemoveResource = (resourceId: string) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter(r => r.id !== resourceId)
    });
  };

  const handleCreateLog = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description');
      return;
    }

    const shareableUrl = formData.isPublic ? `log-${uuidv4()}` : undefined;

    const newLog: Omit<DailyLog, 'id' | 'createdAt' | 'updatedAt'> = {
      date: dateUtils.formatDate(new Date()),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      duration: formData.duration,
      resources: formData.resources,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      mood: formData.mood,
      achievements: [],
      isPublic: formData.isPublic,
      shareableUrl
    };

    const created = await supabaseService.createDailyLog(newLog);
    if (created) {
      setLogs([created, ...logs]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Daily log created successfully!');
      
      if (formData.isPublic && shareableUrl) {
        toast.success('Shareable link created! You can share your learning with others.');
      }
    } else {
      toast.error('Failed to create daily log');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'learning',
      duration: 60,
      mood: 3,
      tags: '',
      isPublic: false,
      resources: []
    });
  };

  const handleShare = async (log: DailyLog) => {
    if (!log.shareableUrl) return;
    
    const shareUrl = `${window.location.origin}/shared/${log.shareableUrl}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-card rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-dark-card rounded"></div>
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
          <BookOpen className="w-6 h-6 text-accent-blue" />
          <h2 className="text-xl font-bold text-dark-text-primary">Daily Learning Log</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-accent-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
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
            <h3 className="font-semibold text-dark-text-primary mb-4">Today's Learning Entry</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="What did you learn today?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DailyLog['category'] })}
                  className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                >
                  <option value="coding">Coding</option>
                  <option value="learning">Learning</option>
                  <option value="reading">Reading</option>
                  <option value="project">Project</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <textarea
                placeholder="Describe what you learned, challenges faced, insights gained..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">Mood</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: Number(e.target.value) as DailyLog['mood'] })}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                  >
                    <option value={1}>😞 Poor</option>
                    <option value={2}>😐 Fair</option>
                    <option value={3}>🙂 Good</option>
                    <option value={4}>😊 Great</option>
                    <option value={5}>🤩 Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="javascript, react, algorithms"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Resources Section */}
              <div>
                <h4 className="font-medium text-dark-text-primary mb-3">Learning Resources</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Resource title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none text-sm"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none text-sm"
                  />
                  <select
                    value={newResource.platform}
                    onChange={(e) => setNewResource({ ...newResource, platform: e.target.value as ResourceLink['platform'] })}
                    className="px-3 py-2 bg-dark-surface border border-dark-border rounded text-dark-text-primary focus:border-accent-blue focus:outline-none text-sm"
                  >
                    <option value="leetcode">LeetCode</option>
                    <option value="codechef">CodeChef</option>
                    <option value="github">GitHub</option>
                    <option value="youtube">YouTube</option>
                    <option value="documentation">Documentation</option>
                    <option value="article">Article</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={handleAddResource}
                    className="px-3 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>

                {formData.resources.length > 0 && (
                  <div className="space-y-2">
                    {formData.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-dark-surface rounded border border-dark-border">
                        <div className="flex items-center space-x-2">
                          <span>{platformIcons[resource.platform]}</span>
                          <span className="text-sm text-dark-text-primary">{resource.title}</span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-blue hover:text-accent-blue/80"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <button
                          onClick={() => handleRemoveResource(resource.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-dark-border"
                />
                <label htmlFor="isPublic" className="text-sm text-dark-text-secondary">
                  Make this log public and shareable
                </label>
              </div>

              <div className="flex justify-end space-x-2">
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
                  onClick={handleCreateLog}
                  className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
            <p className="text-dark-text-secondary">No learning logs yet. Start documenting your journey!</p>
          </div>
        ) : (
          logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-dark-card rounded-lg border border-dark-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-dark-text-primary">{log.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[log.category]}`}>
                      {log.category}
                    </span>
                    <span className="text-lg">{moodEmojis[log.mood]}</span>
                  </div>
                  <p className="text-sm text-dark-text-secondary mb-3">{log.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-dark-text-muted mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{dateUtils.formatDuration(log.duration)}</span>
                    </div>
                    <span>{dateUtils.formatDisplayDate(log.date)}</span>
                  </div>

                  {log.tags.length > 0 && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Tag className="w-3 h-3 text-dark-text-muted" />
                      <div className="flex flex-wrap gap-1">
                        {log.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-dark-surface text-dark-text-secondary rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.resources.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-dark-text-secondary">Resources:</h4>
                      {log.resources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                        >
                          <span>{platformIcons[resource.platform]}</span>
                          <span>{resource.title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                {log.isPublic && log.shareableUrl && (
                  <button
                    onClick={() => handleShare(log)}
                    className="p-2 text-dark-text-muted hover:text-accent-blue transition-colors"
                    title="Copy share link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};