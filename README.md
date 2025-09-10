# Syllabus Calendar

Transform your PDF syllabus into an organized, interactive calendar with AI-powered date extraction and Google Calendar integration.

## Features

- **Automated Extraction**: Automatically identifies dates, assignments, exams, and events from PDF syllabi
- **Dual View Modes**: Switch between list view and calendar grid view
- **Smart Categorization**: Automatically categorizes events (exams, assignments, readings, deadlines, etc.)
- **Google Calendar Integration**: Export individual events or entire calendar with one click
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Fast Processing**: Quick PDF parsing and event extraction
- **Professional Styling**: Clean, recruiter-friendly interface

## Live Demo

**[View Live App →](https://syll2-cal.vercel.app/)**

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-parse
- **Deployment**: Vercel
- **File Upload**: Native HTML5 with drag & drop

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Richard-codon/Syll2Cal.git
   cd syllabus-calendar-nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use Syll2Cal

1. **Upload**: Drag and drop or select your PDF syllabus
2. **Process**: Automatically extracts dates and categorizes events
3. **View**: Browse your calendar in list or grid view
4. **Export**: Add events to Google Calendar with one click

## Project Structure

syllabus-calendar-nextjs/
├── .next/  
├── node_modules/  
├── public/
│ ├── favicon.ico
│ └── ...other assets  
├── src/
│ ├── app/
│ │ ├── components/
│ │ │ ├── CalendarView.tsx
│ │ │ ├── FileUpload.tsx
│ │ │ └── WelcomeSection.tsx
│ │ ├── favicon.ico
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ ├── page.tsx  
│ │ └── types.ts
│ └── pages/
│ └── api/
│ └── upload.ts
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.js
├── tsconfig.json
└── README.md

## Key Features Explained

### Date Extraction

- Supports multiple date formats (January 15, 2024 | Jan 15 | 1/15/24)
- Handles date ranges and complex scheduling patterns
- Context-aware event title extraction

### Smart Event Categorization

- **Exams**: Tests, quizzes, finals
- **Assignments**: Homework, papers, projects
- **Readings**: Chapters, articles, cases
- **Deadlines**: Drop dates, registration deadlines
- **Holidays**: Breaks, no-class days
- **Classes**: Regular class sessions

### Google Calendar( and all other calendar students like myself normally use like Appple calendar and outlook calendar) Integration

- Individual event export with proper formatting
- Bulk export functionality
- Pre-filled event details and descriptions

Universal Calendar Export: The Professional Approach
This application uses the industry-standard ICS file format for calendar integration rather than direct Google API integration. This intentional design decision offers several advantages:

Enhanced User Privacy & Security

No OAuth authentication required - users don't need to log in with Google

No sensitive syllabus data is transmitted to third-party servers

Complete user control over which calendar to import into

Superior Reliability

Works across all calendar platforms (Google, Apple, Outlook, Yahoo, etc.)

No API rate limits or quota restrictions

No dependency on Google service availability

Better User Experience

Users can review events before importing

Choice of which calendar to add events to (personal, work, etc.)

Single export works for all devices and platforms

Enterprise-Grade Data Ownership

Educational institutions often restrict third-party API access

No data retention concerns - files are processed and immediately discarded

Compliant with strict academic data policies

The workflow is simple and familiar to users:

Export → Download standardized .ics file

Import → Manually import to any calendar service

Sync → Events automatically appear across all devices

This approach is used by professional applications because it prioritizes user privacy(in this our userbase - Law students' data need to be protected), cross-platform compatibility, and reliability over "magic button" solutions that often break due to API changes or authentication issues.

## Technical Implementation Choice: Why No LLM?

### Regex-Based Parsing vs. Large Language Models

This project uses traditional regex pattern matching and text processing algorithms rather than Large Language Models (LLMs) for PDF content extraction. This was an intentional technical decision based on several factors:

**Reliability and Accuracy**

- Regex patterns provide deterministic, predictable results for date extraction
- LLMs can suffer from "AI hallucination" - generating plausible but incorrect dates that don't exist in the source document
- Date parsing requires precision; a hallucinated exam date could cause a student to miss their actual exam

**Performance and Efficiency**

- Direct text processing is faster than LLM API calls
- No external dependencies or API rate limits
- Immediate response time for users

**Cost and Scalability**

- No ongoing API costs for LLM services (This will save LawBandit some costs)
- Scales without per-request charges (Which I know we would keep Scaling up, without having to pay more charges)
- Suitable for high-volume usage

**Problem Appropriateness**

- Date extraction is a pattern recognition task well-suited to regex
- The challenge isn't understanding context, but identifying and parsing structured date formats
- LLMs excel at language understanding, but this problem requires precise pattern matching

**Data Privacy**

- All processing happens locally without sending sensitive academic documents to third-party AI services (More concerned about security)
- No risk of student data being processed by external LLM providers (Bringing my associates degree in cybersecurity into action)

The effectiveness of this approach is demonstrated by the varying extraction results across different syllabi - the tool accurately reflects the amount of structured date information present in each document, rather than inferring or generating dates that may not exist.

## Performance

- **Fast PDF Processing**: Optimized parsing for quick extraction
- **Responsive UI**: Smooth interactions and transitions
- **Error Handling**: Comprehensive error management and user feedback
- **Mobile Optimized**: Works perfectly on all device sizes

## Contributing

This project was built as part of a LawBandit internship application. Feel free to fork and improve, this was a very fun project to work on.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically with zero configuration
4. Get your live URL instantly

For other deployment options, check the project documentation.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Built by Richard Asante for LawBandit Internship Application

- **Portfolio**: https://richard-codon.github.io/Personal-Portfolio/
- **LinkedIn**: https://www.linkedin.com/in/richard-asante-742117326
- **Email**: richardasante263@gmail.com

---

**If you find this project helpful, please give it a star!**
