import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  BarChart3,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/sns/TopNav";
import { MOCK_PIPELINE_JOBS, MOCK_ROBOT_PROFILES } from "@/data/sns/mockData";
import { calculatePipelineStats } from "@/lib/sns/pipeline";

const stageColors: Record<string, string> = {
  ingested: "text-gray-400",
  deduplicating: "text-blue-400",
  validating: "text-yellow-400",
  enriching: "text-cyan-400",
  converting: "text-purple-400",
  complete: "text-green-400",
  failed: "text-red-400",
};

const stageBadgeClasses: Record<string, string> = {
  ingested: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  deduplicating: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  validating: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  enriching: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  converting: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  complete: "bg-green-500/15 text-green-400 border-green-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const PipelinePage = () => {
  const stats = useMemo(
    () => calculatePipelineStats(MOCK_PIPELINE_JOBS),
    []
  );

  const processingJobs = MOCK_PIPELINE_JOBS.filter(
    (j) => !["complete", "failed"].includes(j.stage)
  );
  const recentComplete = MOCK_PIPELINE_JOBS.filter(
    (j) => j.stage === "complete"
  ).slice(0, 8);
  const failedJobs = MOCK_PIPELINE_JOBS.filter((j) => j.stage === "failed");

  return (
    <div className="min-h-screen gradient-navy">
      <TopNav />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Data Ingestion Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time view of the accelerated data collection and processing pipeline
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Jobs",
              value: stats.total_jobs.toString(),
              icon: Layers,
              color: "text-blue-400",
            },
            {
              label: "Processing",
              value: stats.jobs_processing.toString(),
              icon: Loader2,
              color: "text-yellow-400",
            },
            {
              label: "Complete",
              value: stats.jobs_complete.toString(),
              icon: CheckCircle2,
              color: "text-green-400",
            },
            {
              label: "Failed",
              value: stats.jobs_failed.toString(),
              icon: AlertTriangle,
              color: "text-red-400",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">In Queue</p>
              <p className="text-xl font-heading font-bold text-foreground">
                {stats.jobs_in_queue}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Records Today</p>
              <p className="text-xl font-heading font-bold text-foreground">
                {stats.records_processed_today.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Processing Time</p>
              <p className="text-xl font-heading font-bold text-foreground">
                {(stats.avg_processing_time_ms / 1000).toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Processing jobs */}
        {processingJobs.length > 0 && (
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                Currently Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingJobs.map((job) => {
                  const robot = MOCK_ROBOT_PROFILES.find(
                    (r) => r.id === job.robot_id
                  );
                  return (
                    <div key={job.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/robot/${job.robot_id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {robot?.name ?? job.robot_id}
                          </Link>
                          <Badge variant="outline" className="text-[10px]">
                            {job.source_type}
                          </Badge>
                        </div>
                        <Badge
                          className={`${stageBadgeClasses[job.stage]} border text-[10px]`}
                        >
                          {job.stage}
                        </Badge>
                      </div>
                      <Progress value={job.progress_pct} className="h-2 mb-1" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>
                          {job.raw_record_count} raw records
                          {job.deduplicated_count !== null &&
                            ` / ${job.deduplicated_count} deduped`}
                        </span>
                        <span>{job.progress_pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipeline stages visualization */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Pipeline Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                "ingested",
                "deduplicating",
                "validating",
                "enriching",
                "converting",
                "complete",
              ].map((stage, i, arr) => {
                const count = MOCK_PIPELINE_JOBS.filter(
                  (j) => j.stage === stage
                ).length;
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <div className="text-center min-w-[90px]">
                      <div
                        className={`text-2xl font-heading font-bold ${stageColors[stage]}`}
                      >
                        {count}
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {stage}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-muted-foreground text-lg">-&gt;</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completed jobs */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentComplete.map((job) => {
                  const robot = MOCK_ROBOT_PROFILES.find(
                    (r) => r.id === job.robot_id
                  );
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/robot/${job.robot_id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {robot?.name ?? job.robot_id}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {job.validated_count ?? job.raw_record_count} records / {job.source_type}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(job.updated_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Failed jobs */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Failed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {failedJobs.length > 0 ? (
                  failedJobs.map((job) => {
                    const robot = MOCK_ROBOT_PROFILES.find(
                      (r) => r.id === job.robot_id
                    );
                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/robot/${job.robot_id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {robot?.name ?? job.robot_id}
                          </Link>
                          <p className="text-[10px] text-red-400">
                            {job.error_message}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {job.raw_record_count} records / {job.source_type}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(job.updated_at)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No failed jobs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
