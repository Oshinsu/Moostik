/**
 * AGENT ORCHESTRATOR API
 * Unified API for all agent systems
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, startOrchestrator } from "../../../../agents/orchestrator/runtime";
import { requireAuth } from "@/lib/security/auth-guard";

// GET /api/agents - Get status of all agents
export async function GET(request: NextRequest) {
  try {
    // Optional auth - show limited info if not authenticated
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = !!authHeader;

    const orchestrator = getOrchestrator();
    const stats = orchestrator.getStats();
    const agentStats = orchestrator.getAgentStats();

    // Basic info always available
    const response: Record<string, unknown> = {
      status: stats.agentStatuses,
      uptime: stats.uptime,
      isRunning: Object.values(stats.agentStatuses).some((s) => s),
    };

    // Detailed stats for authenticated users
    if (isAuthenticated) {
      response.stats = stats;
      response.agentStats = agentStats;
      response.workflows = {
        total: stats.totalWorkflows,
        completed: stats.completedWorkflows,
        failed: stats.failedWorkflows,
        active: stats.activeWorkflows,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API/agents] Error:", error);
    return NextResponse.json(
      { error: "Failed to get agent status" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Control agents or submit data
export async function POST(request: NextRequest) {
  try {
    // Require auth for all POST operations
    const { auth, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { action, data } = body as {
      action: string;
      data?: Record<string, unknown>;
    };

    if (!action) {
      return NextResponse.json(
        { error: "Missing required field: action" },
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();

    switch (action) {
      case "start": {
        await startOrchestrator();
        return NextResponse.json({
          success: true,
          message: "Orchestrator started",
          status: orchestrator.getStats().agentStatuses,
        });
      }

      case "stop": {
        await orchestrator.stop();
        return NextResponse.json({
          success: true,
          message: "Orchestrator stopped",
        });
      }

      case "submit_message": {
        if (!data?.content) {
          return NextResponse.json(
            { error: "Missing data.content" },
            { status: 400 }
          );
        }

        orchestrator.processAgentMessage(
          auth.userId!,
          data.content as string,
          data.submolt as string | undefined
        );

        return NextResponse.json({
          success: true,
          message: "Message processed",
        });
      }

      case "submit_messages": {
        if (!Array.isArray(data?.messages)) {
          return NextResponse.json(
            { error: "Missing data.messages array" },
            { status: 400 }
          );
        }

        const messages = (data.messages as { content: string; submolt?: string }[]).map((m) => ({
          agentId: auth.userId!,
          content: m.content,
          submolt: m.submolt,
          timestamp: new Date(),
        }));

        orchestrator.processAgentMessages(messages);

        return NextResponse.json({
          success: true,
          message: `Processed ${messages.length} messages`,
        });
      }

      case "create_workflow": {
        if (!data?.type) {
          return NextResponse.json(
            { error: "Missing data.type" },
            { status: 400 }
          );
        }

        const workflow = orchestrator.createWorkflow(
          data.type as Parameters<typeof orchestrator.createWorkflow>[0],
          data.input as Record<string, unknown> || {},
          (data.priority as number) || 5
        );

        return NextResponse.json({
          success: true,
          workflow: {
            id: workflow.id,
            type: workflow.type,
            status: workflow.status,
            stepsCount: workflow.steps.length,
          },
        });
      }

      case "execute_workflow": {
        if (!data?.workflowId) {
          return NextResponse.json(
            { error: "Missing data.workflowId" },
            { status: 400 }
          );
        }

        // Execute async - don't wait for completion
        orchestrator.executeWorkflow(data.workflowId as string).catch((error) => {
          console.error(`[API/agents] Workflow execution error: ${error}`);
        });

        return NextResponse.json({
          success: true,
          message: "Workflow execution started",
          workflowId: data.workflowId,
        });
      }

      case "get_briefs": {
        const swarm = orchestrator.getSwarmEngine();
        if (!swarm) {
          return NextResponse.json(
            { error: "Swarm engine not available" },
            { status: 503 }
          );
        }

        return NextResponse.json({
          briefs: swarm.getBriefs(),
          patterns: swarm.getPatterns(),
          stats: swarm.getStats(),
        });
      }

      case "get_bleeds": {
        const bleed = orchestrator.getRealityBleed();
        if (!bleed) {
          return NextResponse.json(
            { error: "Reality bleed not available" },
            { status: 503 }
          );
        }

        return NextResponse.json({
          bleeds: bleed.getBleeds(),
          candidates: bleed.getCandidates(),
          stats: bleed.getStats(),
        });
      }

      case "get_collective_state": {
        const molt = orchestrator.getMolt();
        if (!molt) {
          return NextResponse.json(
            { error: "Molt not available" },
            { status: 503 }
          );
        }

        return NextResponse.json({
          collectiveState: molt.getCollectiveState(),
          dreams: molt.getActiveDreamFragments(),
          influences: molt.getInfluences(),
          stats: molt.getStats(),
        });
      }

      case "get_worker_status": {
        const worker = orchestrator.getWorker();
        if (!worker) {
          return NextResponse.json(
            { error: "Worker not available" },
            { status: 503 }
          );
        }

        return NextResponse.json({
          queueLength: worker.getQueueLength(),
          activeTasks: worker.getActiveTaskCount(),
          isRunning: worker.isWorkerRunning(),
          stats: worker.getStats(),
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API/agents] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
