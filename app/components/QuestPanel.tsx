import React, { useEffect, useState } from "react";
import * as Tabs from '@radix-ui/react-tabs';
import { FaCheckCircle } from "react-icons/fa";
import * as Dialog from '@radix-ui/react-dialog';
import { useAuthenticatedFetch } from "@/lib/hooks/useAuthenticatedFetch";

interface GeminiQuest {
    title: string;
    subtitle: string;
    description: string;
    instructions: string;
    rewards: { type: string; value: string }[];
    priority: string;
    category: string;
    proof: string;
    unlockCondition?: string | null;
}

interface GeminiQuestline {
    stat: string;
    title: string;
    description: string;
    quests: GeminiQuest[];
}

interface GeminiPassive {
    title: string;
    description: string;
    unlockCondition: string;
}

interface GeminiTitle {
    title: string;
    description: string;
    unlockCondition: string;
}

interface GeminiSections {
    questlines: GeminiQuestline[];
    passives: GeminiPassive[];
    metrics: string[];
    reportTemplate: string;
    xpSystem: string;
    titles: GeminiTitle[];
}

interface CompletedQuestItem {
    questTitle: string;
    questDescription?: string;
    completedAt: string;
    rewards: { type: string; value: string }[];
}

interface QuestPanelProps {
    stats: Record<string, number>;
    onUserDataChange?: () => void;
}

export default function QuestPanel({ stats, onUserDataChange }: QuestPanelProps) {
    const [sections, setSections] = useState<GeminiSections | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState("");
    const [showFocusModal, setShowFocusModal] = useState(false);
    const [pendingQuest, setPendingQuest] = useState<GeminiQuest | null>(null);
    const [focusStat, setFocusStat] = useState<string>("");
    const [completed, setCompleted] = useState<CompletedQuestItem[]>([]);
    const statOptions = ["strength", "vitality", "agility", "intelligence", "perception"];
    const authenticatedFetch = useAuthenticatedFetch();

    function refreshQuests() {
        setRefreshKey((k) => k + 1);
    }

    useEffect(() => {
        if (!stats || Object.keys(stats).length === 0) return;
        setLoading(true);
        setError("");

        // Fetch quests
        authenticatedFetch("/api/quests")
            .then((res) => {
                if (!res) return; // Token expired, redirected to login
                return res.json();
            })
            .then((data) => {
                if (!data) return; // Token expired, redirected to login
                if (data.error) throw new Error(data.error);
                setSections(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        // Fetch completed quests
        authenticatedFetch("/api/quests/completed")
            .then((res) => {
                if (!res) return; // Token expired, redirected to login
                return res.json();
            })
            .then((data) => {
                if (!data) return; // Token expired, redirected to login
                if (Array.isArray(data)) setCompleted(data);
            })
            .catch(() => setCompleted([]));
    }, [stats, refreshKey, authenticatedFetch]);

    async function handleQuestComplete(quest: GeminiQuest) {
        // Parse stat gains from rewards
        const statGains = (quest.rewards || [])
            .filter(r => r.type === "Stat")
            .map(r => {
                const match = r.value.match(/([A-Za-z]+)\s*\+([0-9]+)/); // allow optional space
                if (match) {
                    return { stat: match[1].toLowerCase(), amount: parseInt(match[2], 10) };
                }
                return null;
            })
            .filter(Boolean) as { stat: string; amount: number }[];

        // Call backend to update stats and completedQuests
        const res = await authenticatedFetch("/api/quests/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questTitle: quest.title,
                questDescription: quest.description,
                rewards: quest.rewards,
                statGains
            }),
        });

        if (res && res.ok) {
            const data = await res.json();
            setCompleted(data.completedQuests);
            if (onUserDataChange) onUserDataChange(); // Trigger parent to refresh stats/logs
        }

        setPendingQuest(quest);
        setShowFocusModal(true);
    }

    async function handleFocusSubmit() {
        if (!pendingQuest || !focusStat) return;

        const res = await authenticatedFetch("/api/focus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stat: focusStat, questTitle: pendingQuest.title }),
        });

        if (res) {
            setShowFocusModal(false);
            setFocusStat("");
            setPendingQuest(null);
            refreshQuests(); // Refresh UI with updated quests
            if (onUserDataChange) onUserDataChange(); // Also refresh stats/logs
        }
    } function isQuestCompleted(quest: string): boolean {
        return completed.some((q: CompletedQuestItem) => q.questTitle === quest);
    }

    return (
        <div className="flex-1 bg-[#18181b]/80 rounded-xl p-0 border-2 border-indigo-700/40 shadow-xl min-w-[320px] max-h-[600px] h-[80vh] sm:h-auto flex flex-col">
            <Tabs.Root defaultValue="questlines" className="flex flex-col h-full">
                <div className="top-0 z-10 bg-[#18181b]/90 rounded-t-xl">
                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="text-lg font-bold text-indigo-300 tracking-wide">RPG Quest System</div>
                        <button
                            onClick={refreshQuests}
                            className="ml-2 px-2 py-1 rounded bg-indigo-700 text-white font-bold hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 transition text-xs"
                        >
                            Refresh
                        </button>
                    </div>
                    <Tabs.List className="flex gap-2 px-6 pb-2 border-b border-indigo-700/40 overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-transparent bg-[#18181b]/90 rounded-t-xl">
                        <Tabs.Trigger value="questlines" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">Questlines</Tabs.Trigger>
                        <Tabs.Trigger value="passives" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">Passives</Tabs.Trigger>
                        <Tabs.Trigger value="metrics" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">Metrics</Tabs.Trigger>
                        <Tabs.Trigger value="report" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">Report</Tabs.Trigger>
                        <Tabs.Trigger value="xp" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">XP/Level</Tabs.Trigger>
                        <Tabs.Trigger value="titles" className="px-3 py-1 rounded-t bg-[#232136] text-indigo-200 font-semibold data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition whitespace-nowrap">Titles</Tabs.Trigger>
                        <Tabs.Trigger value="completed" className="px-3 py-1 rounded-t bg-[#232136] text-green-300 font-semibold data-[state=active]:bg-green-700 data-[state=active]:text-white transition whitespace-nowrap">Completed</Tabs.Trigger>
                    </Tabs.List>
                </div>
                <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100dvh-8rem)] sm:max-h-[600px]">
                    <div className="h-full">
                        {loading ? (
                            <div className="text-indigo-400 animate-pulse">Loading quests...</div>
                        ) : error ? (
                            <div className="text-pink-400 font-bold">{error}</div>
                        ) : sections ? (
                            <>
                                <Tabs.Content value="questlines">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.questlines.map((ql, i) => (
                                            <div key={i} className="bg-gradient-to-br from-[#232136] to-[#312e81] rounded-lg p-4 border border-indigo-700/40 shadow flex flex-col gap-2 relative">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-700 text-xs font-bold text-white uppercase tracking-wider">{ql.stat}</span>
                                                    <span className="text-indigo-300 font-bold text-base">{ql.title}</span>
                                                </div>
                                                <div className="text-indigo-100 text-sm mb-2">{ql.description}</div>                                                <div className="space-y-3">
                                                    {/* Filter out completed quests */}
                                                    {ql.quests.filter(q => !isQuestCompleted(q.title)).map((q, j) => (
                                                        <div key={j} className="bg-[#232136] rounded p-3 border border-indigo-800/40 shadow flex flex-col gap-1 relative">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="inline-block px-2 py-0.5 rounded bg-indigo-800 text-xs font-bold text-white uppercase tracking-wider">{q.category}</span>
                                                                <span className="text-indigo-200 font-bold text-sm">{q.title}</span>
                                                                {q.priority === 'High' && <span className="ml-2 px-2 py-0.5 rounded bg-pink-700 text-xs font-bold text-white">High</span>}
                                                            </div>
                                                            <div className="text-indigo-100 text-xs italic mb-1">{q.subtitle}</div>
                                                            <div className="text-indigo-100 text-sm mb-1">{q.description}</div>
                                                            <div className="text-indigo-100 text-sm mb-1">Instructions: {q.instructions}</div>
                                                            <div className="flex flex-wrap gap-2 mb-1">
                                                                {q.rewards.map((r, k) => (
                                                                    <span key={k} className="inline-block px-2 py-0.5 rounded bg-green-700 text-xs font-bold text-white">{r.type}: {r.value}</span>
                                                                ))}
                                                            </div>
                                                            <div className="text-indigo-300 text-xs">Proof: {q.proof}</div>
                                                            {q.unlockCondition && <div className="text-yellow-300 text-xs">Unlock: {q.unlockCondition}</div>}
                                                            <button
                                                                onClick={() => handleQuestComplete(q)}
                                                                className="mt-2 px-3 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-500 focus:ring-2 focus:ring-green-400 transition text-xs self-end"
                                                            >
                                                                Mark as Complete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="passives">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.passives.map((p, i) => (
                                            <div key={i} className="flex flex-col gap-1 bg-[#232136] rounded p-3 border border-purple-700/40 shadow">
                                                <span className="inline-block px-2 py-0.5 rounded bg-purple-700 text-xs font-bold text-white">{p.title}</span>
                                                <span className="text-indigo-100 text-xs">{p.description}</span>
                                                <span className="text-yellow-300 text-xs">Unlock: {p.unlockCondition}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="metrics">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.metrics.map((m, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="inline-block px-2 py-0.5 rounded bg-blue-700 text-xs font-bold text-white">Metric</span>
                                                <span>{m}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="report">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.reportTemplate}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="xp">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.xpSystem}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="titles">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {sections.titles.map((t, i) => (
                                            <div key={i} className="flex flex-col gap-1 bg-[#232136] rounded p-3 border border-indigo-900/40 shadow">
                                                <span className="inline-block px-2 py-0.5 rounded bg-indigo-900 text-xs font-bold text-white">{t.title}</span>
                                                <span className="text-indigo-100 text-xs">{t.description}</span>
                                                <span className="text-yellow-300 text-xs">Unlock: {t.unlockCondition}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value="completed">
                                    <div className="space-y-6 max-h-[400px] sm:max-h-[420px] overflow-y-auto pr-2">
                                        {completed.length === 0 ? (
                                            <div className="text-zinc-400">No completed quests yet.</div>
                                        ) : (
                                            completed.map((q, i) => (
                                                <div key={i} className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-4 border border-green-700/40 shadow flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FaCheckCircle className="text-green-400" />
                                                        <span className="text-green-100 font-bold text-sm">{q.questTitle}</span>
                                                    </div>
                                                    {q.questDescription && (
                                                        <div className="text-green-200 text-xs italic mb-1">{q.questDescription}</div>
                                                    )}
                                                    <div className="text-green-200 text-xs">Completed at: {new Date(q.completedAt).toLocaleString()}</div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {q.rewards && q.rewards.map((r, idx) => (
                                                            <span key={idx} className="inline-block px-2 py-0.5 rounded bg-green-500/50 text-xs font-bold text-white">{r.type}: {r.value}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Tabs.Content>
                            </>
                        ) : (
                            <div className="text-zinc-400">No quests yet.</div>
                        )}
                    </div>
                </div>
            </Tabs.Root>
            <Dialog.Root open={showFocusModal} onOpenChange={setShowFocusModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                    <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#232136] rounded-lg p-6 max-w-sm w-full shadow-lg">
                            <Dialog.Title className="text-lg font-bold text-indigo-300 mb-4">Quest Complete!</Dialog.Title>
                            <Dialog.Description className="text-indigo-100 text-sm mb-4">
                                You have completed a quest and earned rewards. Select a stat to focus on for your next adventure:
                            </Dialog.Description>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {statOptions.map(stat => (
                                    <button
                                        key={stat}
                                        onClick={() => setFocusStat(stat)}
                                        className={`px-3 py-1 rounded font-bold transition-all flex-1 ${focusStat === stat ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-indigo-100 hover:bg-indigo-500'}`}
                                    >
                                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowFocusModal(false)}
                                    className="px-3 py-1 rounded bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFocusSubmit}
                                    className="px-3 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-500 transition-all"
                                >
                                    Confirm Focus
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
