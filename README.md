# Realtime Quiz Platform

A comprehensive realtime quiz application built with Next.js, Firebase, and TypeScript. Users can create, manage, and take quizzes with real-time leaderboard updates.

## Features

- 🔐 **User Authentication**: Email/password authentication with bcrypt encryption (12 salt rounds)
- 📝 **Quiz Management**: Complete CRUD operations for quizzes, questions, and answers
- 🎯 **Quiz Taking**: Interactive quiz interface with question navigation and timer
- 🧩 **Crossword Puzzles**: IEEE Day 2025 Tech Challenge crossword with AI and technology clues
- 🏆 **Dual Leaderboards**: Separate real-time leaderboards for quizzes and crossword puzzles
- 📊 **Detailed Results**: Comprehensive results with question/clue-by-clue breakdown
- 🎊 **Bonus Scoring**: Extra points for completing entire crossword puzzles
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Firebase Firestore (server-side actions)
- **Authentication**: Custom auth with bcrypt password hashing
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Bun

## Prerequisites

- Node.js 18+ or Bun
- Firebase project with Firestore enabled
- Environment variables configured

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd realtime-quiz
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory with your Firebase configuration:

   ```env
   API_KEY=your_firebase_api_key
   AUTH_DOMAIN=your_project.firebaseapp.com
   PROJECT_ID=your_project_id
   STORAGE_BUCKET=your_project.appspot.com
   MESSAGING_SENDER_ID=your_messaging_sender_id
   APP_ID=your_app_id
   ```

4. **Firebase Setup**

   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Set up the following collections:
     - `quiz_users` (for user authentication)
     - `quizzes` (for quiz data)
     - `quiz_attempts` (for user quiz submissions)
     - `crossword_puzzles` (for crossword puzzle data)
     - `crossword_attempts` (for crossword puzzle submissions)

5. **Run the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### quiz_users Collection

```typescript
{
  id: string,
  full_name: string,
  email: string,
  password: string, // bcrypt hashed with 12 salt rounds
  createdAt: Date
}
```

### quizzes Collection

```typescript
{
  id: string,
  title: string,
  description: string,
  questions: [
    {
      id: string,
      text: string,
      answers: [
        {
          id: string,
          text: string,
          isCorrect: boolean
        }
      ],
      points: number,
      timeLimit?: number // optional, in seconds
    }
  ],
  createdBy: string, // user id
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean,
  duration?: number // optional, total quiz duration in minutes
}
```

### quiz_attempts Collection

```typescript
{
  id: string,
  userId: string,
  quizId: string,
  answers: Record<string, string>, // questionId -> answerId
  score: number,
  maxScore: number,
  completedAt: Date,
  timeSpent: number // in seconds
}
```

### crossword_puzzles Collection

```typescript
{
  id: string,
  title: string,
  description: string,
  clues: [
    {
      id: string,
      number: number,
      clue: string,
      answer: string,
      direction: 'across' | 'down',
      startRow: number,
      startCol: number,
      length: number,
      points: number
    }
  ],
  gridSize: { rows: number, cols: number },
  createdBy: string,
  createdAt: Date,
  isActive: boolean
}
```

### crossword_attempts Collection

```typescript
{
  id: string,
  userId: string,
  puzzleId: string,
  answers: Record<string, string>, // clueId -> answer
  score: number,
  maxScore: number,
  completedAt: Date,
  timeSpent: number, // in seconds
  isComplete: boolean // true if all clues are correctly answered
}
```

## User Guide

### For Quiz Takers

1. **Register/Login**: Create an account or sign in with existing credentials
2. **Browse Quizzes**: View available active quizzes on the main page
3. **Take Quiz**: Click "Start Quiz" to begin, navigate through questions, and submit
4. **View Results**: See detailed results with correct/incorrect answers and score
5. **Check Leaderboard**: View your ranking among all quiz participants

### For Crossword Enthusiasts

1. **Access Crossword**: Navigate to "Crossword Puzzle" section
2. **Start Puzzle**: The IEEE Day 2025 Tech Challenge automatically loads
3. **Solve Clues**: Fill in answers for Across and Down clues about AI and technology
4. **Submit Answers**: Complete as many clues as possible for maximum points
5. **View Results**: See detailed breakdown with correct answers and bonus points
6. **Check Crossword Leaderboard**: View your ranking among crossword participants

### For Quiz Creators

1. **Manage Quizzes**: Navigate to "Manage Quizzes" section
2. **Create Quiz**: Click "Create New Quiz" and fill in details
3. **Add Questions**: Add multiple questions with multiple choice answers
4. **Mark Correct Answers**: Select which answers are correct for each question
5. **Set Points**: Assign point values to questions
6. **Activate Quiz**: Set quiz as active for users to take

## Application Structure

```
src/
├── actions/
│   └── firebaseActions.ts     # Server-side Firebase operations
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main application component
│   └── globals.css           # Global styles
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # User login component
│   │   └── RegisterForm.tsx  # User registration component
│   ├── crossword/
│   │   ├── CrosswordGame.tsx      # Crossword puzzle interface
│   │   ├── CrosswordList.tsx      # Available crossword puzzles
│   │   ├── CrosswordResults.tsx   # Crossword results display
│   │   └── CrosswordLeaderboard.tsx # Crossword leaderboard
│   ├── layout/
│   │   └── Navigation.tsx    # Main navigation component
│   ├── leaderboard/
│   │   └── Leaderboard.tsx   # Quiz leaderboard
│   └── quiz/
│       ├── QuizForm.tsx      # Quiz creation/editing form
│       ├── QuizList.tsx      # Quiz management interface
│       ├── QuizTaking.tsx    # Quiz taking interface
│       └── QuizResults.tsx   # Quiz results display component
├── config/
│   └── firebase.ts           # Firebase configuration
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── data/
│   └── crosswordData.ts     # IEEE Day crossword puzzle data
├── lib/
│   └── auth.ts              # Authentication utilities
├── types.ts                 # TypeScript type definitions
└── utils/
    └── bcrypt.ts            # Password hashing utilities
```

## Key Features Explained

### Authentication System

- Uses bcrypt with 12 salt rounds for secure password hashing
- Client-side authentication state management with React Context
- Server-side user validation and session management

### Quiz Management

- Drag-and-drop question ordering
- Multiple choice questions with multiple correct answers support
- Point-based scoring system
- Optional time limits per question and overall quiz

### Real-time Leaderboard

- Automatically updates every 30 seconds
- Ranks users by total score across all quizzes
- Shows additional metrics: quizzes completed, average score, last quiz date
- Visual podium display for top 3 performers

### Quiz Taking Experience

- Progress tracking with visual progress bar
- Question navigation (previous/next)
- Time remaining display (if quiz has duration limit)
- Auto-submit when time expires
- Question navigator showing answered/unanswered questions

## Development Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

## Deployment

The application can be deployed on any platform that supports Next.js:

- **Vercel** (recommended): Connect your GitHub repository for automatic deployments
- **Netlify**: Use the Next.js build command
- **Docker**: Containerize the application
- **Self-hosted**: Build and run on your own server

Remember to set up environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.
