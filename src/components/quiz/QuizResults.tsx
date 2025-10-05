"use client";

import { QuizAttempt, Quiz } from "@/types";

interface QuizResultsProps {
 attempt: QuizAttempt;
 quiz: Quiz;
 onGoToLeaderboard: () => void;
 onTakeAnotherQuiz: () => void;
}

export default function QuizResults({ attempt, quiz, onGoToLeaderboard, onTakeAnotherQuiz }: QuizResultsProps) {
 const percentage = Math.round((attempt.score / attempt.maxScore) * 100);

 const getGrade = (percentage: number) => {
  if (percentage >= 90) return { grade: "A+", color: "text-black", bg: "bg-white" };
  if (percentage >= 80) return { grade: "A", color: "text-black", bg: "bg-white" };
  if (percentage >= 70) return { grade: "B", color: "text-black", bg: "bg-white" };
  if (percentage >= 60) return { grade: "C", color: "text-black", bg: "bg-white" };
  if (percentage >= 50) return { grade: "D", color: "text-black", bg: "bg-white" };
  return { grade: "F", color: "text-black", bg: "bg-white" };
 };

 const { grade, color, bg } = getGrade(percentage);

 const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
   return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
 };

 const getPerformanceMessage = (percentage: number) => {
  if (percentage >= 90) return "Outstanding performance! 🌟";
  if (percentage >= 80) return "Great job! Well done! 👏";
  if (percentage >= 70) return "Good work! Keep it up! 👍";
  if (percentage >= 60) return "Not bad, but there's room for improvement! 📚";
  if (percentage >= 50) return "You passed, but consider reviewing the material. 🤔";
  return "Don't give up! Practice makes perfect! 💪";
 };

 return (
  <div className="max-w-2xl mx-auto p-6">
   <div className="bg-white overflow-hidden">
    {/* Header */}
    <div className="bg-black p-6 text-white text-center">
     <h1 className="text-2xl font-bold mb-2">Quiz Completed!</h1>
     <h2 className="text-lg opacity-90">{quiz.title}</h2>
    </div>

    {/* Results */}
    <div className="p-6">
     {/* Score Display */}
     <div className="text-center mb-8">
      <div className={`inline-flex items-center justify-center w-24 h-24 text-3xl font-bold ${bg} ${color} mb-4`}>
       {grade}
      </div>
      <div className="text-3xl font-bold text-black mb-2">
       {attempt.score} / {attempt.maxScore}
      </div>
      <div className="text-lg text-gray-400 mb-4">
       {percentage}% Score
      </div>
      <div className="text-gray-400">
       {getPerformanceMessage(percentage)}
      </div>
     </div>

     {/* Stats */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 text-center">
       <div className="text-2xl font-bold text-black">{attempt.score}</div>
       <div className="text-sm text-gray-400">Points Earned</div>
      </div>
      <div className="bg-white p-4 text-center">
       <div className="text-2xl font-bold text-black">{quiz.questions.length}</div>
       <div className="text-sm text-gray-400">Questions</div>
      </div>
      <div className="bg-white p-4 text-center">
       <div className="text-2xl font-bold text-black">{formatTime(attempt.timeSpent)}</div>
       <div className="text-sm text-gray-400">Time Taken</div>
      </div>
     </div>

     {/* Progress Bar */}
     <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
       <span>Your Score</span>
       <span>{percentage}%</span>
      </div>
      <div className="w-full bg-white h-3">
       <div
        className={`h-3 transition-all duration-1000 ${percentage >= 70 ? 'bg-black' : percentage >= 50 ? 'bg-gray-600' : 'bg-gray-400'
         }`}
        style={{ width: `${percentage}%` }}
       />
      </div>
     </div>

     {/* Detailed Results */}
     <div className="mb-8">
      <h3 className="text-lg font-semibold text-black mb-4">Question Breakdown</h3>
      <div className="space-y-3">
       {quiz.questions.map((question, index) => {
        const userAnswerId = attempt.answers[question.id];
        const userAnswer = question.answers.find(a => a.id === userAnswerId);
        const correctAnswer = question.answers.find(a => a.isCorrect);
        const isCorrect = userAnswer?.isCorrect || false;

        return (
         <div key={question.id} className="border p-4">
          <div className="flex justify-between items-start mb-2">
           <h4 className="text-sm font-medium text-black flex-1">
            {index + 1}. {question.text}
           </h4>
           <div className={`ml-4 px-2 py-1 rounded text-xs font-medium ${isCorrect ? 'bg-white text-black' : 'bg-white text-black'
            }`}>
            {isCorrect ? `+${question.points}` : '0'} pts
           </div>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
           <div>
            <span className="font-medium">Your answer: </span>
            <span className={isCorrect ? 'text-black' : 'text-black'}>
             {userAnswer ? userAnswer.text : 'No answer'}
            </span>
           </div>
           {!isCorrect && (
            <div>
             <span className="font-medium">Correct answer: </span>
             <span className="text-black">{correctAnswer?.text}</span>
            </div>
           )}
          </div>
         </div>
        );
       })}
      </div>
     </div>

     {/* Actions */}
     <div className="flex flex-col sm:flex-row gap-4">
      <button
       onClick={onGoToLeaderboard}
       className="flex-1 bg-black text-white rounded-md py-3 px-6 hover:bg-gray-800 transition-colors font-medium"
      >
       View Leaderboard
      </button>
      <button
       onClick={onTakeAnotherQuiz}
       className="flex-1 bg-black text-white rounded-md py-3 px-6 hover:bg-gray-800 transition-colors font-medium"
      >
       Take Another Quiz
      </button>
     </div>
    </div>
   </div>
  </div>
 );
}