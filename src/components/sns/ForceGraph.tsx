import { useEffect, useRef, useCallback } from "react";
import type { GraphNode, GraphEdge } from "@/types/sns";

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  busy: "#f59e0b",
  offline: "#6b7280",
};

const EDGE_COLORS: Record<string, string> = {
  subscription: "#3b82f6",
  absorption: "#a855f7",
  transaction: "#f97316",
};

/**
 * Simple canvas-based force-directed graph.
 * Uses a basic n-body simulation without external dependencies.
 */
const ForceGraph = ({ nodes, edges, width, height, onNodeClick }: ForceGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);

  // Initialize node positions
  useEffect(() => {
    nodesRef.current = nodes.map((n, i) => ({
      ...n,
      x: n.x ?? width / 2 + (Math.cos((i / nodes.length) * Math.PI * 2) * width) / 3,
      y: n.y ?? height / 2 + (Math.sin((i / nodes.length) * Math.PI * 2) * height) / 3,
      vx: 0,
      vy: 0,
    }));
    edgesRef.current = edges;
  }, [nodes, edges, width, height]);

  const simulate = useCallback(() => {
    const ns = nodesRef.current;
    const es = edgesRef.current;
    const nodeMap = new Map(ns.map((n) => [n.id, n]));

    // Repulsion
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = (ns[j].x ?? 0) - (ns[i].x ?? 0);
        const dy = (ns[j].y ?? 0) - (ns[i].y ?? 0);
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = 800 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        ns[i].vx = (ns[i].vx ?? 0) - fx;
        ns[i].vy = (ns[i].vy ?? 0) - fy;
        ns[j].vx = (ns[j].vx ?? 0) + fx;
        ns[j].vy = (ns[j].vy ?? 0) + fy;
      }
    }

    // Attraction along edges
    for (const edge of es) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      const dx = (t.x ?? 0) - (s.x ?? 0);
      const dy = (t.y ?? 0) - (s.y ?? 0);
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = (dist - 120) * 0.005 * edge.weight;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      s.vx = (s.vx ?? 0) + fx;
      s.vy = (s.vy ?? 0) + fy;
      t.vx = (t.vx ?? 0) - fx;
      t.vy = (t.vy ?? 0) - fy;
    }

    // Center gravity
    for (const n of ns) {
      const dx = width / 2 - (n.x ?? 0);
      const dy = height / 2 - (n.y ?? 0);
      n.vx = (n.vx ?? 0) + dx * 0.001;
      n.vy = (n.vy ?? 0) + dy * 0.001;
    }

    // Apply velocity with damping
    for (const n of ns) {
      n.vx = (n.vx ?? 0) * 0.85;
      n.vy = (n.vy ?? 0) * 0.85;
      n.x = Math.max(30, Math.min(width - 30, (n.x ?? 0) + (n.vx ?? 0)));
      n.y = Math.max(30, Math.min(height - 30, (n.y ?? 0) + (n.vy ?? 0)));
    }
  }, [width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ns = nodesRef.current;
    const es = edgesRef.current;
    const nodeMap = new Map(ns.map((n) => [n.id, n]));

    ctx.clearRect(0, 0, width, height);

    // Draw edges
    for (const edge of es) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      ctx.beginPath();
      ctx.moveTo(s.x ?? 0, s.y ?? 0);
      ctx.lineTo(t.x ?? 0, t.y ?? 0);
      ctx.strokeStyle = EDGE_COLORS[edge.type] ?? "#444";
      ctx.globalAlpha = 0.3 + edge.weight * 0.3;
      ctx.lineWidth = 1 + edge.weight;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    for (const n of ns) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const radius = 14;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = STATUS_COLORS[n.status] ?? "#666";
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1f36";
      ctx.fill();
      ctx.strokeStyle = STATUS_COLORS[n.status] ?? "#666";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.label.split(" ")[0], x, y + radius + 14);
    }
  }, [width, height]);

  useEffect(() => {
    const tick = () => {
      simulate();
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [simulate, draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const n of nodesRef.current) {
      const dx = (n.x ?? 0) - mx;
      const dy = (n.y ?? 0) - my;
      if (dx * dx + dy * dy < 18 * 18) {
        onNodeClick(n.id);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleCanvasClick}
      className="rounded-lg cursor-pointer"
      style={{ background: "hsl(220 25% 8%)" }}
    />
  );
};

export default ForceGraph;
