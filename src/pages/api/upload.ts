import type { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false, // Required to handle raw file uploads
  },
};

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'assignment' | 'exam' | 'reading' | 'deadline' | 'holiday' | 'class' | 'other';
  description?: string;
  rawText: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded or file is empty' 
      });
    }

    const data = await pdf(buffer);
    const events = parsePdfToEvents(data.text);

    if (events.length === 0) {
      return res.status(200).json({ 
        success: true, 
        events: [], 
        warning: 'No dates found in syllabus. The document may not contain recognizable date formats.' 
      });
    }

    res.status(200).json({ success: true, events, totalFound: events.length });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process PDF. Please try again.',
    });
  }
}

function parsePdfToEvents(text: string): CalendarEvent[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // Comprehensive date patterns
  const datePatterns = [
    // Full month names: "January 15, 2024" or "January 15 2024"
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    // Short month names: "Jan 15, 2024" or "Jan. 15, 2024"
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b/gi,
    // Numeric dates: "1/15/24", "01/15/2024", "1-15-24"
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    // Date ranges: "Jan 15-20" or "January 15-20, 2024"
    /\b(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?)\s+\d{1,2}\s*[-–—]\s*\d{1,2},?\s+\d{4}\b/gi
  ];

  const events: CalendarEvent[] = [];
  let eventId = 1;

  lines.forEach((line, index) => {
    // Check each date pattern
    for (const pattern of datePatterns) {
      const matches = Array.from(line.matchAll(pattern));
      
      matches.forEach(match => {
        const dateStr = match[0];
        let cleanedLine = line.replace(dateStr, '').replace(/[-–—]/g, '').trim();
        
        // Remove common prefixes/suffixes that aren't part of the event
        cleanedLine = cleanedLine
          .replace(/^(Week\s+\d+:?\s*)/i, '')
          .replace(/^(Class\s+\d+:?\s*)/i, '')
          .replace(/^(Session\s+\d+:?\s*)/i, '')
          .replace(/^\d+\.\s*/, '') // Remove numbering like "1. "
          .replace(/^\w+day,?\s*/i, '') // Remove day names
          .trim();

        if (cleanedLine.length < 3) {
          // If title is too short, try to get context from surrounding lines
          const contextLines = lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2));
          cleanedLine = contextLines
            .filter(l => l !== line && l.length > 3)
            .join(' ')
            .slice(0, 100) || 'Course Event';
        }

        const parsedDate = parseDate(dateStr);
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          const eventType = classifyEvent(line);
          
          events.push({
            id: eventId++,
            title: cleanedLine || 'Course Event',
            date: parsedDate.toISOString(),
            type: eventType,
            description: line.length > cleanedLine.length ? line : undefined,
            rawText: line
          });
        }
      });
    }
  });

  // Remove duplicates and sort by date
  const uniqueEvents = events.filter((event, index, self) => 
    index === self.findIndex(e => 
      e.date === event.date && 
      e.title.toLowerCase() === event.title.toLowerCase()
    )
  );

  return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function parseDate(dateStr: string): Date | null {
  try {
    // Handle various date formats
    const cleanDateStr = dateStr.trim();
    
    // Convert numeric dates to proper format
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(cleanDateStr)) {
      const parts = cleanDateStr.split(/[\/\-]/);
      const month = parseInt(parts[0]) - 1; // JS months are 0-indexed
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      
      return new Date(year, month, day);
    }
    
    // For other formats, let Date constructor handle it
    const parsed = new Date(cleanDateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function classifyEvent(text: string): CalendarEvent['type'] {
  const lower = text.toLowerCase();
  
  if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz') || lower.includes('final')) {
    return 'exam';
  }
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('hw') || 
      lower.includes('due') || lower.includes('submit') || lower.includes('paper')) {
    return 'assignment';
  }
  if (lower.includes('read') || lower.includes('chapter') || lower.includes('pages') || 
      lower.includes('article') || lower.includes('case')) {
    return 'reading';
  }
  if (lower.includes('deadline') || lower.includes('drop') || lower.includes('add') || 
      lower.includes('registration') || lower.includes('withdraw')) {
    return 'deadline';
  }
  if (lower.includes('holiday') || lower.includes('no class') || lower.includes('break') || 
      lower.includes('vacation') || lower.includes('recess')) {
    return 'holiday';
  }
  if (lower.includes('class') || lower.includes('lecture') || lower.includes('session') || 
      lower.includes('seminar') || lower.includes('discussion')) {
    return 'class';
  }
  
  return 'other';
}