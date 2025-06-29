"use client";
import React, { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import LogList from "./components/LogList";
import QuestPanel from "./components/QuestPanel";
import SetupModal from "./components/SetupModal";
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

interface User {
  _id: string;
  email: string;
  setupCompleted: boolean;
  stats: Stats;
  [key: string]: unknown;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({} as Stats);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // First, check user status
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUser(data.user);

        // Check if setup is needed
        if (!data.user.setupCompleted) {
          setShowSetupModal(true);
          setLoading(false);
          return;
        }

        // If setup is complete, fetch stats
        return fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        if (!res) return; // Setup modal is showing
        return res.json();
      })
      .then((data) => {
        if (!data) return; // Setup modal is showing
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
        setLogs(data.logs);
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid token")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleUserDataChange() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStats(data.stats);
          setLogs(data.logs);
        }
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid token")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      });
  }

  function handleSetupComplete() {
    setShowSetupModal(false);
    setLoading(true);

    // Refresh user data and fetch stats
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return null;
        }
        return res.json();
      }),
      fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return null;
        }
        return res.json();
      })
    ])
      .then(([userData, statsData]) => {
        if (userData && statsData) {
          setUser(userData.user);
          setStats(statsData.stats);
          setLogs(statsData.logs);
        }
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid token")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }

  function handleStatUpdate(stat: string, value: number) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/stats", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stat, value }),
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStats(data.stats);
          setLogs(data.logs);
        }
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid token")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#232136] to-[#312e81] text-indigo-100 flex flex-col items-center py-10 px-2">
      {/* <h1 className="text-4xl font-extrabold mb-8 tracking-widest text-center drop-shadow-glow">SOLO LEVELING</h1> */}
      {loading ? (
        <div className="text-xl animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-pink-400 font-bold">{error}</div>
      ) : user && !user.setupCompleted ? (
        <SetupModal
          isOpen={showSetupModal}
          onComplete={handleSetupComplete}
        />
      ) : (
        <>
          <SetupModal
            isOpen={showSetupModal}
            onComplete={handleSetupComplete}
          />
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
            <QuestPanel stats={stats} onUserDataChange={handleUserDataChange} />
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <LogList logs={logs} />
          </div>
        </>
      )}
    </div>
  );
}
