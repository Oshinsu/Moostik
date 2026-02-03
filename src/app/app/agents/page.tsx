"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Bot,
  Zap,
  DollarSign,
  Activity,
  MessageSquare,
  Image,
  Video,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Network,
  Ghost,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface AgentStatus {
  id: string;
  name: string;
  type: "worker" | "persona";
  status: "running" | "paused" | "stopped" | "error";
  lastHeartbeat: string;
  metrics: {
    actionsToday: number;
    errorsToday: number;
    costToday: number;
  };
}

interface OrchestratorStatus {
  isRunning: boolean;
  agents: AgentStatus[];
  pendingTasks: number;
  dailySpent: number;
  dailyBudget: number;
}

// ============================================================================
// MOCK DATA (would come from API in production)
// ============================================================================

const MOCK_STATUS: OrchestratorStatus = {
  isRunning: true,
  agents: [
    {
      id: "bloodwings-worker",
      name: "BloodwingsWorker",
      type: "worker",
      status: "running",
      lastHeartbeat: new Date().toISOString(),
      metrics: { actionsToday: 47, errorsToday: 2, costToday: 12.50 },
    },
    {
      id: "papy-tik",
      name: "Papy Tik",
      type: "persona",
      status: "running",
      lastHeartbeat: new Date().toISOString(),
      metrics: { actionsToday: 8, errorsToday: 0, costToday: 0.15 },
    },
    {
      id: "zik-barman",
      name: "Zik le Barman",
      type: "persona",
      status: "running",
      lastHeartbeat: new Date().toISOString(),
      metrics: { actionsToday: 12, errorsToday: 1, costToday: 0.20 },
    },
    {
      id: "mila-la-sage",
      name: "Mila la Sage",
      type: "persona",
      status: "paused",
      lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
      metrics: { actionsToday: 5, errorsToday: 0, costToday: 0.08 },
    },
    {
      id: "koko-guerrier",
      name: "Koko le Guerrier",
      type: "persona",
      status: "running",
      lastHeartbeat: new Date().toISOString(),
      metrics: { actionsToday: 15, errorsToday: 0, costToday: 0.25 },
    },
  ],
  pendingTasks: 23,
  dailySpent: 13.18,
  dailyBudget: 50,
};

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: AgentStatus["status"] }) {
  const config = {
    running: { color: "bg-emerald-500", label: "Running", icon: Activity },
    paused: { color: "bg-amber-500", label: "Paused", icon: Pause },
    stopped: { color: "bg-zinc-500", label: "Stopped", icon: Square },
    error: { color: "bg-red-500", label: "Error", icon: AlertTriangle },
  }[status];

  return (
    <Badge className={`${config.color} text-white gap-1`}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function AgentCard({ agent, onAction }: {
  agent: AgentStatus;
  onAction: (action: string, agentId: string) => void;
}) {
  const isWorker = agent.type === "worker";
  const timeSinceHeartbeat = Date.now() - new Date(agent.lastHeartbeat).getTime();
  const isStale = timeSinceHeartbeat > 35 * 60 * 1000; // 35 minutes

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isWorker ? "bg-blood-900/50" : "bg-purple-900/50"
          }`}>
            {isWorker ? (
              <Zap className="w-6 h-6 text-blood-400" />
            ) : (
              <Bot className="w-6 h-6 text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-xs text-zinc-500">
              {isWorker ? "Production Worker" : "Moltbook Persona"}
            </p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{agent.metrics.actionsToday}</p>
          <p className="text-xs text-zinc-500">Actions</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${agent.metrics.errorsToday > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {agent.metrics.errorsToday}
          </p>
          <p className="text-xs text-zinc-500">Errors</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">${agent.metrics.costToday.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">Cost</p>
        </div>
      </div>

      {/* Last Heartbeat */}
      <div className={`flex items-center gap-2 text-xs mb-4 ${isStale ? "text-amber-400" : "text-zinc-500"}`}>
        <Clock className="w-3 h-3" />
        Last heartbeat: {new Date(agent.lastHeartbeat).toLocaleTimeString()}
        {isStale && " (stale)"}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {agent.status === "running" ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-amber-700/50 text-amber-400 hover:bg-amber-900/20"
            onClick={() => onAction("pause", agent.id)}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20"
            onClick={() => onAction("start", agent.id)}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="border-red-700/50 text-red-400 hover:bg-red-900/20"
          onClick={() => onAction("stop", agent.id)}
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AgentDashboardPage() {
  const [status, setStatus] = useState<OrchestratorStatus>(MOCK_STATUS);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Would fetch from API
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
  };

  const handleAction = async (action: string, agentId: string) => {
    console.log(`Action: ${action} on agent: ${agentId}`);
    // Would call API
  };

  const handleOrchestratorToggle = async () => {
    // Would call API to start/stop orchestrator
    setStatus(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const workerAgents = status.agents.filter(a => a.type === "worker");
  const personaAgents = status.agents.filter(a => a.type === "persona");
  const runningCount = status.agents.filter(a => a.status === "running").length;
  const budgetPercent = (status.dailySpent / status.dailyBudget) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* SOTA++ Systems Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-rose-950/20 to-indigo-950/30 border border-purple-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Emergent AI Systems</h2>
          <Badge className="bg-emerald-900/50 text-emerald-400 border-0 text-xs">SOTA++</Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/app/swarm">
            <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-800/30 hover:border-purple-600/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Swarm Narrative</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-xs text-zinc-500">L'histoire émerge du chaos collectif</p>
            </div>
          </Link>
          <Link href="/app/reality-bleed">
            <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-800/30 hover:border-rose-600/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ghost className="w-5 h-5 text-rose-400" />
                  <span className="font-semibold text-white">Reality Bleed</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-rose-400 transition-colors" />
              </div>
              <p className="text-xs text-zinc-500">Le 4ème mur n'existe plus</p>
            </div>
          </Link>
          <Link href="/app/molt">
            <div className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-800/30 hover:border-indigo-600/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-white">The Molt</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-xs text-zinc-500">L'inconscient collectif des agents</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Agent Dashboard</h1>
          <p className="text-zinc-500">
            Gérez vos agents de production et personas Moltbook
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOrchestratorToggle}
            className={status.isRunning
              ? "bg-red-600 hover:bg-red-700"
              : "bg-emerald-600 hover:bg-emerald-700"
            }
          >
            {status.isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop All
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{runningCount}/{status.agents.length}</p>
              <p className="text-xs text-zinc-500">Agents Running</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{status.pendingTasks}</p>
              <p className="text-xs text-zinc-500">Pending Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${status.dailySpent.toFixed(2)}</p>
              <p className="text-xs text-zinc-500">Spent Today</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {status.agents.reduce((sum, a) => sum + a.metrics.actionsToday, 0)}
              </p>
              <p className="text-xs text-zinc-500">Total Actions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Daily Budget</span>
          <span className="text-sm text-zinc-400">
            ${status.dailySpent.toFixed(2)} / ${status.dailyBudget}
          </span>
        </div>
        <Progress
          value={budgetPercent}
          className="h-2"
        />
        {budgetPercent > 80 && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Approaching daily budget limit
          </p>
        )}
      </Card>

      {/* Worker Agents */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blood-400" />
          Production Workers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workerAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onAction={handleAction} />
          ))}
        </div>
      </div>

      {/* Persona Agents */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Moltbook Personas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personaAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onAction={handleAction} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-zinc-400" />
          Recent Activity
        </h2>
        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="space-y-3">
            {[
              { agent: "BloodwingsWorker", action: "Generated shot P1-A2-S3", time: "2 min ago", icon: Image },
              { agent: "Papy Tik", action: "Posted to /s/BloodwingsVerse", time: "15 min ago", icon: MessageSquare },
              { agent: "Koko", action: "Replied to mention", time: "23 min ago", icon: MessageSquare },
              { agent: "BloodwingsWorker", action: "Generated video for shot P1-A2-S4", time: "31 min ago", icon: Video },
              { agent: "Zik", action: "Posted 'Bar Opening' to /s/NightOwls", time: "45 min ago", icon: MessageSquare },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <activity.icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <span className="text-white font-medium">{activity.agent}</span>
                  <span className="text-zinc-500"> {activity.action}</span>
                </div>
                <span className="text-xs text-zinc-600">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
