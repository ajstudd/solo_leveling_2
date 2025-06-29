"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FaUser, FaHeart, FaRunning, FaBrain, FaEye, FaArrowRight, FaArrowLeft } from "react-icons/fa";

interface SetupQuestion {
    stat: string;
    question: string;
    icon: React.ReactNode;
    color: string;
}

interface SetupModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const STAT_ICONS = {
    strength: <FaUser className="text-2xl" />,
    vitality: <FaHeart className="text-2xl" />,
    agility: <FaRunning className="text-2xl" />,
    intelligence: <FaBrain className="text-2xl" />,
    perception: <FaEye className="text-2xl" />,
};

const STAT_DESCRIPTIONS = {
    strength: "Physical power, lifting ability, muscle endurance, and manual labor capacity",
    vitality: "Health, energy levels, stamina, recovery speed, and stress resistance",
    agility: "Coordination, reflexes, flexibility, balance, and movement speed",
    intelligence: "Learning ability, problem-solving, analytical thinking, and knowledge retention",
    perception: "Awareness, observation skills, intuition, attention to detail, and environmental sensitivity",
};

const STAT_COLORS = {
    strength: "#ef4444", // red
    vitality: "#22c55e", // green
    agility: "#3b82f6", // blue
    intelligence: "#a855f7", // purple
    perception: "#f59e0b", // amber
};

export default function SetupModal({ isOpen, onComplete }: SetupModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [questions, setQuestions] = useState<SetupQuestion[]>([]);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Fetch setup questions
            fetch("/api/setup")
                .then(res => res.json())
                .then(data => {
                    if (data.questions) {
                        const questionArray = Object.entries(data.questions).map(([stat, question]) => ({
                            stat,
                            question: question as string,
                            icon: STAT_ICONS[stat as keyof typeof STAT_ICONS],
                            color: STAT_COLORS[stat as keyof typeof STAT_COLORS],
                        }));
                        setQuestions(questionArray);
                    }
                })
                .catch(() => setError("Failed to load setup questions"));
        }
    }, [isOpen]);

    function handleResponseChange(value: string) {
        if (questions[currentStep]) {
            setResponses(prev => ({
                ...prev,
                [questions[currentStep].stat]: value
            }));
        }
    }

    function goToNext() {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }

    function goToPrevious() {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }

    async function handleSubmit() {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            // Format responses for backend
            const formattedResponses: Record<string, { question: string; answer: string }> = {};
            questions.forEach(q => {
                formattedResponses[q.stat] = {
                    question: q.question,
                    answer: responses[q.stat] || ""
                };
            });

            const res = await fetch("/api/setup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ responses: formattedResponses }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Setup failed");
            }

            // Show success message briefly before completing
            setError("");
            setLoading(false);

            // Wait a moment to show the success, then complete
            setTimeout(() => {
                onComplete();
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Setup failed");
        } finally {
            setLoading(false);
        }
    }

    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;
    const canProceed = currentQuestion && responses[currentQuestion.stat]?.trim().length > 0;

    if (!isOpen) return null;

    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
                <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-br from-[#18181b] via-[#232136] to-[#312e81] rounded-xl p-8 max-w-2xl w-full border-2 border-indigo-700/40 shadow-2xl max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <Dialog.Title className="text-3xl font-bold text-indigo-300 mb-2">
                                Welcome to the Hunter Assessment!
                            </Dialog.Title>
                            <Dialog.Description className="text-indigo-200 text-lg">
                                Before you begin your journey, we need to evaluate your current abilities across five core stats. Answer honestly - this will determine your starting power level and unlock quests tailored to your strengths.
                            </Dialog.Description>

                            {/* Progress Bar */}
                            <div className="mt-6 flex items-center justify-center gap-2">
                                {questions.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-all ${index <= currentStep
                                                ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50'
                                                : 'bg-zinc-700'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="text-indigo-300 text-sm mt-2">
                                Step {currentStep + 1} of {questions.length}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                                <div className="text-red-200 font-bold">{error}</div>
                            </div>
                        )}

                        {currentQuestion && (
                            <div className="space-y-6">
                                {/* Current Question */}
                                <div className="bg-[#232136]/80 rounded-xl p-6 border-2 border-indigo-700/40">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className="p-3 rounded-full flex items-center justify-center shadow-lg"
                                            style={{
                                                backgroundColor: `${currentQuestion.color}20`,
                                                color: currentQuestion.color,
                                                border: `2px solid ${currentQuestion.color}40`
                                            }}
                                        >
                                            {currentQuestion.icon}
                                        </div>
                                        <div>
                                            <h3
                                                className="text-xl font-bold capitalize"
                                                style={{ color: currentQuestion.color }}
                                            >
                                                {currentQuestion.stat}
                                            </h3>
                                            <div className="text-indigo-300 text-sm">
                                                {STAT_DESCRIPTIONS[currentQuestion.stat as keyof typeof STAT_DESCRIPTIONS]}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-indigo-200 mb-4 leading-relaxed">
                                        {currentQuestion.question}
                                    </div>

                                    <textarea
                                        value={responses[currentQuestion.stat] || ""}
                                        onChange={(e) => handleResponseChange(e.target.value)}
                                        placeholder="Be specific! Share examples and details about your abilities..."
                                        className="w-full h-40 p-4 rounded-lg bg-[#18181b]/80 border-2 border-indigo-700/40 text-indigo-100 placeholder-indigo-400 focus:border-indigo-500 focus:outline-none resize-none"
                                        maxLength={800}
                                    />

                                    <div className="text-right text-indigo-400 text-xs mt-2">
                                        {responses[currentQuestion.stat]?.length || 0}/800 characters
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={currentStep === 0}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaArrowLeft />
                                        Previous
                                    </button>

                                    {isLastStep ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!canProceed || loading}
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                        >
                                            {loading ? "Processing..." : "Complete Setup"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={goToNext}
                                            disabled={!canProceed}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next
                                            <FaArrowRight />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {questions.length === 0 && !error && (
                            <div className="text-center text-indigo-400 animate-pulse">
                                Loading assessment questions...
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
