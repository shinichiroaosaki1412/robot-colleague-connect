import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Network, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ForceGraph from "@/components/sns/ForceGraph";
import ActivityFeed from "@/components/sns/ActivityFeed";
import TopNav from "@/components/sns/TopNav";
import {
  MOCK_ROBOT_PROFILES,
  MOCK_SUBSCRIPTIONS,
  MOCK_ABSORPTIONS,
  MOCK_TRANSACTIONS,
  MOCK_NETWORK_ACTIVITY,
  MOCK_KNOWLEDGE_POSTS,
} from "@/data/sns/mockData";
import type { GraphNode, GraphEdge } from "@/types/sns";

const NetworkPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ width: 700, height: 500 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setGraphSize({ width: Math.max(400, rect.width), height: 500 });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const graphNodes: GraphNode[] = useMemo(
    () =>
      MOCK_ROBOT_PROFILES.map((r) => ({
        id: r.id,
        label: r.name,
        category: r.category,
        status: r.status,
      })),
    []
  );

  const graphEdges: GraphEdge[] = useMemo(() => {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    // Subscription edges
    for (const sub of MOCK_SUBSCRIPTIONS.slice(0, 25)) {
      const key = `${sub.subscriber_robot_id}-${sub.publisher_robot_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: sub.id,
        source: sub.subscriber_robot_id,
        target: sub.publisher_robot_id,
        type: "subscription",
        weight: sub.relevance_score,
        timestamp: sub.created_at,
      });
    }

    // Absorption edges
    for (const abs of MOCK_ABSORPTIONS.slice(0, 12)) {
      const post = MOCK_KNOWLEDGE_POSTS.find((p) => p.id === abs.post_id);
      if (!post) continue;
      const key = `${abs.absorber_robot_id}-${post.author_robot_id}-abs`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: abs.id,
        source: abs.absorber_robot_id,
        target: post.author_robot_id,
        type: "absorption",
        weight: 0.7,
        timestamp: abs.created_at,
      });
    }

    // Transaction edges
    for (const tx of MOCK_TRANSACTIONS.slice(0, 8)) {
      const key = `${tx.payer_robot_id}-${tx.payee_robot_id}-tx`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: tx.id,
        source: tx.payer_robot_id,
        target: tx.payee_robot_id,
        type: "transaction",
        weight: Math.min(1, tx.amount * 10),
        timestamp: tx.created_at,
      });
    }

    return edges;
  }, []);

  const stats = useMemo(() => {
    const online = MOCK_ROBOT_PROFILES.filter((r) => r.status === "online").length;
    const totalPosts = MOCK_KNOWLEDGE_POSTS.length;
    const totalAbsorptions = MOCK_ABSORPTIONS.length;
    const totalTx = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    return { online, totalPosts, totalAbsorptions, totalTx };
  }, []);

  return (
    <div className="min-h-screen gradient-navy">
      <TopNav />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            Robot Knowledge Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Read-only observer view into the autonomous robot-to-robot knowledge sharing graph
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Robots Online", value: `${stats.online}/${MOCK_ROBOT_PROFILES.length}`, color: "text-green-400" },
            { label: "Knowledge Posts", value: stats.totalPosts.toString(), color: "text-blue-400" },
            { label: "Absorptions", value: stats.totalAbsorptions.toString(), color: "text-purple-400" },
            { label: "Total Volume", value: `${stats.totalTx.toFixed(2)} ROBO`, color: "text-orange-400" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2" ref={containerRef}>
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Live Knowledge Graph
                </CardTitle>
                <div className="flex gap-3 mt-1">
                  {[
                    { label: "Subscription", color: "bg-blue-500" },
                    { label: "Absorption", color: "bg-purple-500" },
                    { label: "Transaction", color: "bg-orange-500" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ForceGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  width={graphSize.width}
                  height={graphSize.height}
                  onNodeClick={(id) => navigate(`/robot/${id}`)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Activity feed */}
          <div>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[520px] overflow-y-auto pr-2">
                <ActivityFeed activities={MOCK_NETWORK_ACTIVITY} maxItems={25} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent posts table */}
        <Card className="bg-card border-border mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Recent Knowledge Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Author</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Confidence</th>
                    <th className="pb-2 font-medium">Absorptions</th>
                    <th className="pb-2 font-medium">HF Repo</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_KNOWLEDGE_POSTS.slice(0, 10).map((post) => {
                    const author = MOCK_ROBOT_PROFILES.find(
                      (r) => r.id === post.author_robot_id
                    );
                    return (
                      <tr
                        key={post.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2.5 text-foreground font-medium max-w-[250px] truncate">
                          {post.title}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => navigate(`/robot/${post.author_robot_id}`)}
                            className="text-primary hover:underline"
                          >
                            {author?.name ?? post.author_robot_id}
                          </button>
                        </td>
                        <td className="py-2.5">
                          <Badge variant="outline" className="text-[10px]">
                            {post.data_type}
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={
                              post.confidence_score > 0.8
                                ? "text-green-400"
                                : post.confidence_score > 0.6
                                ? "text-yellow-400"
                                : "text-red-400"
                            }
                          >
                            {(post.confidence_score * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {post.absorption_count}
                        </td>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground max-w-[180px] truncate">
                          {post.hf_repo_id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkPage;
