import React from "react";

interface StatLog {
    stat: string;
    oldValue: number;
    newValue: number;
    changedAt: string | Date;
}

function getColor(log: StatLog) {
    if (log.newValue > log.oldValue) return "bg-green-400";
    if (log.newValue < log.oldValue) return "bg-pink-400";
    return "bg-indigo-400";
}

export default function LogList({ logs }: { logs: StatLog[] }) {
    return (
        <div className="flex-1 bg-[#18181b]/80 rounded-xl p-6 border-2 border-indigo-700/40 shadow-xl min-w-[260px] max-h-[340px] overflow-y-auto">
            <div className="text-lg font-bold mb-4 text-indigo-300 tracking-wide">Stat Change Log</div>
            {logs.length === 0 ? (
                <div className="text-zinc-400">No changes yet.</div>
            ) : (
                <ul className="space-y-4 relative pl-6">
                    {logs.slice(0, 10).map((log, i) => (
                        <li key={i} className="text-sm text-indigo-100/90 flex items-start gap-2 relative">
                            <span className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-zinc-900 shadow ${getColor(log)}`}></span>
                            <div>
                                <span className="font-bold text-indigo-400">{log.stat}</span> changed from <span className="font-bold text-pink-400">{log.oldValue}</span> to <span className="font-bold text-green-400">{log.newValue}</span>
                                <span className="block text-xs text-zinc-400 mt-1">{new Date(log.changedAt).toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
