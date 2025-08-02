import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Instagram, Heart, Coffee } from 'lucide-react';
import { CreatorInfo } from '../types';

const creatorInfo: CreatorInfo = {
  name: 'Saisuman Dash',
  email: 'saisumandash0@gmail.com',
  github: 'https://github.com/Saisuman-dash',
  linkedin: 'https://www.linkedin.com/in/saisuman-dash/',
  instagram: 'https://www.instagram.com/_vava.boss_/',
  bio: 'Passionate developer building tools to help people track their learning journey and achieve their goals.'
};

export const CreatorSection: React.FC = () => {
  const socialLinks = [
    {
      icon: Mail,
      label: 'Email',
      value: creatorInfo.email,
      href: `mailto:${creatorInfo.email}`,
      color: 'text-red-400',
      emoji: '📧'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'github.com/Saisuman-dash',
      href: creatorInfo.github,
      color: 'text-gray-400',
      emoji: '🐙'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'linkedin.com/in/saisuman-dash',
      href: creatorInfo.linkedin,
      color: 'text-blue-400',
      emoji: '💼'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: 'instagram.com/_vava.boss_',
      href: creatorInfo.instagram,
      color: 'text-pink-400',
      emoji: '📸'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-dark-text-primary">About the Creator</h2>
          <Coffee className="w-5 h-5 text-amber-400" />
        </div>
        
        <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-violet rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-2xl font-bold text-white">SD</span>
        </div>
        
        <h3 className="text-lg font-semibold text-dark-text-primary mb-2">
          {creatorInfo.name}
        </h3>
        
        <p className="text-dark-text-secondary text-sm max-w-md mx-auto leading-relaxed">
          {creatorInfo.bio}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-dark-text-primary text-center mb-4">
          Let's Connect! 🚀
        </h4>
        
        {socialLinks.map(({ icon: Icon, label, value, href, color, emoji }, index) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-4 p-4 bg-dark-card hover:bg-dark-border rounded-lg transition-all duration-200 group border border-transparent hover:border-dark-text-secondary/20"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{emoji}</span>
              <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-text-primary group-hover:text-accent-blue transition-colors">
                {label}
              </p>
              <p className="text-xs text-dark-text-secondary truncate group-hover:text-dark-text-primary transition-colors">
                {value}
              </p>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-accent-blue text-sm">→</span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-dark-border text-center">
        <p className="text-xs text-dark-text-muted">
          Made with ❤️ for the learning community
        </p>
        <p className="text-xs text-dark-text-muted mt-1">
          Open source • Built with React & Supabase
        </p>
      </div>
    </motion.div>
  );
};