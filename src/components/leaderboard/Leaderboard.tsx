"use client";

import { useState, useEffect } from "react";
import { LeaderboardEntry, Quiz } from "@/types";
import { getLeaderboard, getQuizLeaderboard, getAllQuizzes } from "@/actions/firebaseActions";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadInitialData();

    // Set up interval to refresh leaderboard every 30 seconds for realtime updates
    const interval = setInterval(() => {
      loadLeaderboard(selectedQuizId);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedQuizId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [quizzesData] = await Promise.all([
        getAllQuizzes(),
      ]);
      setQuizzes(quizzesData);
      
      // Load leaderboard for currently selected quiz (or all quizzes)
      await loadLeaderboard(selectedQuizId);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async (quizId: string | null) => {
    try {
      let data: LeaderboardEntry[];
      if (quizId) {
        data = await getQuizLeaderboard(quizId, 20);
      } else {
        data = await getLeaderboard(20); // Get top 20 users across all quizzes
      }
      setLeaderboard(data);
      setError("");
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    }
  };

  const handleTabChange = async (quizId: string | null) => {
    setSelectedQuizId(quizId);
    setIsLoading(true);
    await loadLeaderboard(quizId);
    setIsLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getRankBadge = (position: number) => {
    return position.toString();
  };

  const getRankStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-black text-white";
      case 2:
        return "bg-black text-white";
      case 3:
        return "bg-black text-white";
      default:
        return "bg-white text-black";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
        </div>
      </div>
    );
  }

  const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white overflow-hidden">
        <div className="bg-black p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Leaderboard
          </h1>
          <p className="text-blue-100 text-center mt-2">
            {selectedQuizId ? `Top performers for "${selectedQuiz?.title}"` : "Top performers across all quizzes"}
          </p>
        </div>

        {/* Quiz Tabs */}
        <div className="bg-gray-50 border-b">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => handleTabChange(null)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedQuizId === null
                  ? "border-black text-black bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Quizzes
            </button>
            {quizzes.filter(quiz => quiz.isActive).map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleTabChange(quiz.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedQuizId === quiz.id
                    ? "border-black text-black bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {quiz.title}
              </button>
            ))}
            {quizzes.filter(quiz => quiz.isActive).length === 0 && (
              <div className="px-6 py-3 text-sm text-gray-400">
                No active quizzes available
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-white border-l-4 border-black rounded-md text-black">
            {error}
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {selectedQuizId ? `No attempts for "${selectedQuiz?.title}" yet` : "No quiz attempts yet"}
            </div>
            <p className="text-gray-400">
              {selectedQuizId 
                ? "Be the first to complete this quiz and claim the top spot!" 
                : "Be the first to complete a quiz and claim the top spot!"
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-black mb-4 text-center">
                  Top 3 Champions
                </h2>
                <div className="flex justify-center items-end space-x-4 mb-6">
                  {/* Second Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-4 mb-2 ">
                      <div className="text-2xl mb-1">2</div>
                      <div className="font-bold text-sm">{leaderboard[1].userName}</div>
                      <div className="text-xs opacity-90">{leaderboard[1].totalScore} pts</div>
                      <div className="text-xs opacity-75">⏱️ {formatTime(leaderboard[1].bestQuizTime)}</div>
                    </div>
                    <div className="text-xs text-gray-400">2nd Place</div>
                  </div>

                  {/* First Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-6 mb-2 transform scale-110">
                      <div className="text-3xl mb-2">👑</div>
                      <div className="font-bold">{leaderboard[0].userName}</div>
                      <div className="text-sm opacity-90">{leaderboard[0].totalScore} pts</div>
                      <div className="text-xs opacity-75">⏱️ {formatTime(leaderboard[0].bestQuizTime)}</div>
                    </div>
                    <div className="text-sm font-medium text-black">Champion</div>
                  </div>

                  {/* Third Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-4 mb-2 ">
                      <div className="text-2xl mb-1">3</div>
                      <div className="font-bold text-sm">{leaderboard[2].userName}</div>
                      <div className="text-xs opacity-90">{leaderboard[2].totalScore} pts</div>
                      <div className="text-xs opacity-75">⏱️ {formatTime(leaderboard[2].bestQuizTime)}</div>
                    </div>
                    <div className="text-xs text-gray-400">3rd Place</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {selectedQuizId ? "Best Score" : "Total Score"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {selectedQuizId ? "Attempts" : "Quizzes Completed"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {selectedQuizId ? "Score" : "Average Score"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Best Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {selectedQuizId ? "Last Attempt" : "Last Quiz"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => {
                    const position = index + 1;
                    return (
                      <tr key={entry.userId} className="hover:bg-white transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center justify-center w-8 h-8 text-sm font-bold ${getRankStyle(position)}`}>
                            {position <= 3 ? getRankBadge(position) : position}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-black">
                              {entry.userName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {entry.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-black">
                            {entry.totalScore}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            {entry.quizzesCompleted}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            {selectedQuizId ? entry.totalScore : entry.averageScore.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-black font-medium">
                            ⏱️ {formatTime(entry.bestQuizTime)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {formatDate(entry.lastQuizDate)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Refresh indicator */}
            <div className="text-center mt-6 text-xs text-gray-400">
              Updates automatically every 30 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
}