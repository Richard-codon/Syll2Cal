'use client';

import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { CalendarView } from './components/CalendarView';
import type { CalendarEvent } from './types';

export default function Page() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Remove frontend parser; just use backend events
  const handleUploadSuccess = (backendResponse: { success: boolean; events: CalendarEvent[] }) => {
    if (backendResponse.success) {
      setEvents(backendResponse.events);
      setShowCalendar(true);
      setError('');
    } else {
      setError('Failed to extract events from syllabus');
      setShowCalendar(false);
    }
  };

  const handleUploadError = (msg: string) => {
    setError(msg);
    setShowCalendar(false);
  };

  const reset = () => {
    setEvents([]);
    setShowCalendar(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Syllabus Calendar</h1>

      {error && <p className="text-red-600 text-center">{error}</p>}

      {!showCalendar ? (
        <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
      ) : (
        <>
          <button onClick={reset} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
            Upload Another Syllabus
          </button>
          <CalendarView events={events} />
        </>
      )}
    </div>
  );
}
