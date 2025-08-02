import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Linkedin, Instagram, Globe, MapPin, Edit3, Save, X } from 'lucide-react';
import { UserProfile as UserProfileType } from '../types';
import { supabaseService } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const profileData = await supabaseService.getUserProfile(userId);
    if (profileData) {
      setProfile(profileData);
      setEditForm(profileData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    const success = await supabaseService.updateUserProfile({
      ...editForm,
      id: userId,
      updatedAt: Date.now(),
    });

    if (success) {
      setProfile(editForm as UserProfileType);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const socialLinks = [
    { icon: Mail, label: 'Email', value: profile?.email, href: `mailto:${profile?.email}` },
    { icon: Github, label: 'GitHub', value: profile?.github, href: profile?.github },
    { icon: Linkedin, label: 'LinkedIn', value: profile?.linkedin, href: profile?.linkedin },
    { icon: Instagram, label: 'Instagram', value: profile?.instagram, href: profile?.instagram },
    { icon: Globe, label: 'Website', value: profile?.website, href: profile?.website },
  ];

  if (loading) {
    return (
      <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 bg-dark-card rounded-full mx-auto"></div>
          <div className="h-4 bg-dark-card rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-dark-card rounded w-1/2 mx-auto"></div>
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
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold text-dark-text-primary">Profile</h2>
        <button
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          className="p-2 text-dark-text-secondary hover:text-accent-blue hover:bg-dark-card rounded-lg transition-colors"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-accent-blue to-accent-violet rounded-full flex items-center justify-center mb-4 mx-auto">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
            />
            <textarea
              placeholder="Bio"
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none resize-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              value={editForm.location || ''}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
            />
            <button
              onClick={handleSave}
              className="w-full bg-accent-blue text-white py-2 rounded-lg font-medium hover:bg-accent-blue/90 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-dark-text-primary">
              {profile?.name || 'Anonymous User'}
            </h3>
            {profile?.bio && (
              <p className="text-dark-text-secondary mt-2 max-w-md mx-auto">
                {profile.bio}
              </p>
            )}
            {profile?.location && (
              <div className="flex items-center justify-center space-x-1 mt-2 text-dark-text-muted">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-3">
          <h4 className="font-medium text-dark-text-primary mb-3">Connect</h4>
          {socialLinks.map(({ icon: Icon, label, value, href }) => {
            if (!value) return null;
            
            return (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-3 bg-dark-card hover:bg-dark-border rounded-lg transition-colors group"
              >
                <Icon className="w-5 h-5 text-accent-blue" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-text-primary">{label}</p>
                  <p className="text-xs text-dark-text-secondary truncate group-hover:text-accent-blue transition-colors">
                    {value}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}

      {isEditing && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium text-dark-text-primary">Social Links</h4>
          <input
            type="url"
            placeholder="GitHub URL"
            value={editForm.github || ''}
            onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={editForm.linkedin || ''}
            onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
          />
          <input
            type="url"
            placeholder="Instagram URL"
            value={editForm.instagram || ''}
            onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
          />
          <input
            type="url"
            placeholder="Website URL"
            value={editForm.website || ''}
            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text-primary focus:border-accent-blue focus:outline-none"
          />
        </div>
      )}
    </motion.div>
  );
};