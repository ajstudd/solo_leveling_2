import React, { useEffect, useState } from "react";
import { GiScrollUnfurled, GiTargetPrize, GiUpgrade, GiMagicSwirl } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

const questIcons = [
    <GiScrollUnfurled key="scroll" className="text-xl text-indigo-300 mr-2" />,
    <GiTargetPrize key="target" className="text-xl text-yellow-300 mr-2" />,
    <GiUpgrade key="upgrade" className="text-xl text-green-300 mr-2" />,
    <GiMagicSwirl key="magic" className="text-xl text-pink-300 mr-2" />,
];

interface GeminiSections {
    questlines: string;
    passives: string;
    metrics: string;
    reportTemplate: string;
    xpSystem: string;
    titles: string;
    full: string;
}

interface QuestPanelProps {
    stats: Record<string, number>;
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-gradient-to-br from-[#232136] to-[#312e81] rounded-xl p-4 mb-4 border border-indigo-700/40 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-indigo-200 font-bold text-lg">
                {icon}
                {title}
            </div>
            <div className="text-indigo-100 whitespace-pre-line text-sm max-h-48 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

export default function QuestPanel({ stats }: QuestPanelProps) {
    const [sections, setSections] = useState<GeminiSections | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState("");

    function refreshQuests() {
        setRefreshKey((k) => k + 1);
    }

    useEffect(() => {
        if (!stats || Object.keys(stats).length === 0) return;
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        fetch("/api/quests", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setSections(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [stats, refreshKey]);

    return (
        <div className="flex-1 bg-[#18181b]/80 rounded-xl p-6 border-2 border-indigo-700/40 shadow-xl min-w-[320px] max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-indigo-300 tracking-wide">RPG Quest System</div>
                <button
                    onClick={refreshQuests}
                    className="ml-2 px-2 py-1 rounded bg-indigo-700 text-white font-bold hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 transition text-xs"
                >
                    Refresh
                </button>
            </div>
            {loading ? (
                <div className="text-indigo-400 animate-pulse">Loading quests...</div>
            ) : error ? (
                <div className="text-pink-400 font-bold">{error}</div>
            ) : sections ? (
                <>
                    <SectionCard title="Questlines" icon={questIcons[0]}>{sections.questlines}</SectionCard>
                    <SectionCard title="Passive Abilities" icon={questIcons[1]}>{sections.passives}</SectionCard>
                    <SectionCard title="Metrics to Track" icon={questIcons[2]}>{sections.metrics}</SectionCard>
                    <SectionCard title="Weekly Progress Report Template" icon={questIcons[3]}>{sections.reportTemplate}</SectionCard>
                    <SectionCard title="XP & Leveling System" icon={questIcons[0]}>{sections.xpSystem}</SectionCard>
                    <SectionCard title="Title System" icon={questIcons[1]}>{sections.titles}</SectionCard>
                </>
            ) : (
                <div className="text-zinc-400">No quests yet.</div>
            )}
        </div>
    );
}
