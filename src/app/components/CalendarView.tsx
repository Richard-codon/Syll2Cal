import React, { useState } from 'react';
import type { CalendarEvent, ViewMode } from '../types';
import { EVENT_TYPE_CONFIGS } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('my-syllabus-calendar.ics');

  // sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // statistics for event types
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // function to export events as .ics
  const exportEventsAsICS = (eventsToExport: CalendarEvent[], fileName = 'my-syllabus-calendar.ics') => {

    
const formatDateForAllday = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// In the event mapping:
const icsEvents = eventsToExport
  .map((event) => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // All-day events end next day

    return `BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.rawText || ''}
DTSTART;VALUE=DATE:${formatDateForAllday(startDate)}
DTEND;VALUE=DATE:${formatDateForAllday(endDate)}
END:VEVENT`;
  })
  .join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Syll2Cal//EN
CALSCALE:GREGORIAN
${icsEvents}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportFileName(fileName);
    setShowModal(true);
  };

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
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white/20'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white/20'
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

      {/* Export All Button */}
      <div className="border-b border-gray-200 px-8 py-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">Export your events to your calendar for easy access</p>
          <button
            onClick={() => exportEventsAsICS(events)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            📥 Export All Events
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {viewMode === 'list' ? (
          <ListView events={sortedEvents} onExportEvent={exportEventsAsICS} />
        ) : (
          <CalendarGrid events={sortedEvents} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        )}
      </div>

      {/* Modal Instructions */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-center">📆 Import Your Calendar</h2>
            <p className="text-gray-700 mb-6 text-center">
              Your <code>{exportFileName}</code> has been downloaded. Follow the instructions below to add it to your preferred calendar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Apple */}
               <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-2"></div>
                <h3 className="font-semibold mb-1">Apple Calendar</h3>
                <p className="text-xs text-gray-500 text-center">
                  Open the downloaded <code>my-syllabus-calendar.ics</code> file on your Mac. It will automatically import into Apple Calendar.
                </p>
              </div>


              {/* Google */}
              <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold mb-1">Google Calendar</h3>
                <div className="text-xs text-gray-500 text-left mb-2 space-y-1">
                  <p>1. Make sure you’ve downloaded <code>my-syllabus-calendar.ics</code>.</p>
                  <p>2. Click the button below to open Google Calendar’s Import page.</p>
                  <p>3. On that page, choose your downloaded file and import it safely.</p>
                </div>
                <a
                  href="https://calendar.google.com/calendar/u/0/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors"
                >
                  Open Google Calendar Import
                </a>
              </div>

              {/* Outlook */}
              <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-2">📧</div>
                <h3 className="font-semibold mb-1">Outlook</h3>
                <p className="text-xs text-gray-500 text-center">
                  Open Outlook → File → Open & Export → Import/Export → Import an iCalendar (.ics) file.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 font-bold text-lg"
            >
              ×
            </button>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ListView component
const ListView: React.FC<{ events: CalendarEvent[]; onExportEvent: (events: CalendarEvent[], fileName?: string) => void }> =
  ({ events, onExportEvent }) => {
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
                p-6 border-l-4 rounded-xl shadow-md hover:shadow-lg transition-all
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
                      <h3 className={`font-bold text-lg ${config.color}`}>{event.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} border`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">
                        {dateObj.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {isUpcoming && (
                      <span className="text-blue-600 font-medium">
                        {Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    )}

                    {isPastDue && <span className="text-red-600 font-medium">Past Due</span>}
                  </div>

                  {event.description && event.description !== event.title && (
                    <p className="text-gray-600 text-sm bg-white/50 p-3 rounded-lg">{event.description}</p>
                  )}
                </div>

                {/* Export Single Event */}
                <button
                  onClick={() => onExportEvent([event], `${event.title.replace(/\s+/g, '_')}.ics`)}
                  className="ml-4 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  title="Export Event"
                >
                  📥
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

// CalendarGrid component remains the same as before
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
          ◀
        </button>
        <h3 className="text-2xl font-bold text-gray-800">
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ▶
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = eventsByDate[day.toDateString()] || [];

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border rounded-lg ${
                isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
              } ${isToday ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.map((event) => {
                  const config = EVENT_TYPE_CONFIGS[event.type];
                  return (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded-md truncate ${config.bgColor} ${config.color}`}
                      title={event.title}
                    >
                      {config.icon} {event.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
