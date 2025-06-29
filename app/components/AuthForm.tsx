"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import * as Form from "@radix-ui/react-form";
import { FaUser, FaLock } from "react-icons/fa";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const router = useRouter();

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
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <circle cx="300" cy="300" r="250" fill="url(#glow)" />
                    <circle cx="300" cy="300" r="200" stroke="#2196f3" strokeWidth="3" fill="none" opacity="0.6" filter="url(#blueGlow)" />
                    <circle cx="300" cy="300" r="170" stroke="#1976d2" strokeWidth="2" fill="none" opacity="0.4" />
                    <circle cx="300" cy="300" r="140" stroke="#0d47a1" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
            </div>
            
            {mode === "register" && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 text-center animate-bounce">
                    <div className="bg-gradient-to-br from-[#1976d2]/95 to-[#0d47a1]/95 p-6 rounded-xl border-2 border-blue-400/60 backdrop-blur-md shadow-2xl max-w-lg mx-auto mb-8 animate-pulse">
                        <div className="text-2xl font-bold text-blue-100 mb-4 tracking-wide">
                            🎮 SYSTEM NOTIFICATION
                        </div>
                        <div className="text-lg text-blue-200 mb-3 font-semibold">
                            You have acquired the qualification to be a Player.
                        </div>
                        <div className="text-xl text-blue-100 font-bold animate-pulse">
                            Will you accept?
                        </div>
                        <div className="mt-4 text-sm text-blue-300 opacity-75">
                            Create your account below to begin your journey
                        </div>
                    </div>
                </div>
            )}
            
            <Form.Root
                className={`relative z-10 bg-gradient-to-br from-[#18181b]/90 to-[#1976d2]/90 p-10 rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-500/60 backdrop-blur-md animate-fade-in ${mode === "register" ? "mt-72" : ""}`}
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
        </div>
    );
}
