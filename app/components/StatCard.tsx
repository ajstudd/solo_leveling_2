import React, { useState, useEffect } from "react";
import { GiBiceps, GiHeartPlus, GiRunningShoe, GiBrain, GiEyeTarget } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from '@radix-ui/react-tooltip';

interface StatCardProps {
    statKey: StatKey;
    label: string;
    value: number;
    onUpdate: (stat: StatKey, value: number) => void;
}

type StatKey = "strength" | "vitality" | "agility" | "intelligence" | "perception";

const statIcons: Record<StatKey, React.ReactNode> = {
    strength: <GiBiceps className="text-3xl text-indigo-400 drop-shadow-glow" />,
    vitality: <GiHeartPlus className="text-3xl text-pink-400 drop-shadow-glow" />,
    agility: <GiRunningShoe className="text-3xl text-green-400 drop-shadow-glow" />,
    intelligence: <GiBrain className="text-3xl text-blue-400 drop-shadow-glow" />,
    perception: <GiEyeTarget className="text-3xl text-yellow-400 drop-shadow-glow" />,
};

const statDescriptions: Record<StatKey, string> = {
    strength: "Physical power and attack strength.",
    vitality: "Health, endurance, and resilience.",
    agility: "Speed, reflexes, and movement.",
    intelligence: "Magic, skills, and strategy.",
    perception: "Awareness, senses, and intuition.",
};

export default function StatCard({ statKey, label, value, onUpdate }: StatCardProps) {
    const [edit, setEdit] = useState(false);
    const [input, setInput] = useState(value);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setInput(value);
        setAnimate(true);
        const timeout = setTimeout(() => setAnimate(false), 700);
        return () => clearTimeout(timeout);
    }, [value]);

    function handleSave() {
        if (input !== value && input > 0) {
            onUpdate(statKey, input);
        }
        setEdit(false);
    }

    return (
        <motion.div
            className="bg-[#232136]/80 rounded-xl p-6 flex flex-col items-center border-2 border-indigo-700/40 shadow-xl min-w-[180px]"
            animate={animate ? { boxShadow: "0 0 24px 4px #818cf8, 0 0 0 2px #a21caf" } : { boxShadow: "0 2px 16px 0 #312e81" }}
            transition={{ duration: 0.5 }}
        >
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <div className="mb-2 cursor-help">{statIcons[statKey]}</div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content side="top" className="bg-indigo-900 text-indigo-100 px-3 py-2 rounded shadow-lg text-xs font-semibold animate-fade-in">
                        {statDescriptions[statKey]}
                        <Tooltip.Arrow className="fill-indigo-900" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
            <div className="text-lg font-bold mb-1 tracking-wide text-indigo-200">{label}</div>
            {edit ? (
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        min={1}
                        value={input}
                        onChange={e => setInput(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-zinc-900 text-indigo-100 border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                    />
                    <button onClick={handleSave} className="px-2 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 transition">Save</button>
                    <button onClick={() => setEdit(false)} className="px-2 py-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-400 transition">Cancel</button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        <motion.span
                            key={value}
                            initial={{ scale: 1.2, color: "#818cf8" }}
                            animate={{ scale: 1, color: "#fff" }}
                            exit={{ scale: 1, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-2xl font-extrabold text-indigo-100 drop-shadow-glow"
                        >
                            {value}
                        </motion.span>
                    </AnimatePresence>
                    <button onClick={() => setEdit(true)} className="ml-2 px-2 py-1 rounded bg-indigo-700 text-white font-bold hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 transition text-xs">Edit</button>
                </div>
            )}
        </motion.div>
    );
}
