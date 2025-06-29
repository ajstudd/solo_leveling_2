"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import * as Form from "@radix-ui/react-form";
import { FaUser, FaLock } from "react-icons/fa";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [showQualificationModal, setShowQualificationModal] = React.useState(mode === "register");
    const [showRegisterForm, setShowRegisterForm] = React.useState(false);
    const [showDeathScreen, setShowDeathScreen] = React.useState(false);
    const [deathTimer, setDeathTimer] = React.useState(10);
    const [showFlatline, setShowFlatline] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        if (showDeathScreen && deathTimer > 0) {
            const timer = setTimeout(() => {
                setDeathTimer(deathTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showDeathScreen && deathTimer === 0) {
            setShowFlatline(true);
        }
    }, [showDeathScreen, deathTimer]);

    const handleAcceptQualification = () => {
        setShowQualificationModal(false);
        setShowRegisterForm(true);
    };

    const handleRejectQualification = () => {
        setShowQualificationModal(false);
        setShowDeathScreen(true);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Unknown error");
            localStorage.setItem("token", data.token);
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    // Death screen flatline effect
    if (showFlatline) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-full h-1 bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
            </div>
        );
    }

    // Death countdown screen
    if (showDeathScreen) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl font-bold mb-8 animate-death-pulse">
                        SYSTEM PENALTY
                    </div>
                    <div className="text-red-400 text-2xl mb-4">
                        Your heart will stop in
                    </div>
                    <div className="text-red-500 text-8xl font-bold animate-heartbeat">
                        {deathTimer}
                    </div>
                    <div className="text-red-400 text-xl mt-4">
                        seconds
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-[#0a0f1c] via-[#1a237e] to-[#0d47a1] overflow-hidden">
            {/* Enhanced Solo Leveling style glowing magic circle background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <svg width="600" height="600" viewBox="0 0 600 600" className="opacity-40 animate-pulse">
                    <defs>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#2196f3" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#1976d2" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0d47a1" stopOpacity="0" />
                        </radialGradient>
                        <filter id="blueGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle cx="300" cy="300" r="250" fill="url(#glow)" />
                    <circle cx="300" cy="300" r="200" stroke="#2196f3" strokeWidth="3" fill="none" opacity="0.6" filter="url(#blueGlow)" />
                    <circle cx="300" cy="300" r="170" stroke="#1976d2" strokeWidth="2" fill="none" opacity="0.4" />
                    <circle cx="300" cy="300" r="140" stroke="#0d47a1" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
            </div>

            {/* Qualification Modal */}
            {showQualificationModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative max-w-2xl w-full mx-4">
                        {/* Neon glow effects */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

                        {/* Main modal */}
                        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] p-8 rounded-2xl border-4 border-blue-400/60 shadow-2xl shadow-blue-500/50 animate-modal-glow">
                            {/* Animated border effect */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-pulse"></div>

                            {/* Content */}
                            <div className="text-center space-y-6">
                                <div className="text-4xl font-bold text-blue-100 mb-6 tracking-wider animate-pulse">
                                    ⚡ SYSTEM NOTIFICATION ⚡
                                </div>

                                <div className="text-2xl text-blue-200 font-semibold leading-relaxed">
                                    You have acquired the qualification to be a <span className="text-cyan-300 font-bold">Player</span>.
                                </div>

                                <div className="text-3xl text-blue-100 font-bold animate-pulse py-4">
                                    Will you accept?
                                </div>

                                <div className="text-lg text-blue-300 opacity-80 mb-8">
                                    Warning: Refusal will result in immediate termination.
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-6 justify-center pt-4">
                                    <button
                                        onClick={handleAcceptQualification}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xl rounded-xl border-2 border-blue-400 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transform hover:scale-105"
                                    >
                                        ACCEPT
                                    </button>
                                    <button
                                        onClick={handleRejectQualification}
                                        className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl border-2 border-red-400 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-400/50 transform hover:scale-105"
                                    >
                                        REFUSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Login form or Register form after acceptance */}
            {(mode === "login" || showRegisterForm) && (
                <Form.Root
                    className="relative z-10 bg-gradient-to-br from-[#18181b]/90 to-[#1976d2]/90 p-10 rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-500/60 backdrop-blur-md animate-fade-in"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-200 drop-shadow-glow tracking-widest font-sans">
                        {mode === "login" ? "LOGIN" : "REGISTER"}
                    </h2>
                    <Form.Field name="email" className="mb-6">
                        <Form.Label className="block text-blue-300 mb-1 font-semibold tracking-wide">Email</Form.Label>
                        <div className="flex items-center bg-[#232136] rounded-lg px-3 border border-blue-500/40 focus-within:border-blue-400 transition">
                            <FaUser className="text-blue-400 mr-2" />
                            <Form.Control asChild>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="bg-transparent outline-none py-2 w-full text-blue-100 placeholder-blue-400 font-medium"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                />
                            </Form.Control>
                        </div>
                    </Form.Field>
                    <Form.Field name="password" className="mb-8">
                        <Form.Label className="block text-blue-300 mb-1 font-semibold tracking-wide">Password</Form.Label>
                        <div className="flex items-center bg-[#232136] rounded-lg px-3 border border-blue-500/40 focus-within:border-blue-400 transition">
                            <FaLock className="text-blue-400 mr-2" />
                            <Form.Control asChild>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="bg-transparent outline-none py-2 w-full text-blue-100 placeholder-blue-400 font-medium"
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    placeholder="Enter your password"
                                />
                            </Form.Control>
                        </div>
                    </Form.Field>
                    {error && <div className="text-red-400 mb-4 text-center font-bold animate-pulse">{error}</div>}
                    <Form.Submit asChild>
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-extrabold text-lg tracking-widest shadow-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 border-2 border-blue-400/40 hover:border-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : mode === "login" ? "ENTER GATE" : "AWAKEN AS PLAYER"}
                        </button>
                    </Form.Submit>

                    <div className="mt-6 text-center">
                        {mode === "login" ? (
                            <p className="text-blue-300 text-sm">
                                Don&apos;t have an account?{" "}
                                <a href="/register" className="text-blue-400 hover:text-blue-200 font-semibold underline transition">
                                    Become a Player
                                </a>
                            </p>
                        ) : (
                            <p className="text-blue-300 text-sm">
                                Already a Player?{" "}
                                <a href="/login" className="text-blue-400 hover:text-blue-200 font-semibold underline transition">
                                    Enter the Gate
                                </a>
                            </p>
                        )}
                    </div>
                </Form.Root>
            )}
        </div>
    );
}
