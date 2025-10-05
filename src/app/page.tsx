"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import Navigation from "@/components/layout/Navigation";
import QuizList from "@/components/quiz/QuizList";
import QuizForm from "@/components/quiz/QuizForm";
import QuizTaking from "@/components/quiz/QuizTaking";
import QuizResults from "@/components/quiz/QuizResults";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import CrosswordList from "@/components/crossword/CrosswordList";
import CrosswordGame from "@/components/crossword/CrosswordGame";
import CrosswordResults from "@/components/crossword/CrosswordResults";
import CrosswordLeaderboard from "@/components/crossword/CrosswordLeaderboard";
import { Quiz, QuizAttempt, CrosswordAttempt, CrosswordPuzzle } from "@/types";
import { getQuiz, getCrosswordPuzzle } from "@/actions/firebaseActions";

function AppContent() {
  const { user, login, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState("quizzes");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [takingQuizId, setTakingQuizId] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ attempt: QuizAttempt; quiz: Quiz } | null>(null);
  const [takingCrosswordId, setTakingCrosswordId] = useState<string | null>(null);
  const [crosswordResult, setCrosswordResult] = useState<{ attempt: CrosswordAttempt; puzzle: CrosswordPuzzle } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-black rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoginForm onLogin={login} />
      </div>
    );
  }

  // Handle crossword results
  if (crosswordResult) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <div className="py-8">
          <CrosswordResults
            attempt={crosswordResult.attempt}
            puzzle={crosswordResult.puzzle}
            onGoToLeaderboard={() => {
              setCrosswordResult(null);
              setCurrentView("crossword-leaderboard");
            }}
            onTryAgain={() => {
              setCrosswordResult(null);
              setCurrentView("crossword");
            }}
          />
        </div>
      </div>
    );
  }

  // Handle crossword taking
  if (takingCrosswordId) {
    return (
      <div className="min-h-screen bg-white">
        <CrosswordGame
          puzzleId={takingCrosswordId}
          onComplete={async (attempt: CrosswordAttempt) => {
            const puzzle = await getCrosswordPuzzle(attempt.puzzleId);
            if (puzzle) {
              setCrosswordResult({ attempt, puzzle });
            }
            setTakingCrosswordId(null);
          }}
          onExit={() => setTakingCrosswordId(null)}
        />
      </div>
    );
  }

  // Handle quiz results
  if (quizResult) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <div className="py-8">
          <QuizResults
            attempt={quizResult.attempt}
            quiz={quizResult.quiz}
            onGoToLeaderboard={() => {
              setQuizResult(null);
              setCurrentView("leaderboard");
            }}
            onTakeAnotherQuiz={() => {
              setQuizResult(null);
              setCurrentView("quizzes");
            }}
          />
        </div>
      </div>
    );
  }

  // Handle quiz taking
  if (takingQuizId) {
    return (
      <div className="min-h-screen bg-white">
        <QuizTaking
          quizId={takingQuizId}
          onQuizComplete={async (attempt: QuizAttempt) => {
            const quiz = await getQuiz(attempt.quizId);
            if (quiz) {
              setQuizResult({ attempt, quiz });
            }
            setTakingQuizId(null);
          }}
          onExit={() => setTakingQuizId(null)}
        />
      </div>
    );
  }

  // Handle quiz creation/editing
  if (isCreatingQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <div className="py-8">
          <QuizForm
            onQuizCreated={() => {
              setIsCreatingQuiz(false);
              setCurrentView("manage");
            }}
            onCancel={() => setIsCreatingQuiz(false)}
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "quizzes":
        return <QuizListForTaking onTakeQuiz={setTakingQuizId} />;
      case "crossword":
        return <CrosswordList onStartPuzzle={setTakingCrosswordId} />;
      case "manage":
        return (
          <QuizList
            onEditQuiz={setSelectedQuiz}
            onCreateNewQuiz={() => setIsCreatingQuiz(true)}
          />
        );
      case "leaderboard":
        return <Leaderboard />;
      case "crossword-leaderboard":
        return <CrosswordLeaderboard />;
      default:
        return <QuizListForTaking onTakeQuiz={setTakingQuizId} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="py-8">
        {renderContent()}
      </div>
    </div>
  );
}

// Component for displaying quizzes for taking (different from management)
function QuizListForTaking({ onTakeQuiz }: { onTakeQuiz: (quizId: string) => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const { getAllQuizzes } = await import("@/actions/firebaseActions");
      const fetchedQuizzes = await getAllQuizzes();
      // Only show active quizzes for taking
      setQuizzes(fetchedQuizzes.filter(quiz => quiz.isActive));
    } catch (err) {
      setError("Failed to load quizzes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">Available Quizzes</h2>
        <p className="text-gray-400 mt-2">Choose a quiz to test your knowledge</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-white border border-black rounded text-black">
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No active quizzes available</div>
          <p className="text-gray-400">Check back later for new quizzes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);

            return (
              <div key={quiz.id} className="bg-white border border-gray-300 rounded-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-black mb-3 line-clamp-2">
                    {quiz.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {quiz.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span className="font-medium">{quiz.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-medium">{totalPoints}</span>
                    </div>
                    {quiz.duration && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{quiz.duration} min</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{formatDate(quiz.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTakeQuiz(quiz.id)}
                    className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
