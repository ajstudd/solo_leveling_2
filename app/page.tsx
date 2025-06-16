"use client";
import React, { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import LogList from "./components/LogList";
import QuestPanel from "./components/QuestPanel";
import { useRouter } from "next/navigation";

type StatKey = "strength" | "vitality" | "agility" | "intelligence" | "perception";

const statNames: { key: StatKey; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "vitality", label: "Vitality" },
  { key: "agility", label: "Agility" },
  { key: "intelligence", label: "Intelligence" },
  { key: "perception", label: "Perception" },
];

interface Stats {
  strength: number;
  vitality: number;
  agility: number;
  intelligence: number;
  perception: number;
  [key: string]: number;
}

interface Log {
  stat: string;
  oldValue: number;
  newValue: number;
  changedAt: string;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({} as Stats);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
        setLogs(data.logs);
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.toLowerCase().includes("unauthorized")) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleStatUpdate(stat: string, value: number) {
    const token = localStorage.getItem("token");
    fetch("/api/stats", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stat, value }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setLogs(data.logs);
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#232136] to-[#312e81] text-indigo-100 flex flex-col items-center py-10 px-2">
      <h1 className="text-4xl font-extrabold mb-8 tracking-widest text-center drop-shadow-glow">SOLO LEVELING</h1>
      {loading ? (
        <div className="text-xl animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-pink-400 font-bold">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl">
            {statNames.map((stat) => (
              <StatCard
                key={stat.key}
                statKey={stat.key}
                label={stat.label}
                value={stats[stat.key]}
                onUpdate={handleStatUpdate}
              />
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mb-8">
            <QuestPanel stats={stats} />
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <LogList logs={logs} />
          </div>
        </>
      )}
    </div>
  );
}
