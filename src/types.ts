import z from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type SignInType = z.infer<typeof SignInSchema>;

export type UserType = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  food_preference: "Vegetarian" | "Non-vegetarian";
  gender: "Male" | "Female";
  nic: string;
  university_name: string;
  preferred_track_session_1:
    | "Quantum Computing"
    | "Data Science & Analytics with AI"
    | "AI & Robotics in Industry 4.0"
    | "AI in Cybersecurity"
    | "AI in Cloud Computing";
  preferred_track_session_2:
    | "Quantum Computing"
    | "Data Science & Analytics with AI"
    | "AI & Robotics in Industry 4.0"
    | "AI in Cybersecurity"
    | "AI in Cloud Computing";
  preferred_track_session_3:
    | "Quantum Computing"
    | "Data Science & Analytics with AI"
    | "AI & Robotics in Industry 4.0"
    | "AI in Cybersecurity"
    | "AI in Cloud Computing";
};

// Quiz related types
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  points: number;
  timeLimit?: number; // in seconds
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string; // user id
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  duration?: number; // total quiz duration in minutes
}

// User quiz attempt types
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string>; // questionId -> answerId
  score: number;
  maxScore: number;
  completedAt: Date;
  timeSpent: number; // in seconds
}

// Leaderboard types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  email: string;
  totalScore: number;
  quizzesCompleted: number;
  averageScore: number;
  lastQuizDate: Date;
}

// Quiz form schemas
export const AnswerSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  answers: z.array(AnswerSchema).min(2, "At least 2 answers are required"),
  points: z.number().min(1, "Points must be at least 1"),
  timeLimit: z.number().optional(),
});

export const QuizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().min(1, "Quiz description is required"),
  questions: z.array(QuestionSchema).min(1, "At least 1 question is required"),
  duration: z.number().optional(),
});

export type QuizFormType = z.infer<typeof QuizSchema>;
export type QuestionFormType = z.infer<typeof QuestionSchema>;
export type AnswerFormType = z.infer<typeof AnswerSchema>;

// Crossword types
export interface CrosswordClue {
  id: string;
  number: number;
  clue: string;
  answer?: string; // Optional - not sent to client for security
  direction: "across" | "down";
  startRow: number;
  startCol: number;
  length: number;
  points: number;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  description: string;
  clues: CrosswordClue[];
  gridSize: { rows: number; cols: number };
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface CrosswordAttempt {
  id: string;
  userId: string;
  puzzleId: string;
  answers: Record<string, string>; // clueId -> answer
  score: number;
  maxScore: number;
  completedAt: Date;
  timeSpent: number; // in seconds
  isComplete: boolean; // true if all clues are correctly answered
}

// Crossword leaderboard types
export interface CrosswordLeaderboardEntry {
  userId: string;
  userName: string;
  email: string;
  totalScore: number;
  puzzlesCompleted: number;
  averageScore: number;
  lastPuzzleDate: Date;
}
