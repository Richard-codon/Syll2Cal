export interface CalendarEvent {
    id: number;
    title: string;
    date: string; 
    type: 'assignment' | 'exam' | 'reading' | 'deadline' | 'holiday' | 'class' | 'other';
    description?: string;
    rawText: string;
  }
  
  export interface UploadResponse {
    success: boolean;
    events: CalendarEvent[];
    totalFound?: number;
    warning?: string;
    message?: string;
  }
  
  export type ViewMode = 'list' | 'calendar';
  
  export interface EventTypeConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    label: string;
  }
  
  export const EVENT_TYPE_CONFIGS: Record<CalendarEvent['type'], EventTypeConfig> = {
    //High-priority academic events are marked in red
    exam: {
      color: 'text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      icon: '📝', //I included these icons to make the app more lively and catchy
      label: 'Exam'
    },
    //Regular assignments are marked in blue
    assignment: {
      color: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      icon: '📋',
      label: 'Assignment'
    },
    //Reading and assignments are marked in green
    reading: {
      color: 'text-green-800',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      icon: '📚',
      label: 'Reading'
    },
    //Deadlines are marked in yellow
    deadline: {
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      icon: '⏰',
      label: 'Deadline'
    },
    //Holidays are marked in purple
    holiday: {
      color: 'text-purple-800',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      icon: '🎉',
      label: 'Holiday'
    },
    //regular classes sessions are marked in indigo
    class: {
      color: 'text-indigo-800',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      icon: '🎓',
      label: 'Class'
    },
    //uncategorized events are marked in gray
    other: {
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      icon: '📌',
      label: 'Event'
    }
  };