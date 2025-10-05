"use client";

import { useState, useEffect } from "react";
import { CrosswordPuzzle } from "@/types";
import { getAllCrosswordPuzzles } from "@/actions/firebaseActions";

interface CrosswordListProps {
    onStartPuzzle: (puzzleId: string) => void;
}

export default function CrosswordList({ onStartPuzzle }: CrosswordListProps) {
    const [puzzles, setPuzzles] = useState<CrosswordPuzzle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        loadPuzzles();
    }, []);

    const loadPuzzles = async () => {
        try {
            setIsLoading(true);
            const fetchedPuzzles = await getAllCrosswordPuzzles();
            setPuzzles(fetchedPuzzles.filter(puzzle => puzzle.isActive));
        } catch (err) {
            setError("Failed to load crossword puzzles");
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

    return (
        <div className="max-w-6xl mx-auto p-6">

            {error && (
                <div className="mb-4 p-3 bg-white border border-black rounded text-black">
                    {error}
                </div>
            )}

            {puzzles.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">No crossword puzzles available</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {puzzles.map((puzzle) => (
                        <PuzzleCard
                            key={puzzle.id}
                            puzzle={puzzle}
                            onStart={() => onStartPuzzle(puzzle.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface PuzzleCardProps {
    puzzle: CrosswordPuzzle;
    onStart: () => void;
}

function PuzzleCard({ puzzle, onStart }: PuzzleCardProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const totalPoints = puzzle.clues.reduce((sum, clue) => sum + clue.points, 0) + 5; // +5 for completion bonus
    const acrossClues = puzzle.clues.filter(clue => clue.direction === 'across').length;
    const downClues = puzzle.clues.filter(clue => clue.direction === 'down').length;

    return (
        <div className="bg-white border border-gray-300 rounded-md overflow-hidden hover: ">
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-black line-clamp-2">
                        {puzzle.title}
                    </h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-white text-black">
                        Active
                    </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {puzzle.description}
                </p>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex justify-between">
                        <span>Grid Size:</span>
                        <span className="font-medium">{puzzle.gridSize.rows} × {puzzle.gridSize.cols}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Across Clues:</span>
                        <span className="font-medium">{acrossClues}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Down Clues:</span>
                        <span className="font-medium">{downClues}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Max Points:</span>
                        <span className="font-medium">{totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{formatDate(puzzle.createdAt)}</span>
                    </div>
                </div>

                <div className="bg-white p-3 mb-4">
                    <div className="text-xs text-gray-400 space-y-1">
                        <div>• Each correct answer: 5 points</div>
                        <div>• Complete all clues: Bonus +5 points</div>
                        <div>• Challenge yourself with AI & tech questions!</div>
                    </div>
                </div>

                <button
                    onClick={onStart}
                    className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                    Start
                </button>
            </div>
        </div>
    );
}