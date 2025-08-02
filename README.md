# Enhanced Personal Dashboard & Reading Tracker

A comprehensive personal dashboard application that combines reading tracking, goal management, daily learning logs, and achievement systems. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Functionality
- **Reading Tracker**: Log daily reading sessions across morning, afternoon, and evening time slots
- **GitHub-style Calendar Heatmap**: Visualize your reading consistency with a 365-day heatmap
- **Goal Tracking**: Set and monitor progress on personal and professional goals
- **Daily Learning Logs**: Document your learning journey with resource links and sharing capabilities
- **Achievement System**: Gamified badges and milestones to encourage consistent habits
- **User Profile**: Comprehensive profile management with social media integration

### Enhanced Features
- **Resource Management**: Attach links to LeetCode, CodeChef, GitHub, YouTube, and other learning resources
- **Shareable Logs**: Create public, shareable daily logs with unique URLs
- **Data Visualization**: Interactive charts and analytics for tracking progress
- **Mobile Responsive**: Optimized for all device sizes
- **Dark Theme**: Beautiful glassmorphism UI with blue-violet color scheme

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enhanced-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file:
     ```env
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. **Run database migrations**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/create_dashboard_tables.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### Tables
- **user_profiles**: User information and social media links
- **goals**: Goal tracking with categories, progress, and deadlines
- **daily_logs**: Learning logs with resources and sharing capabilities
- **reading_sessions**: Reading session tracking with time slots
- **achievements**: Gamified achievement system

### Key Features
- Row Level Security (RLS) enabled on all tables
- Public sharing capabilities for daily logs
- Automatic timestamp management
- Optimized indexes for performance

## 🎯 Usage Guide

### Getting Started
1. **Set up your profile**: Add your name, bio, and social media links
2. **Create your first goal**: Set targets for coding, learning, or personal projects
3. **Log daily activities**: Document your learning with resources and reflections
4. **Track reading sessions**: Log your reading across different time slots
5. **Monitor progress**: View analytics and unlock achievements

### Key Components

#### Goal Tracker
- Create goals with categories (coding, learning, projects, etc.)
- Set target values, deadlines, and priorities
- Track progress with visual indicators
- Mark milestones and completion status

#### Daily Learning Logs
- Document daily learning activities
- Attach resource links (LeetCode, GitHub, YouTube, etc.)
- Add tags and mood tracking
- Share logs publicly with unique URLs

#### Achievement System
- Unlock badges for streaks, time goals, and content milestones
- Different rarity levels (common, rare, epic, legendary)
- Visual progress tracking toward next achievements
- Animated unlock notifications

#### Calendar Heatmap
- GitHub-style visualization of daily activity
- Blue color scheme instead of traditional green
- Hover tooltips with session details
- Current date highlighting
- Responsive design for all screen sizes

## 🎨 Design System

### Color Palette
- **Background**: #121212 (dark-bg)
- **Surfaces**: #1e1e1e (dark-surface)
- **Cards**: #2a2a2a (dark-card)
- **Borders**: #3a3a3a (dark-border)
- **Primary**: #38bdf8 (accent-blue)
- **Secondary**: #7c3aed (accent-violet)

### Typography
- **Primary**: Inter (sans-serif)
- **Monospace**: JetBrains Mono
- **Spacing**: 8px grid system

### Animations
- **Duration**: 200-300ms transitions
- **Easing**: Smooth ease-out curves
- **Hover effects**: Scale and color transitions
- **Loading states**: Skeleton animations

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── BadgeSystem.tsx
│   ├── CalendarHeatmap.tsx
│   ├── CreatorSection.tsx
│   ├── DataVisualization.tsx
│   ├── EnhancedDailyLog.tsx
│   ├── GoalTracker.tsx
│   ├── ReadingTracker.tsx
│   ├── SessionLogger.tsx
│   └── UserProfile.tsx
├── lib/                 # External service integrations
│   └── supabase.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── dateUtils.ts
│   └── storage.ts
└── App.tsx
```

### Key Features Implementation

#### Supabase Integration
- Real-time data synchronization
- Row Level Security for data protection
- Public sharing with controlled access
- Optimized queries with proper indexing

#### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

#### Performance Optimization
- Lazy loading for heavy components
- Efficient state management
- Optimized re-renders
- Proper error boundaries

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Build the project locally
2. Upload the `dist` folder to Netlify
3. Configure environment variables
4. Set up continuous deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Creator

**Saisuman Dash**
- 📧 Email: [saisumandash0@gmail.com](mailto:saisumandash0@gmail.com)
- 🐙 GitHub: [github.com/Saisuman-dash](https://github.com/Saisuman-dash)
- 💼 LinkedIn: [linkedin.com/in/saisuman-dash](https://www.linkedin.com/in/saisuman-dash/)
- 📸 Instagram: [instagram.com/_vava.boss_](https://www.instagram.com/_vava.boss_/)

---

Made with ❤️ for the learning community. Built with React & Supabase.