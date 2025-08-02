import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeatmapData } from '../types';
import { dateUtils } from '../utils/dateUtils';
import { format, parseISO, getDay, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

interface CalendarHeatmapProps {
  data: HeatmapData[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [], monthLabels: [] };
    }

    // Create a map for quick data lookup
    const dataMap = new Map(data.map(d => [d.date, d]));
    
    // Get the date range (last 365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    
    // Generate all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    const weeks: HeatmapData[][] = [];
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let currentWeek: HeatmapData[] = [];
    let lastMonth = -1;
    
    // Find the first Sunday to start the calendar
    const firstDay = allDays[0];
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstDay.getDate() - getDay(firstDay));
    
    // Generate weeks starting from the first Sunday
    let currentDate = new Date(firstSunday);
    const lastDate = new Date(endDate);
    lastDate.setDate(lastDate.getDate() + (6 - getDay(lastDate))); // Extend to Saturday
    
    while (currentDate <= lastDate) {
      const dateString = dateUtils.formatDate(currentDate);
      const dayOfWeek = getDay(currentDate);
      const month = currentDate.getMonth();
      
      // Add month label at the start of each month
      if (month !== lastMonth && dayOfWeek === 0) {
        monthLabels.push({
          month: MONTHS[month],
          weekIndex: weeks.length
        });
        lastMonth = month;
      }
      
      // Get data for this date or create empty entry
      const dayData = dataMap.get(dateString) || {
        date: dateString,
        count: 0,
        level: 0 as const
      };
      
      currentWeek.push(dayData);
      
      // Complete week on Saturday
      if (dayOfWeek === 6) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add any remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, monthLabels };
  }, [data]);

  const getLevelColor = (level: number): string => {
    const colors = {
      0: '#1e1e1e',
      1: '#1e3a8a30',
      2: '#1e3a8a50', 
      3: '#1e3a8a70',
      4: '#1e3a8a90',
      5: '#1e3a8a'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const isToday = (dateString: string): boolean => {
    const today = dateUtils.formatDate(new Date());
    return dateString === today;
  };

  return (
    <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-dark-text-primary mb-2">
          Reading Activity
        </h3>
        <p className="text-sm sm:text-base text-dark-text-secondary">
          Your reading sessions over the past year
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month labels */}
          <div className="flex mb-3">
            <div className="w-6 sm:w-8"></div> {/* Space for day labels */}
            <div className="flex-1 relative">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute text-xs sm:text-sm text-dark-text-secondary font-medium"
                  style={{ left: `${(label.weekIndex * 14)}px` }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            {/* Day of week labels */}
            <div className="flex flex-col mr-2 sm:mr-3">
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={`h-3 sm:h-4 flex items-center justify-center text-xs sm:text-sm text-dark-text-secondary font-medium mb-1 ${
                    index % 2 === 0 ? '' : 'opacity-0'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex space-x-1 sm:space-x-1.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-1">
                  {weeks[weekIndex].map((day, dayIndex) => (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: weekIndex * 0.005 }}
                      whileHover={{ scale: 1.3 }}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full cursor-pointer relative group transition-all duration-200 ${
                        isToday(day.date) ? 'ring-2 ring-accent-blue ring-offset-1 ring-offset-dark-bg' : ''
                      }`}
                      style={{ backgroundColor: getLevelColor(day.level) }}
                      title={`${dateUtils.formatDisplayDate(day.date)}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs sm:text-sm text-dark-text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="font-medium">{dateUtils.formatDisplayDate(day.date)}</div>
                        <div className="text-dark-text-secondary">
                          {day.count} session{day.count !== 1 ? 's' : ''}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-border"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 text-xs sm:text-sm text-dark-text-secondary">
        <span>Less</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-dark-text-muted mr-2">Activity level:</span>
          <div className="flex space-x-1">
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-dark-border/30"
              style={{ backgroundColor: getLevelColor(level) }}
              title={`Level ${level}`}
            />
          ))}
          </div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};