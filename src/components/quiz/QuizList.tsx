"use client";

import { useState, useEffect } from "react";
import { Quiz } from "@/types";
import { getAllQuizzes, deleteQuiz } from "@/actions/firebaseActions";
import { useAuth } from "@/contexts/AuthContext";

interface QuizListProps {
    onEditQuiz: (quiz: Quiz) => void;
    onCreateNewQuiz: () => void;
}

export default function QuizList({ onEditQuiz, onCreateNewQuiz }: QuizListProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const { user } = useAuth();

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            setIsLoading(true);
            const fetchedQuizzes = await getAllQuizzes();
            setQuizzes(fetchedQuizzes);
        } catch (err) {
            setError("Failed to load quizzes");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            return;
        }

        try {
            const success = await deleteQuiz(quizId);
            if (success) {
                setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
            } else {
                setError("Failed to delete quiz");
            }
        } catch (err) {
            setError("Failed to delete quiz");
            console.error(err);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Quiz Management</h2>
                <button
                    onClick={onCreateNewQuiz}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    Create New Quiz
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-white border border-black rounded text-black">
                    {error}
                </div>
            )}

            {quizzes.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">No quizzes found</div>
                    <button
                        onClick={onCreateNewQuiz}
                        className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Create Your First Quiz
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onEdit={() => onEditQuiz(quiz)}
                            onDelete={() => handleDeleteQuiz(quiz.id)}
                            canEdit={user?.id === quiz.createdBy}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface QuizCardProps {
    quiz: Quiz;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
}

function QuizCard({ quiz, onEdit, onDelete, canEdit }: QuizCardProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);

    return (
        <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-black line-clamp-2">
                        {quiz.title}
                    </h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${quiz.isActive
                        ? 'bg-white text-black'
                        : 'bg-white text-black'
                        }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

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

                {canEdit && (
                    <div className="flex space-x-2">
                        <button
                            onClick={onEdit}
                            className="flex-1 px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}