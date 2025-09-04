# Syllabus Calendar

Transform your PDF syllabus into an organized, interactive calendar with AI-powered date extraction and Google Calendar integration.

## Features

- **AI-Powered Extraction**: Automatically identifies dates, assignments, exams, and events from PDF syllabi
- **Dual View Modes**: Switch between list view and calendar grid view
- **Smart Categorization**: Automatically categorizes events (exams, assignments, readings, deadlines, etc.)
- **Google Calendar Integration**: Export individual events or entire calendar with one click
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Fast Processing**: Quick PDF parsing and event extraction
- **Professional Styling**: Clean, recruiter-friendly interface

## 🚀 Live Demo

**[View Live App →](https://your-vercel-deployment-url.vercel.app)**

## 🛠️ Tech Stack

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
   git clone https://github.com/yourusername/syllabus-calendar.git
   cd syllabus-calendar
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

```
syllabus-calendar/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── CalendarView.tsx
│   │   └── FileUpload.tsx
│   ├── pages/            # Next.js pages
│   │   ├── index.tsx     # Main page
│   │   ├── _app.tsx      # App wrapper
│   │   └── api/
│   │       └── upload.ts # PDF processing API
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   └── styles/           # Global styles
│       └── globals.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Key Features Explained

### Date Extraction

- Supports multiple date formats (January 15, 2024 | Jan 15 | 1/15/24)
- Handles date ranges and complex scheduling patterns
- Context-aware event title extraction

### Smart Event Categorization

- ** Exams**: Tests, quizzes, finals
- ** Assignments**: Homework, papers, projects
- ** Readings**: Chapters, articles, cases
- ** Deadlines**: Drop dates, registration deadlines
- ** Holidays**: Breaks, no-class days
- ** Classes**: Regular class sessions

### Google Calendar Integration

- Individual event export with proper formatting
- Bulk export functionality
- Pre-filled event details and descriptions

## Deployment

### Deploy to Vercel

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

## License

This project is open source and available under the [MIT License](LICENSE).

##Contact

Built by Richard Asante for LawBandit Internship Application

- **Portfolio**: https://richard-codon.github.io/Personal-Portfolio/
- **LinkedIn**: https://www.linkedin.com/in/richard-asante-742117326
- **Email**: richardasante263@gmail.com

---

**If you find this project helpful, please give it a star!**
