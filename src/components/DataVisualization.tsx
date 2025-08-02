import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Calendar, Filter } from 'lucide-react';
import { ReadingSession, ViewMode } from '../types';
import { dateUtils } from '../utils/dateUtils';
import { format, subDays, subWeeks, subMonths, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface DataVisualizationProps {
  sessions: ReadingSession[];
}

interface ChartData {
  name: string;
  morning: number;
  afternoon: number;
  evening: number;
  total: number;
}

const TimeSlotColors = {
  morning: '#38bdf8',
  afternoon: '#7c3aed', 
  evening: '#f59e0b'
};

export const DataVisualization: React.FC<DataVisualizationProps> = ({ sessions }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const { chartData, pieData, stats } = useMemo(() => {
    const now = new Date();
    let filteredSessions = sessions;

    // Filter sessions based on view mode
    if (viewMode === 'week') {
      const weekAgo = subWeeks(now, 1);
      filteredSessions = sessions.filter(session => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: weekAgo, end: now });
      });
    } else if (viewMode === 'month') {
      const monthAgo = subMonths(now, 1);
      filteredSessions = sessions.filter(session => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: monthAgo, end: now });
      });
    }

    // Generate chart data
    const dataMap = new Map<string, ChartData>();

    if (viewMode === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dateString = dateUtils.formatDate(date);
        const dayName = format(date, 'EEE');
        
        dataMap.set(dateString, {
          name: dayName,
          morning: 0,
          afternoon: 0,
          evening: 0,
          total: 0
        });
      }
    } else if (viewMode === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = subWeeks(now, i + 1);
        const weekEnd = subWeeks(now, i);
        const weekName = `Week ${4 - i}`;
        
        dataMap.set(weekName, {
          name: weekName,
          morning: 0,
          afternoon: 0,
          evening: 0,
          total: 0
        });
      }
    } else {
      // All time - group by month
      const monthsMap = new Map<string, ChartData>();
      
      filteredSessions.forEach(session => {
        const date = parseISO(session.date);
        const monthKey = format(date, 'MMM yyyy');
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            name: monthKey,
            morning: 0,
            afternoon: 0,
            evening: 0,
            total: 0
          });
        }
      });
      
      // Take last 12 months or available months
      const sortedMonths = Array.from(monthsMap.keys()).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      ).slice(-12);
      
      sortedMonths.forEach(month => {
        dataMap.set(month, monthsMap.get(month)!);
      });
    }

    // Fill in the data
    filteredSessions.forEach(session => {
      let key: string;
      
      if (viewMode === 'week') {
        key = session.date;
      } else if (viewMode === 'month') {
        const sessionDate = parseISO(session.date);
        const weeksAgo = Math.floor((now.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = weeksAgo <= 3 ? `Week ${4 - weeksAgo}` : '';
      } else {
        const date = parseISO(session.date);
        key = format(date, 'MMM yyyy');
      }

      const data = dataMap.get(key);
      if (data) {
        data[session.timeSlot] += session.duration;
        data.total += session.duration;
      }
    });

    const chartData = Array.from(dataMap.values());

    // Generate pie chart data for time slot distribution
    const timeSlotTotals = {
      morning: 0,
      afternoon: 0,
      evening: 0
    };

    filteredSessions.forEach(session => {
      timeSlotTotals[session.timeSlot] += session.duration;
    });

    const pieData = [
      { name: 'Morning', value: timeSlotTotals.morning, color: TimeSlotColors.morning },
      { name: 'Afternoon', value: timeSlotTotals.afternoon, color: TimeSlotColors.afternoon },
      { name: 'Evening', value: timeSlotTotals.evening, color: TimeSlotColors.evening },
    ].filter(item => item.value > 0);

    // Calculate stats
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = filteredSessions.length;
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    const stats = {
      totalMinutes,
      totalSessions,
      averageSession,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    };

    return { chartData, pieData, stats };
  }, [sessions, viewMode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-dark-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {dateUtils.formatDuration(entry.value)}
            </p>
          ))}
          <p className="text-sm text-dark-text-secondary mt-1 pt-1 border-t border-dark-border">
            Total: {dateUtils.formatDuration(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-dark-text-primary">{data.name}</p>
          <p className="text-sm text-dark-text-secondary">
            {dateUtils.formatDuration(data.value)} ({Math.round(data.value / stats.totalMinutes * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-accent-blue" />
            <h4 className="font-medium text-dark-text-primary">Total Sessions</h4>
          </div>
          <p className="text-2xl font-bold text-dark-text-primary mt-2">{stats.totalSessions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-accent-violet" />
            <h4 className="font-medium text-dark-text-primary">Total Time</h4>
          </div>
          <p className="text-2xl font-bold text-dark-text-primary mt-2">{stats.totalHours}h</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-accent-success" />
            <h4 className="font-medium text-dark-text-primary">Avg Session</h4>
          </div>
          <p className="text-2xl font-bold text-dark-text-primary mt-2">
            {dateUtils.formatDuration(stats.averageSession)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-accent-warning" />
            <h4 className="font-medium text-dark-text-primary">View</h4>
          </div>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="mt-2 w-full bg-dark-card border border-dark-border rounded text-dark-text-primary text-sm px-2 py-1 focus:border-accent-blue focus:outline-none"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="all">All Time</option>
          </select>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-dark-text-primary mb-4">
            Reading Sessions by Time Slot
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#a0a0a0" 
                  fontSize={12}
                  tick={{ fill: '#a0a0a0' }}
                />
                <YAxis 
                  stroke="#a0a0a0" 
                  fontSize={12}
                  tick={{ fill: '#a0a0a0' }}
                  tickFormatter={(value) => `${Math.round(value / 60)}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="morning" 
                  stackId="a" 
                  fill={TimeSlotColors.morning}
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="afternoon" 
                  stackId="a" 
                  fill={TimeSlotColors.afternoon}
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="evening" 
                  stackId="a" 
                  fill={TimeSlotColors.evening}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-dark-text-primary mb-4">
              Time Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-dark-text-primary">{entry.name}</span>
                  </div>
                  <span className="text-dark-text-secondary">
                    {dateUtils.formatDuration(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};