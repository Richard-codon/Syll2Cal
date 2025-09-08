import type { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
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
    
    // Debug: Log the extracted text (will comment it out  after testing)
    //console.log('Extracted PDF text:', data.text.substring(0, 1000));
    
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
  // Split into lines and clean
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // More comprehensive and specific date patterns
  const datePatterns = [
    // Full month names with year: "January 15, 2024", "January 15 2024"
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s*\d{4})\b/gi,
    
    // Short month names with year: "Jan 15, 2024", "Jan. 15, 2024", "Sep 30"
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2}(?:,?\s*\d{4})?\b/gi,
    
    // Numeric formats: "9/2", "10/28", "12/16", "1/15/24", "01/15/2024"
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
    
    // Numeric with dashes: "9-2", "10-28", "1-15-24"
    /\b\d{1,2}-\d{1,2}(?:-\d{2,4})?\b/g,
    
    // Date ranges: "Jan 15-20", "January 15-20, 2024"
    /\b(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?)\s+\d{1,2}\s*[-–—]\s*\d{1,2}(?:,?\s*\d{4})?\b/gi
  ];

  const events: CalendarEvent[] = [];
  let eventId = 1;
  
  // Add a default year for dates without years
  const currentYear = new Date().getFullYear();
  
  // Process each line
  lines.forEach((line, index) => {
    // Try each pattern
    for (const pattern of datePatterns) {
      const matches = Array.from(line.matchAll(pattern));
      
      matches.forEach(match => {
        const dateStr = match[0];
        
        // Parse the date and add default year if needed
        const parsedDate = parseDate(dateStr, currentYear);
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          return; // Skip invalid dates
        }
        
        // Extract event title
        const title = extractEventTitle(line, dateStr, lines, index);
        
        // Skip if title is too generic or empty
        if (!title || title.length < 3 || isGenericTitle(title)) {
          return;
        }
        
        // Classify the event
        const eventType = classifyEvent(line);
        
        events.push({
          id: eventId++,
          title: title,
          date: parsedDate.toISOString(),
          type: eventType,
          description: line.length > title.length ? line : undefined,
          rawText: line
        });
      });
    }
  });

  // Remove duplicates more intelligently
  const uniqueEvents = removeDuplicates(events);
  
  // Sort chronologically
  return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function parseDate(dateStr: string, defaultYear: number): Date | null {
  try {
    let cleanDateStr = dateStr.trim();
    
    // Handle numeric formats without year: "9/2" -> "9/2/2025"
    if (/^\d{1,2}\/\d{1,2}$/.test(cleanDateStr)) {
      cleanDateStr += `/${defaultYear}`;
    }
    
    // Handle dash formats: "9-2" -> "9/2"
    if (/^\d{1,2}-\d{1,2}$/.test(cleanDateStr)) {
      cleanDateStr = cleanDateStr.replace('-', '/') + `/${defaultYear}`;
    }
    
    // Handle month names without year: "Sep 30" -> "Sep 30, 2025"
    if (/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2}$/.test(cleanDateStr)) {
      cleanDateStr += `, ${defaultYear}`;
    }
    
    // Handle full month names without year
    if (/^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}$/.test(cleanDateStr)) {
      cleanDateStr += `, ${defaultYear}`;
    }
    
    // Handle numeric dates MM/DD/YY or MM-DD-YY
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
    
    
    const parsed = new Date(cleanDateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
    
  } catch {
    return null;
  }
}

function extractEventTitle(line: string, dateStr: string, lines: string[], currentIndex: number): string {
  // Remove the date from the line
  let title = line.replace(new RegExp(dateStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
  
  // Remove common prefixes and formatting
  title = title
    .replace(/^(Week\s+\d+:?\s*)/i, '')
    .replace(/^(Class\s+\d+:?\s*)/i, '')
    .replace(/^(Session\s+\d+:?\s*)/i, '')
    .replace(/^(Lab\s+#?\d+\s*[-–—]?\s*)/i, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^[-–—]+\s*/, '')
    .replace(/\s*[-–—]+\s*$/, '')
    .replace(/^\w+day,?\s*/i, '') // Remove day names
    .replace(/^(due|submit|turn\s+in):?\s*/i, '') // Remove "due" prefixes
    .trim();
  
  // If title is too short, get context from surrounding lines
  if (title.length < 5) {
    const contextLines = lines.slice(Math.max(0, currentIndex - 1), Math.min(lines.length, currentIndex + 2));
    const contextTitle = contextLines
      .filter(l => l !== line && l.length > 10 && !containsDate(l))
      .join(' ')
      .slice(0, 80);
    
    if (contextTitle.length > title.length) {
      title = contextTitle.trim();
    }
  }
  
  // Final cleanup
  return title.replace(/\s+/g, ' ').trim();
}

function containsDate(text: string): boolean {
  const datePattern = /\b(?:\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2})\b/gi;
  return datePattern.test(text);
}

function isGenericTitle(title: string): boolean {
  const genericPatterns = [
    /^(week|class|session|lab|lecture)\s*\d*$/i,
    /^(due|submit|assignment)$/i,
    /^\d+$/,
    /^[a-z]\s*$/i
  ];
  
  return genericPatterns.some(pattern => pattern.test(title.trim()));
}

function removeDuplicates(events: CalendarEvent[]): CalendarEvent[] {
  const seen = new Set();
  
  return events.filter(event => {
    // Create a key based on date and similar title
    const dateKey = event.date.split('T')[0]; // Just the date part
    const titleKey = event.title.toLowerCase().replace(/[^\w]/g, '').substring(0, 20);
    const key = `${dateKey}-${titleKey}`;
    
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function classifyEvent(text: string): CalendarEvent['type'] {
  const lower = text.toLowerCase();
  
  // Exam keywords (including variations)
  if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz') || 
      lower.includes('final') || lower.includes('midterm') || lower.includes('practical') || lower.includes('course end date')) {
    return 'exam';
  }
  
  // Assignment keywords
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('hw') || 
      lower.includes('due') || lower.includes('submit') || lower.includes('paper') || 
      lower.includes('project') || lower.includes('lab') && lower.includes('due')) {
    return 'assignment';
  }
  
  // Reading keywords
  if (lower.includes('read') || lower.includes('chapter') || lower.includes('pages') || 
      lower.includes('article') || lower.includes('case')) {
    return 'reading';
  }
  
  // Deadline keywords
  if (lower.includes('deadline') || lower.includes('drop') || lower.includes('add') || 
      lower.includes('registration') || lower.includes('withdraw') || 
      lower.includes('last day')) {
    return 'deadline';
  }
  
  // Holiday keywords
  if (lower.includes('holiday') || lower.includes('no class') || lower.includes('break') || 
      lower.includes('vacation') || lower.includes('recess') || lower.includes('no lab') || 
      lower.includes('no lecture')) {
    return 'holiday';
  }
  
  // Class keywords
  if (lower.includes('class') || lower.includes('lecture') || lower.includes('session') || 
      lower.includes('seminar') || lower.includes('discussion') || lower.includes('lab')) {
    return 'class';
  }
  
  return 'other';
}