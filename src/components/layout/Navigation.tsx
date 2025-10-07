"use client";

import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'quizzes', label: 'Take Quizzes' },
        // { id: 'crossword', label: 'Crossword Puzzle' },
        // { id: 'manage', label: 'Manage Quizzes' },
        { id: 'leaderboard', label: 'Quiz Leaderboard' },
        // { id: 'crossword-leaderboard', label: 'Crossword Leaderboard' },
    ];

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onViewChange(item.id)}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${currentView === item.id
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-400 hover:border-black'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        {user && (
                            <>
                                <div className="text-sm text-gray-400">
                                    Welcome, <span className="font-medium">{user.full_name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden flex items-center">
                        <button
                            onClick={logout}
                            className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${currentView === item.id
                                    ? 'bg-white border-black text-black'
                                    : 'text-gray-400 hover:text-black rounded-md hover:bg-white'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {user && (
                        <div className="pt-4 pb-3 border-t border-gray-300">
                            <div className="px-3 text-sm text-gray-400">
                                Logged in as <span className="font-medium">{user.full_name}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}