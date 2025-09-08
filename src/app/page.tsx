'use client';

import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { CalendarView } from './components/CalendarView';
import { WelcomeSection } from './components/WelcomeSection';
import type { CalendarEvent } from './types';
import { Analytics } from "@vercel/analytics/next"
export default function Page() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  
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
      <h1 className="text-3xl font-bold text-center mb-6">Syll2Cal</h1>
      <Analytics />
      {error && <p className="text-red-600 text-center">{error}</p>}

      {!showCalendar ? (
        <div>
          <WelcomeSection />
          <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
        </div>
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
