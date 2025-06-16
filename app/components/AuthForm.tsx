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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] overflow-hidden">
            {/* Anime-style glowing magic circle background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <svg width="500" height="500" viewBox="0 0 500 500" className="opacity-30 animate-pulse">
                    <defs>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="250" cy="250" r="200" fill="url(#glow)" />
                    <circle cx="250" cy="250" r="170" stroke="#818cf8" strokeWidth="2" fill="none" opacity="0.5" />
                    <circle cx="250" cy="250" r="140" stroke="#a21caf" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
            </div>
            <Form.Root
                className="relative z-10 bg-gradient-to-br from-[#18181b]/90 to-[#312e81]/90 p-10 rounded-2xl shadow-2xl w-full max-w-md border-2 border-indigo-700/60 backdrop-blur-md animate-fade-in"
                onSubmit={handleSubmit}
            >
                <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-200 drop-shadow-glow tracking-widest font-sans">
                    {mode === "login" ? "SOLO LEVELING LOGIN" : "SOLO LEVELING REGISTER"}
                </h2>
                <Form.Field name="email" className="mb-6">
                    <Form.Label className="block text-indigo-300 mb-1 font-semibold tracking-wide">Email</Form.Label>
                    <div className="flex items-center bg-[#232136] rounded-lg px-3 border border-indigo-700/40 focus-within:border-indigo-400 transition">
                        <FaUser className="text-indigo-400 mr-2" />
                        <Form.Control asChild>
                            <input
                                type="email"
                                name="email"
                                required
                                className="bg-transparent outline-none py-2 w-full text-indigo-100 placeholder-indigo-400 font-medium"
                                autoComplete="email"
                                placeholder="Enter your email"
                            />
                        </Form.Control>
                    </div>
                </Form.Field>
                <Form.Field name="password" className="mb-8">
                    <Form.Label className="block text-indigo-300 mb-1 font-semibold tracking-wide">Password</Form.Label>
                    <div className="flex items-center bg-[#232136] rounded-lg px-3 border border-indigo-700/40 focus-within:border-indigo-400 transition">
                        <FaLock className="text-indigo-400 mr-2" />
                        <Form.Control asChild>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="bg-transparent outline-none py-2 w-full text-indigo-100 placeholder-indigo-400 font-medium"
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                placeholder="Enter your password"
                            />
                        </Form.Control>
                    </div>
                </Form.Field>
                {error && <div className="text-pink-400 mb-4 text-center font-bold animate-pulse">{error}</div>}
                <Form.Submit asChild>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-white font-extrabold text-lg tracking-widest shadow-lg hover:from-indigo-500 hover:to-pink-500 transition-all duration-200 border-2 border-indigo-400/40 hover:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-indigo-900"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : mode === "login" ? "ENTER GATE" : "AWAKEN"}
                    </button>
                </Form.Submit>
            </Form.Root>
        </div>
    );
}
