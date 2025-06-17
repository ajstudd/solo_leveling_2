import React, { useState } from "react";
import { BsDot } from "react-icons/bs";

interface StatLog {
    stat: string;
    oldValue: number;
    newValue: number;
    changedAt: string | Date;
}

function getColor(log: StatLog) {
    if (log.newValue > log.oldValue) return "bg-green-400 border-green-400";
    if (log.newValue < log.oldValue) return "bg-pink-400 border-pink-400";
    return "bg-indigo-400 border-indigo-400";
}

export default function LogList({ logs }: { logs: StatLog[] }) {
    const [showAll, setShowAll] = useState(false);
    const visibleLogs = showAll ? logs : logs.slice(0, 5);
    return (
        <div className="flex-1 bg-[#18181b]/80 rounded-xl p-6 border-2 border-indigo-700/40 shadow-xl min-w-[320px] max-h-[600px] overflow-y-auto mb-6">
            <div className="text-lg font-bold mb-4 text-indigo-300 tracking-wide flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"><BsDot className="text-white text-2xl" /></span>
                Stat Change Log
            </div>
            {logs.length === 0 ? (
                <div className="text-zinc-400">No changes yet.</div>
            ) : (
                <>
                    <ul className="space-y-4 relative pl-0">
                        {visibleLogs.map((log, i) => (
                            <li key={i} className="flex items-start gap-3 relative">
                                <span className={`mt-2 w-5 h-5 flex items-center justify-center rounded-full ${getColor(log)} shadow-lg`}>
                                    <BsDot className="text-white text-2xl" />
                                </span>
                                <div className="text-sm text-indigo-100/90">
                                    <span className="font-bold text-indigo-400">{log.stat}</span> changed from <span className="font-bold text-pink-400">{log.oldValue}</span> to <span className="font-bold text-green-400">{log.newValue}</span>
                                    <span className="block text-xs text-zinc-400 mt-1">{new Date(log.changedAt).toLocaleString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {logs.length > 5 && (
                        <button
                            className="mt-4 px-3 py-1 rounded bg-indigo-700 text-white font-bold hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 transition text-xs"
                            onClick={() => setShowAll((v) => !v)}
                        >
                            {showAll ? "Show Less" : `Read More (${logs.length - 5} more)`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
