"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Badge {
    title: string;
    description: string;
    icon: string;
    color: string;
    awardedAt: string;
}

interface Profile {
    name?: string;
    age?: number;
    gender?: string;
    bio?: string;
    goals?: string;
    preferences?: string;
}

interface Passive {
    title: string;
    description: string;
    unlockCondition?: string;
    awardedAt?: string;
}
interface Title {
    title: string;
    description: string;
    unlockCondition?: string;
    awardedAt?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>({});
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Profile>({});
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [nextLevelXPRequired, setNextLevelXPRequired] = useState(100);
    const [passives, setPassives] = useState<Passive[]>([]);
    const [titles, setTitles] = useState<Title[]>([]);
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/login");
    }

    // Function to handle token expiration
    const handleApiCall = useCallback(async (url: string, options?: RequestInit) => {
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            router.push("/login");
            return null;
        }

        return res;
    }, [router]);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            const res = await handleApiCall("/api/profile");
            if (!res) return; // Token expired, redirected to login

            const data = await res.json();
            setProfile(data.profile || {});
            setForm(data.profile || {});
            setBadges(data.badges || []);
            setXp(data.xp || 0);
            setLevel(data.level || 1);
            setNextLevelXPRequired(data.nextLevelXPRequired || 100);
            setPassives(data.passives || []);
            setTitles(data.titles || []);
            setLoading(false);
        }
        fetchProfile();
    }, [handleApiCall]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSave() {
        const res = await handleApiCall("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res) return; // Token expired, redirected to login

        setProfile(form);
        setEditMode(false);
    }

    if (loading) return <div className="text-indigo-400">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-[#18181b] via-[#232136] to-[#312e81] rounded-xl border-2 border-indigo-700/40 shadow-xl mt-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-indigo-300">My Profile</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleLogout}
                        className="rounded-full bg-red-700 text-white shadow-lg hover:bg-red-800 transition border-2 border-red-400 w-10 h-10 flex items-center justify-center text-xl"
                        title="Logout"
                    >
                        <span role="img" aria-label="logout">🚪</span>
                    </button>
                    <Link href="/" className="rounded-full bg-indigo-700 text-white shadow-lg hover:bg-indigo-800 transition border-2 border-indigo-400 w-10 h-10 flex items-center justify-center text-xl" title="Back to Home">
                        <span role="img" aria-label="back">🏠</span>
                    </Link>
                </div>
            </div>
            <div className="mb-6">
                {editMode ? (
                    <div className="space-y-3">
                        <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <input name="age" value={form.age || ""} onChange={handleChange} placeholder="Age" type="number" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <input name="gender" value={form.gender || ""} onChange={handleChange} placeholder="Gender" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <textarea name="bio" value={form.bio || ""} onChange={handleChange} placeholder="Bio" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <textarea name="goals" value={form.goals || ""} onChange={handleChange} placeholder="Goals" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <textarea name="preferences" value={form.preferences || ""} onChange={handleChange} placeholder="Preferences" className="w-full p-2 rounded bg-zinc-800 text-indigo-100" />
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold">Save</button>
                            <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div><span className="font-semibold text-indigo-200">Name:</span> {profile.name || <span className="text-zinc-400">(not set)</span>}</div>
                        <div><span className="font-semibold text-indigo-200">Age:</span> {profile.age || <span className="text-zinc-400">(not set)</span>}</div>
                        <div><span className="font-semibold text-indigo-200">Gender:</span> {profile.gender || <span className="text-zinc-400">(not set)</span>}</div>
                        <div><span className="font-semibold text-indigo-200">Bio:</span> {profile.bio || <span className="text-zinc-400">(not set)</span>}</div>
                        <div><span className="font-semibold text-indigo-200">Goals:</span> {profile.goals || <span className="text-zinc-400">(not set)</span>}</div>
                        <div><span className="font-semibold text-indigo-200">Preferences:</span> {profile.preferences || <span className="text-zinc-400">(not set)</span>}</div>
                        <button onClick={() => setEditMode(true)} className="mt-2 px-4 py-2 bg-indigo-700 text-white rounded font-bold">Edit Profile</button>
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 bg-[#232136]/80 rounded-xl p-4 border-2 border-indigo-700/40 shadow-xl flex flex-col items-center">
                    <div className="text-lg font-bold text-indigo-300">Level {level}</div>
                    <div className="text-indigo-200">XP: {xp} / {nextLevelXPRequired}</div>
                    <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (xp / nextLevelXPRequired) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-indigo-300 mt-1">
                        {nextLevelXPRequired - xp} XP to next level
                    </div>
                </div>
                <div className="flex-1 bg-[#232136]/80 rounded-xl p-4 border-2 border-indigo-700/40 shadow-xl">
                    <div className="text-lg font-bold text-indigo-300 mb-2">Passives</div>
                    {passives.length === 0 ? <div className="text-zinc-400">No passives yet.</div> : (
                        <ul className="space-y-2">
                            {passives.map((p, i) => (
                                <li key={i} className="bg-[#18181b]/80 rounded p-2 border border-purple-700/40 shadow">
                                    <div className="font-bold text-purple-300">{p.title}</div>
                                    <div className="text-indigo-100 text-xs">{p.description}</div>
                                    {p.awardedAt && <div className="text-xs text-zinc-400">Awarded: {new Date(p.awardedAt).toLocaleDateString()}</div>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex-1 bg-[#232136]/80 rounded-xl p-4 border-2 border-indigo-700/40 shadow-xl">
                    <div className="text-lg font-bold text-indigo-300 mb-2">Titles</div>
                    {titles.length === 0 ? <div className="text-zinc-400">No titles yet.</div> : (
                        <ul className="space-y-2">
                            {titles.map((t, i) => (
                                <li key={i} className="bg-[#18181b]/80 rounded p-2 border border-indigo-900/40 shadow">
                                    <div className="font-bold text-indigo-300">{t.title}</div>
                                    <div className="text-indigo-100 text-xs">{t.description}</div>
                                    {t.awardedAt && <div className="text-xs text-zinc-400">Awarded: {new Date(t.awardedAt).toLocaleDateString()}</div>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-indigo-300 mb-2">Badges</h2>
                {badges.length === 0 ? (
                    <div className="text-zinc-400">No badges yet.</div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {badges.map((badge, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center justify-center p-3 shadow-xl"
                                style={{
                                    background: 'rgba(24,24,27,0.85)',
                                    borderRadius: '50%',
                                    minWidth: 120,
                                    minHeight: 120,
                                    border: `4px solid ${badge.color}`,
                                    boxShadow: `0 0 16px 4px ${badge.color}, 0 2px 8px #0008`,
                                    position: 'relative',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                <div className="text-4xl mb-1" style={{ textShadow: `0 0 8px ${badge.color}` }}>{badge.icon}</div>
                                <div className="font-bold text-white text-sm text-center drop-shadow" style={{ textShadow: `0 0 6px ${badge.color}` }}>{badge.title}</div>
                                <div className="text-xs text-white/80 mb-1 text-center">{badge.description}</div>
                                <div className="text-xs text-white/60 absolute bottom-2 left-0 right-0 text-center">{new Date(badge.awardedAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
