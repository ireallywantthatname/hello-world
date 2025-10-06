"use client";

import { useState, useEffect, useCallback } from "react";
import { CrosswordPuzzle, CrosswordClue, CrosswordAttempt } from "@/types";
import { getCrosswordPuzzle, submitCrosswordAttempt, validateCrosswordAnswers } from "@/actions/firebaseActions";
import { useAuth } from "@/contexts/AuthContext";
import { createCrosswordGridWithAnswers, getClueNumbers } from "@/data/crosswordData";

interface CrosswordGameProps {
  puzzleId: string;
  onComplete: (attempt: CrosswordAttempt) => void;
  onExit: () => void;
}

export default function CrosswordGame({ puzzleId, onComplete, onExit }: CrosswordGameProps) {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({});
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const { user } = useAuth();

  const loadPuzzle = useCallback(async () => {
    try {
      const fetchedPuzzle = await getCrosswordPuzzle(puzzleId);
      if (fetchedPuzzle) {
        setPuzzle(fetchedPuzzle);
        // Initialize user answers
        const initialAnswers: Record<string, string> = {};
        fetchedPuzzle.clues.forEach(clue => {
          initialAnswers[clue.id] = "";
        });
        setUserAnswers(initialAnswers);
      }
    } catch (err) {
      console.error("Error loading puzzle:", err);
    }
  }, [puzzleId]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  // Update grid when puzzle or userAnswers change
  useEffect(() => {
    if (puzzle) {
      const newGrid = createCrosswordGridWithAnswers(puzzle, userAnswers);
      setGrid(newGrid);
    }
  }, [puzzle, userAnswers]);

  const handleAnswerChange = (clueId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [clueId]: answer.toUpperCase()
    }));
  };

  const calculateScore = async () => {
    if (!puzzle) return { score: 0, maxScore: 0, isComplete: false };

    try {
      const validation = await validateCrosswordAnswers(userAnswers);
      setCorrectAnswers(validation.correctAnswers);
      return validation;
    } catch (error) {
      console.error("Error validating answers:", error);
      return { score: 0, maxScore: 0, isComplete: false };
    }
  };

  const handleSubmit = async () => {
    if (!puzzle || !user) return;

    setIsSubmitting(true);
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const { score, maxScore, isComplete } = await calculateScore();

    try {
      const attemptData = {
        userId: user.id,
        puzzleId: puzzle.id,
        answers: userAnswers,
        score,
        maxScore,
        timeSpent,
        isComplete,
        completedAt: new Date(),
      };

      const attempt = await submitCrosswordAttempt(attemptData);
      if (attempt) {
        onComplete(attempt);
      }
    } catch (err) {
      console.error("Error submitting crossword attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!puzzle) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
      </div>
    );
  }

  const numbers = getClueNumbers(puzzle);
  const acrossClues = puzzle.clues.filter(clue => clue.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = puzzle.clues.filter(clue => clue.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black">{puzzle.title}</h1>
            <p className="text-gray-400 mt-2">{puzzle.description}</p>
          </div>
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-black transition-colors px-4 py-2 border border-gray-300 rounded-md "
          >
            Exit Puzzle
          </button>
        </div>
        <div className="text-sm text-gray-400">
          <p>• Each correct answer: 5 points</p>
          <p>• Complete all clues correctly: Extra 5 points</p>
          <p>• Total possible points: {puzzle.clues.length * 5 + 5}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crossword Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Crossword Grid</h2>
            <div className="inline-block border-2 border-gray-800">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => {
                    const number = numbers[rowIndex][colIndex];
                    const isBlack = cell === null;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-8 h-8 border border-gray-400 relative ${isBlack ? 'bg-black' : 'bg-white'
                          }`}
                      >
                        {!isBlack && (
                          <>
                            {number && (
                              <span className="absolute top-0 left-0 text-xs font-bold text-gray-400">
                                {number}
                              </span>
                            )}
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm font-bold text-black">
                                {cell}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clues Section */}
        <div className="space-y-6">
          {/* Across Clues */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Across</h3>
            <div className="space-y-4">
              {acrossClues.map((clue) => (
                <div key={clue.id} className="border-b border-gray-300 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-black">{clue.number}.</span>
                    <span className="text-xs text-gray-400">{clue.points}pts</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{clue.clue}</p>
                  <input
                    type="text"
                    value={userAnswers[clue.id] || ''}
                    onChange={(e) => handleAnswerChange(clue.id, e.target.value)}
                    placeholder={`${clue.length} letters`}
                    maxLength={clue.length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
                  />
                  {correctAnswers[clue.id] && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      ✓ Correct!
                    </div>
                  )}
                  {correctAnswers[clue.id] === false && userAnswers[clue.id] && (
                    <div className="text-red-600 text-xs mt-1 flex items-center">
                      ✗ Incorrect
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Down Clues */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Down</h3>
            <div className="space-y-4">
              {downClues.map((clue) => (
                <div key={clue.id} className="border-b border-gray-300 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-black">{clue.number}.</span>
                    <span className="text-xs text-gray-400">{clue.points}pts</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{clue.clue}</p>
                  <input
                    type="text"
                    value={userAnswers[clue.id] || ''}
                    onChange={(e) => handleAnswerChange(clue.id, e.target.value)}
                    placeholder={`${clue.length} letters`}
                    maxLength={clue.length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
                  />
                  {correctAnswers[clue.id] && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      ✓ Correct!
                    </div>
                  )}
                  {correctAnswers[clue.id] === false && userAnswers[clue.id] && (
                    <div className="text-red-600 text-xs mt-1 flex items-center">
                      ✗ Incorrect
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    const validation = await validateCrosswordAnswers(userAnswers);
                    setCorrectAnswers(validation.correctAnswers);
                  } catch (error) {
                    console.error("Error checking answers:", error);
                  }
                }}
                className="w-full bg-gray-100 text-gray-800 rounded-md py-2 px-6 hover:bg-gray-200 transition-colors font-medium"
              >
                Check Answers
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black text-white rounded-md py-3 px-6 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? "Submitting..." : "Submit Puzzle"}
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Correct answers:</span>
                <span>{Object.values(correctAnswers).filter(Boolean).length} / {puzzle.clues.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}