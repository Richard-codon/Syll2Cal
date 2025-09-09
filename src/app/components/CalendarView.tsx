import React, { useState } from 'react';
import type { CalendarEvent, ViewMode } from '../types';
import { EVENT_TYPE_CONFIGS } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
}

//component to display calendar view and list view of events
export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

//sort events by date for consistent display
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

//generate statistics for event types
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  //function to export event to google calendar
  /* const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
      `/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
      `&details=${encodeURIComponent(event.description || event.rawText)}`;
    
    window.open(googleUrl, '_blank');
  };

  //Export all events to google calendar with slight delay to avoid popup blockers
  const exportAllToGoogleCalendar = () => {
    events.forEach((event, index) => {
      setTimeout(() => exportToGoogleCalendar(event), index * 100);
    });
  };
 */
  const exportEventsAsICS = (events: CalendarEvent[]) => {
    const pad = (num: number) => String(num).padStart(2, '0');
  
    const formatDate = (date: Date) => {
      return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
    };
  
    const icsEvents = events.map(event => {
      const start = formatDate(new Date(event.date));
      const end = formatDate(new Date(new Date(event.date).getTime() + 60 * 60 * 1000)); // 1 hour duration
  
      return `BEGIN:VEVENT
  SUMMARY:${event.title}
  DESCRIPTION:${event.description || event.rawText}
  DTSTART:${start}
  DTEND:${end}
  END:VEVENT`;
    }).join('\n');
  
    const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//YourApp//EN
  ${icsEvents}
  END:VCALENDAR`;
  
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  //main render function
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Syllabus Calendar</h2>
            <p className="text-blue-100">
              Found {events.length} event{events.length !== 1 ? 's' : ''} in your syllabus
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                📅 Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(EVENT_TYPE_CONFIGS).map(([type, config]) => {
            const count = eventsByType[type] || 0;
            if (count === 0) return null;
            
            return (
              <div key={type} className="bg-white/20 rounded-lg px-3 py-2 text-center">
                <div className="text-lg">{config.icon}</div>
                <div className="text-sm font-medium">{count}</div>
                <div className="text-xs opacity-80">{config.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Calendar Export */}
      <div className="border-b border-gray-200 px-8 py-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">
            Export your events to Google Calendar for easy access
          </p>
          <button
            onClick={() => exportEventsAsICS(events)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export All to Google Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {viewMode === 'list' ? (
          <ListView events={sortedEvents} onExportEvent={(event) => exportEventsAsICS([event])} />
        ) : (
          <CalendarGrid events={sortedEvents} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        )}
      </div>
    </div>
  );
};

// List View Component
const ListView: React.FC<{ 
  events: CalendarEvent[]; 
  onExportEvent: (event: CalendarEvent) => void; 
}> = ({ events, onExportEvent }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <p className="text-gray-500 text-lg">No events found in your syllabus</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const config = EVENT_TYPE_CONFIGS[event.type];
        const dateObj = new Date(event.date);
        const isUpcoming = dateObj > new Date();
        const isPastDue = dateObj < new Date() && event.type === 'assignment';
        
        return (
          <div
            key={event.id}
            className={`
              p-6 border-l-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200
              ${config.bgColor} ${config.borderColor}
              ${isPastDue ? 'opacity-75' : ''}
              ${isUpcoming ? 'ring-2 ring-blue-200' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className={`font-bold text-lg ${config.color}`}>
                      {event.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} border`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      {dateObj.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {isUpcoming && (
                    <span className="text-blue-600 font-medium">
                      {Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  )}
                  
                  {isPastDue && (
                    <span className="text-red-600 font-medium">Past Due</span>
                  )}
                </div>

                {event.description && event.description !== event.title && (
                  <p className="text-gray-600 text-sm bg-white/50 p-3 rounded-lg">
                    {event.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => onExportEvent(event)}
                className="ml-4 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                title="Add to Google Calendar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Calendar Grid Component
const CalendarGrid: React.FC<{ 
  events: CalendarEvent[]; 
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}> = ({ events, selectedMonth, setSelectedMonth }) => {
  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());

  const days = [];
  const current = new Date(calendarStart);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = new Date(event.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-2xl font-bold text-gray-800">
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = eventsByDate[day.toDateString()] || [];
          
          return (
            <div
              key={index}
              className={`
                min-h-24 p-2 border rounded-lg
                ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                ${isToday ? 'ring-2 ring-blue-300 bg-blue-50' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const config = EVENT_TYPE_CONFIGS[event.type];
                  return (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded ${config.bgColor} ${config.color} border-l-2 ${config.borderColor} truncate`}
                      title={event.title}
                    >
                      {config.icon} {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};