"use server";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { verifyPassword } from "@/utils/bcrypt";
import {
  UserType,
  Quiz,
  QuizAttempt,
  LeaderboardEntry,
  CrosswordPuzzle,
  CrosswordAttempt,
  CrosswordLeaderboardEntry,
} from "@/types";

// User Authentication Functions
export async function readUser(
  email: string,
  password: string
): Promise<UserType | null> {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (!verifyPassword(password, userData.password)) {
      return null;
    }

    return {
      id: userData.id,
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone_number: userData.phone_number,
      food_preference: userData.food_preference,
      gender: userData.gender,
      nic: userData.nic,
      university_name: userData.university_name,
      preferred_track_session_1: userData.preferred_track_session_1,
      preferred_track_session_2: userData.preferred_track_session_2,
      preferred_track_session_3: userData.preferred_track_session_3,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function authenticateQuizUser(
  email: string,
  password: string
): Promise<UserType | null> {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (!verifyPassword(password, userData.password)) {
      return null;
    }

    return {
      id: userDoc.id,
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone_number: userData.phone_number,
      food_preference: userData.food_preference,
      gender: userData.gender,
      nic: userData.nic,
      university_name: userData.university_name,
      preferred_track_session_1: userData.preferred_track_session_1,
      preferred_track_session_2: userData.preferred_track_session_2,
      preferred_track_session_3: userData.preferred_track_session_3,
    };
  } catch (e) {
    console.error("Error authenticating user:", e);
    return null;
  }
}

// Quiz CRUD Functions
export async function createQuiz(
  quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">
): Promise<Quiz | null> {
  try {
    const quizRef = collection(db, "quizzes");
    const newQuiz = {
      ...quizData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(quizRef, newQuiz);

    return {
      id: docRef.id,
      ...quizData,
      createdAt: newQuiz.createdAt.toDate(),
      updatedAt: newQuiz.updatedAt.toDate(),
    };
  } catch (e) {
    console.error("Error creating quiz:", e);
    return null;
  }
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
  try {
    const quizDoc = await getDoc(doc(db, "quizzes", quizId));

    if (!quizDoc.exists()) {
      return null;
    }

    const data = quizDoc.data();
    return {
      id: quizDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Quiz;
  } catch (e) {
    console.error("Error getting quiz:", e);
    return null;
  }
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    const quizzesRef = collection(db, "quizzes");
    const q = query(quizzesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Quiz[];
  } catch (e) {
    console.error("Error getting quizzes:", e);
    return [];
  }
}

export async function updateQuiz(
  quizId: string,
  updates: Partial<Omit<Quiz, "id" | "createdAt">>
): Promise<boolean> {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (e) {
    console.error("Error updating quiz:", e);
    return false;
  }
}

export async function deleteQuiz(quizId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
    return true;
  } catch (e) {
    console.error("Error deleting quiz:", e);
    return false;
  }
}

// Quiz Attempt Functions
export async function submitQuizAttempt(
  attemptData: Omit<QuizAttempt, "id">
): Promise<QuizAttempt | null> {
  try {
    const attemptsRef = collection(db, "quiz_attempts");
    const newAttempt = {
      ...attemptData,
      completedAt: Timestamp.now(),
    };

    const docRef = await addDoc(attemptsRef, newAttempt);

    return {
      id: docRef.id,
      ...attemptData,
      completedAt: newAttempt.completedAt.toDate(),
    };
  } catch (e) {
    console.error("Error submitting quiz attempt:", e);
    return null;
  }
}

export async function getUserQuizAttempts(
  userId: string
): Promise<QuizAttempt[]> {
  try {
    const attemptsRef = collection(db, "quiz_attempts");
    const q = query(
      attemptsRef,
      where("userId", "==", userId),
      orderBy("completedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt.toDate(),
    })) as QuizAttempt[];
  } catch (e) {
    console.error("Error getting user quiz attempts:", e);
    return [];
  }
}

// Leaderboard Functions
export async function getLeaderboard(
  limitCount: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    // This is a simplified version - in a real app, you might want to use a cloud function
    // to calculate leaderboard data more efficiently
    const attemptsRef = collection(db, "quiz_attempts");
    const usersRef = collection(db, "users");

    const [attemptsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(attemptsRef),
      getDocs(usersRef),
    ]);

    // Create user map
    const users = new Map();
    usersSnapshot.docs.forEach((doc) => {
      users.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      });
    });

    // Calculate user stats
    const userStats = new Map();

    attemptsSnapshot.docs.forEach((doc) => {
      const attemptData = doc.data();
      const userId = attemptData.userId;
      const completedAt =
        attemptData.completedAt instanceof Timestamp
          ? attemptData.completedAt.toDate()
          : attemptData.completedAt;

      if (!userStats.has(userId)) {
        userStats.set(userId, {
          totalScore: 0,
          quizzesCompleted: 0,
          lastQuizDate: completedAt,
        });
      }

      const stats = userStats.get(userId);
      stats.totalScore += attemptData.score;
      stats.quizzesCompleted += 1;

      if (completedAt > stats.lastQuizDate) {
        stats.lastQuizDate = completedAt;
      }
    });

    // Create leaderboard entries
    const leaderboard: LeaderboardEntry[] = [];

    for (const [userId, stats] of userStats.entries()) {
      const user = users.get(userId);
      if (user) {
        leaderboard.push({
          userId,
          userName: user.full_name,
          email: user.email,
          totalScore: stats.totalScore,
          quizzesCompleted: stats.quizzesCompleted,
          averageScore: stats.totalScore / stats.quizzesCompleted,
          lastQuizDate: stats.lastQuizDate,
        });
      }
    }

    // Sort by total score descending
    return leaderboard
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limitCount);
  } catch (e) {
    console.error("Error getting leaderboard:", e);
    return [];
  }
}

// Crossword Functions
export async function createCrosswordPuzzle(
  puzzleData: Omit<CrosswordPuzzle, "id" | "createdAt">
): Promise<CrosswordPuzzle | null> {
  try {
    const puzzleRef = collection(db, "crossword_puzzles");
    const newPuzzle = {
      ...puzzleData,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(puzzleRef, newPuzzle);

    return {
      id: docRef.id,
      ...puzzleData,
      createdAt: newPuzzle.createdAt.toDate(),
    };
  } catch (e) {
    console.error("Error creating crossword puzzle:", e);
    return null;
  }
}

export async function getCrosswordPuzzle(
  puzzleId: string
): Promise<CrosswordPuzzle | null> {
  try {
    const puzzleDoc = await getDoc(doc(db, "crossword_puzzles", puzzleId));

    if (!puzzleDoc.exists()) {
      return null;
    }

    const data = puzzleDoc.data();
    const puzzle = {
      id: puzzleDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as CrosswordPuzzle;

    // Remove answers from clues before sending to client
    puzzle.clues = puzzle.clues.map((clue) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer: _, ...clueWithoutAnswer } = clue;
      return clueWithoutAnswer;
    });
    return puzzle;
  } catch (e) {
    console.error("Error getting crossword puzzle:", e);
    return null;
  }
}

export async function getAllCrosswordPuzzles(): Promise<CrosswordPuzzle[]> {
  try {
    const puzzlesRef = collection(db, "crossword_puzzles");
    const q = query(puzzlesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const puzzle = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as CrosswordPuzzle;

      // Remove answers from clues before sending to client
      puzzle.clues = puzzle.clues.map((clue) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { answer: _, ...clueWithoutAnswer } = clue;
        return clueWithoutAnswer;
      });

      return puzzle;
    });
  } catch (e) {
    console.error("Error getting crossword puzzles:", e);
    return [];
  }
}

export async function submitCrosswordAttempt(
  attemptData: Omit<CrosswordAttempt, "id">
): Promise<CrosswordAttempt | null> {
  try {
    const attemptsRef = collection(db, "crossword_attempts");
    const newAttempt = {
      ...attemptData,
      completedAt: Timestamp.now(),
    };

    const docRef = await addDoc(attemptsRef, newAttempt);

    return {
      id: docRef.id,
      ...attemptData,
      completedAt: newAttempt.completedAt.toDate(),
    };
  } catch (e) {
    console.error("Error submitting crossword attempt:", e);
    return null;
  }
}

export async function getCrosswordLeaderboard(
  limitCount: number = 10
): Promise<CrosswordLeaderboardEntry[]> {
  try {
    const attemptsRef = collection(db, "crossword_attempts");
    const usersRef = collection(db, "users");

    const [attemptsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(attemptsRef),
      getDocs(usersRef),
    ]);

    // Create user map
    const users = new Map();
    usersSnapshot.docs.forEach((doc) => {
      users.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      });
    });

    // Calculate user stats
    const userStats = new Map();

    attemptsSnapshot.docs.forEach((doc) => {
      const attemptData = doc.data();
      const userId = attemptData.userId;
      const completedAt =
        attemptData.completedAt instanceof Timestamp
          ? attemptData.completedAt.toDate()
          : attemptData.completedAt;

      if (!userStats.has(userId)) {
        userStats.set(userId, {
          totalScore: 0,
          puzzlesCompleted: 0,
          lastPuzzleDate: completedAt,
        });
      }

      const stats = userStats.get(userId);
      stats.totalScore += attemptData.score;
      stats.puzzlesCompleted += 1;

      if (completedAt > stats.lastPuzzleDate) {
        stats.lastPuzzleDate = completedAt;
      }
    });

    // Create leaderboard entries
    const leaderboard: CrosswordLeaderboardEntry[] = [];

    for (const [userId, stats] of userStats.entries()) {
      const user = users.get(userId);
      if (user) {
        leaderboard.push({
          userId,
          userName: user.full_name,
          email: user.email,
          totalScore: stats.totalScore,
          puzzlesCompleted: stats.puzzlesCompleted,
          averageScore: stats.totalScore / stats.puzzlesCompleted,
          lastPuzzleDate: stats.lastPuzzleDate,
        });
      }
    }

    // Sort by total score descending
    return leaderboard
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limitCount);
  } catch (e) {
    console.error("Error getting crossword leaderboard:", e);
    return [];
  }
}

// Server-side crossword answers mapping - kept secure on server
const CROSSWORD_ANSWERS: Record<string, string> = {
  across_2: "COMPUTERVISION",
  across_3: "IEEE",
  across_6: "CHATGPT",
  across_7: "REINFORCEMENT",
  across_9: "OCTOBER",
  across_11: "SOPHIA",
  down_1: "MACHINELEARNING",
  down_4: "ANALYTICS",
  down_5: "TIMEMACHINE",
  down_8: "MUSICAL",
  down_10: "CHATBOT",
  down_12: "PYTHON",
};

// Validate crossword answers server-side
export async function validateCrosswordAnswers(
  userAnswers: Record<string, string>
): Promise<{ score: number; maxScore: number; isComplete: boolean; correctAnswers: Record<string, boolean> }> {
  const correctAnswers: Record<string, boolean> = {};
  let score = 0;
  let correctCount = 0;
  const totalClues = Object.keys(CROSSWORD_ANSWERS).length;

  for (const [clueId, userAnswer] of Object.entries(userAnswers)) {
    const correctAnswer = CROSSWORD_ANSWERS[clueId];
    const isCorrect =
      correctAnswer && userAnswer.toUpperCase().trim() === correctAnswer;

    correctAnswers[clueId] = Boolean(isCorrect);
    if (isCorrect) {
      score += 5; // 5 points per correct answer
      correctCount++;
    }
  }

  // Bonus points for completing the entire puzzle
  const isComplete = correctCount === totalClues;
  if (isComplete) {
    score += 5; // Extra 5 marks for complete puzzle
  }

  const maxScore = totalClues * 5 + 5; // 5 points per clue + 5 bonus for completion

  return { score, maxScore, isComplete, correctAnswers };
}
