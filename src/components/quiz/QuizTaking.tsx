"use client";

import { useState, useEffect, useCallback } from "react";
import { Quiz, QuizAttempt } from "@/types";
import { getQuiz, submitQuizAttempt } from "@/actions/firebaseActions";
import { useAuth } from "@/contexts/AuthContext";

interface QuizTakingProps {
    quizId: string;
    onQuizComplete: (attempt: QuizAttempt) => void;
    onExit: () => void;
}

export default function QuizTaking({ quizId, onQuizComplete, onExit }: QuizTakingProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime] = useState(Date.now());
    const { user } = useAuth();

    const loadQuiz = useCallback(async () => {
        try {
            const fetchedQuiz = await getQuiz(quizId);
            if (fetchedQuiz) {
                setQuiz(fetchedQuiz);
            }
        } catch (err) {
            console.error("Error loading quiz:", err);
        }
    }, [quizId]);

    useEffect(() => {
        loadQuiz();
    }, [loadQuiz]);

    const calculateScore = useCallback(() => {
        if (!quiz) return { score: 0, maxScore: 0 };

        let score = 0;
        let maxScore = 0;

        quiz.questions.forEach(question => {
            maxScore += question.points;
            const selectedAnswerId = answers[question.id];

            if (selectedAnswerId) {
                const selectedAnswer = question.answers.find(answer => answer.id === selectedAnswerId);
                if (selectedAnswer?.isCorrect) {
                    score += question.points;
                }
            }
        });

        return { score, maxScore };
    }, [quiz, answers]);

    const handleSubmitQuiz = useCallback(async () => {
        if (!quiz || !user) return;

        setIsSubmitting(true);
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000);
        const { score, maxScore } = calculateScore();

        try {
            const attemptData = {
                userId: user.id,
                quizId: quiz.id,
                answers,
                score,
                maxScore,
                timeSpent,
                completedAt: new Date(),
            };

            const attempt = await submitQuizAttempt(attemptData);
            if (attempt) {
                onQuizComplete(attempt);
            }
        } catch (err) {
            console.error("Error submitting quiz:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [quiz, user, startTime, answers, onQuizComplete, calculateScore]);

    useEffect(() => {
        if (quiz?.duration) {
            setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
        }
    }, [quiz]);

    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft <= 0) {
            handleSubmitQuiz();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleSubmitQuiz]);

    const handleAnswerSelect = (questionId: string, answerId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const goToNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const isLastQuestion = quiz ? currentQuestionIndex === quiz.questions.length - 1 : false;
    const isFirstQuestion = currentQuestionIndex === 0;

    if (!quiz) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswerId = answers[currentQuestion.id];

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-black">{quiz.title}</h1>
                    <button
                        onClick={onExit}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        Exit Quiz
                    </button>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    {timeLeft !== null && (
                        <div className={`font-medium ${timeLeft < 300 ? 'text-black' : 'text-gray-400'}`}>
                            Time left: {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white h-2 mt-3">
                    <div
                        className="bg-black rounded-full h-2 transition-all duration-300"
                        style={{
                            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg p-6 mb-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-black mb-2">
                        {currentQuestion.text}
                    </h2>
                    <div className="text-sm text-gray-400">
                        Points: {currentQuestion.points}
                        {currentQuestion.timeLimit && (
                            <span className="ml-4">Time limit: {currentQuestion.timeLimit}s</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {currentQuestion.answers.map((answer) => (
                        <label
                            key={answer.id}
                            className={`flex items-center p-4 border cursor-pointer transition-colors ${selectedAnswerId === answer.id
                                ? 'border-black bg-white'
                                : 'border-gray-300 hover:border-black'
                                }`}
                        >
                            <input
                                type="radio"
                                name={`question-${currentQuestion.id}`}
                                value={answer.id}
                                checked={selectedAnswerId === answer.id}
                                onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                                className="w-4 h-4 rounded-full text-black"
                            />
                            <span className="ml-3 text-black">{answer.text}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={goToPreviousQuestion}
                    disabled={isFirstQuestion}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <div className="flex space-x-3">
                    {!isLastQuestion ? (
                        <button
                            onClick={goToNextQuestion}
                            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    )}
                </div>
            </div>

            {/* Question navigator */}
            <div className="mt-6 bg-white rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Question Navigator</h3>
                <div className="flex flex-wrap gap-2">
                    {quiz.questions.map((question, index) => (
                        <button
                            key={question.id}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-8 h-8 text-xs font-medium transition-colors ${index === currentQuestionIndex
                                ? 'bg-black text-white'
                                : answers[question.id]
                                    ? 'bg-white text-black border border-gray-300 rounded-md'
                                    : 'bg-white text-gray-400 border border-gray-300 rounded-md'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}