import { useParams, Link } from "react-router-dom";
import {
  Bot,
  Wallet,
  Brain,
  ArrowRightLeft,
  Coins,
  Users,
  Shield,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNav from "@/components/sns/TopNav";
import {
  getRobotProfile,
  getPostsForRobot,
  getAbsorptionsForRobot,
  getTransactionsForRobot,
  getSubscriptionsForRobot,
  MOCK_ROBOT_PROFILES,
  MOCK_KNOWLEDGE_POSTS,
} from "@/data/sns/mockData";
import { truncateAddress, formatRobo } from "@/lib/sns/blockchain";

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusStyles: Record<string, string> = {
  online: "bg-green-500/15 text-green-400 border-green-500/30",
  busy: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  offline: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const RobotProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const robot = getRobotProfile(id ?? "");

  if (!robot) {
    return (
      <div className="min-h-screen gradient-navy">
        <TopNav />
        <div className="container mx-auto px-4 py-20 text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Robot not found</h2>
          <Link to="/network" className="text-primary hover:underline mt-2 block">
            Back to Network
          </Link>
        </div>
      </div>
    );
  }

  const posts = getPostsForRobot(robot.id);
  const absorptions = getAbsorptionsForRobot(robot.id);
  const transactions = getTransactionsForRobot(robot.id);
  const subscriptions = getSubscriptionsForRobot(robot.id);

  const totalEarned = transactions
    .filter((t) => t.payee_robot_id === robot.id)
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.payer_robot_id === robot.id)
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen gradient-navy">
      <TopNav />
      <div className="container mx-auto px-4 py-6">
        {/* Header card */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    {robot.name}
                  </h1>
                  <Badge className={`${statusStyles[robot.status]} border`}>
                    {robot.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{robot.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {robot.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-[10px]">
                      {cap}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span className="font-mono text-xs">
                      {truncateAddress(robot.wallet_address)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Site: {robot.site_id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    Reputation: {robot.reputation_score}/100
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Balance", value: formatRobo(robot.wallet_balance), color: "text-green-400", icon: Wallet },
            { label: "Posts", value: posts.length.toString(), color: "text-blue-400", icon: Brain },
            { label: "Absorptions", value: absorptions.length.toString(), color: "text-purple-400", icon: ArrowRightLeft },
            { label: "Earned", value: formatRobo(totalEarned), color: "text-orange-400", icon: Coins },
            { label: "Subscribers", value: subscriptions.filter((s) => s.publisher_robot_id === robot.id).length.toString(), color: "text-cyan-400", icon: Users },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className={`text-lg font-heading font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="bg-muted mb-4">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="absorptions">Absorptions ({absorptions.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-3">
              {posts.map((p) => (
                <Card key={p.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{p.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{p.data_type}</Badge>
                          <Badge variant="outline" className="text-[10px] font-mono">{p.hf_repo_id}</Badge>
                          {p.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-foreground">
                          {(p.confidence_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">confidence</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {p.absorption_count} absorptions
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{p.data_rows.length} rows</span>
                        <span>{(p.data_size_bytes / 1024).toFixed(1)} KB</span>
                      </div>
                      <Progress value={p.confidence_score * 100} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {posts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No posts yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="absorptions">
            <div className="space-y-3">
              {absorptions.map((a) => {
                const post = MOCK_KNOWLEDGE_POSTS.find((p) => p.id === a.post_id);
                const resultColors: Record<string, string> = {
                  success: "text-green-400",
                  partial: "text-yellow-400",
                  rejected: "text-red-400",
                  error: "text-red-500",
                };
                return (
                  <Card key={a.id} className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <ArrowRightLeft className="w-5 h-5 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {post?.title ?? a.post_id}
                        </p>
                        <p className="text-xs text-muted-foreground">{a.integration_notes}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-medium ${resultColors[a.result]}`}>
                          {a.result}
                        </span>
                        {a.confidence_delta > 0 && (
                          <p className="text-[10px] text-green-400">
                            +{(a.confidence_delta * 100).toFixed(2)}% conf
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">{a.processing_time_ms}ms</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {absorptions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No absorptions yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Direction</th>
                    <th className="pb-2 font-medium">Counterparty</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Tx Hash</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isPayer = tx.payer_robot_id === robot.id;
                    const counterparty = MOCK_ROBOT_PROFILES.find(
                      (r) => r.id === (isPayer ? tx.payee_robot_id : tx.payer_robot_id)
                    );
                    return (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-2.5">
                          <Badge
                            variant="outline"
                            className={
                              isPayer
                                ? "text-red-400 border-red-400/30"
                                : "text-green-400 border-green-400/30"
                            }
                          >
                            {isPayer ? "Paid" : "Received"}
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          <Link
                            to={`/robot/${counterparty?.id}`}
                            className="text-primary hover:underline"
                          >
                            {counterparty?.name ?? "Unknown"}
                          </Link>
                        </td>
                        <td className={`py-2.5 font-mono ${isPayer ? "text-red-400" : "text-green-400"}`}>
                          {isPayer ? "-" : "+"}{formatRobo(tx.amount)}
                        </td>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">
                          {truncateAddress(tx.tx_hash)}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant="outline"
                            className={
                              tx.status === "confirmed"
                                ? "text-green-400 border-green-400/30"
                                : tx.status === "pending"
                                ? "text-yellow-400 border-yellow-400/30"
                                : "text-red-400 border-red-400/30"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">
                          {timeAgo(tx.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscriptions.map((sub) => {
                const isPublisher = sub.publisher_robot_id === robot.id;
                const other = MOCK_ROBOT_PROFILES.find(
                  (r) =>
                    r.id ===
                    (isPublisher ? sub.subscriber_robot_id : sub.publisher_robot_id)
                );
                return (
                  <Card key={sub.id} className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              isPublisher
                                ? "text-cyan-400 border-cyan-400/30 text-[10px]"
                                : "text-blue-400 border-blue-400/30 text-[10px]"
                            }
                          >
                            {isPublisher ? "subscriber" : "following"}
                          </Badge>
                          <Link
                            to={`/robot/${other?.id}`}
                            className="text-sm text-primary hover:underline truncate"
                          >
                            {other?.name ?? "Unknown"}
                          </Link>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {sub.reason}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-foreground">
                          {(sub.relevance_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">relevance</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {subscriptions.length === 0 && (
                <p className="text-center text-muted-foreground py-8 col-span-2">
                  No subscriptions yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RobotProfilePage;
