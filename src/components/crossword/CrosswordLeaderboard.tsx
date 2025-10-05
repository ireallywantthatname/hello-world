"use client";

import { useState, useEffect } from "react";
import { CrosswordLeaderboardEntry } from "@/types";
import { getCrosswordLeaderboard } from "@/actions/firebaseActions";

export default function CrosswordLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<CrosswordLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadLeaderboard();

    // Set up interval to refresh leaderboard every 30 seconds for realtime updates
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getCrosswordLeaderboard(20); // Get top 20 users
      setLeaderboard(data);
      setError("");
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white overflow-hidden">
        <div className="bg-black p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Crossword Leaderboard
          </h1>
          <p className="text-purple-100 text-center mt-2">
            IEEE Day 2025 Tech Challenge Champions
          </p>
        </div>

        {error && (
          <div className="p-4 bg-white border-l-4 border-black rounded-md text-black">
            {error}
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No crossword attempts yet</div>
            <p className="text-gray-400">Be the first to complete the IEEE Day crossword puzzle!</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-black mb-4 text-center">
                  Top 3 Puzzle Masters
                </h2>
                <div className="flex justify-center items-end space-x-4 mb-6">
                  {/* Second Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-4 mb-2 ">
                      <div className="text-2xl mb-1">2</div>
                      <div className="font-bold text-sm">{leaderboard[1].userName}</div>
                      <div className="text-xs opacity-90">{leaderboard[1].totalScore} pts</div>
                    </div>
                    <div className="text-xs text-gray-400">2nd Place</div>
                  </div>

                  {/* First Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-6 mb-2 transform scale-110">
                      <div className="text-3xl mb-2">👑</div>
                      <div className="font-bold">{leaderboard[0].userName}</div>
                      <div className="text-sm opacity-90">{leaderboard[0].totalScore} pts</div>
                    </div>
                    <div className="text-sm font-medium text-black">Puzzle Master</div>
                  </div>

                  {/* Third Place */}
                  <div className="text-center">
                    <div className="bg-black text-white rounded-md p-4 mb-2 ">
                      <div className="text-2xl mb-1">3</div>
                      <div className="font-bold text-sm">{leaderboard[2].userName}</div>
                      <div className="text-xs opacity-90">{leaderboard[2].totalScore} pts</div>
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
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Puzzles Completed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Puzzle
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
                            {entry.puzzlesCompleted}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            {entry.averageScore.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {formatDate(entry.lastPuzzleDate)}
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