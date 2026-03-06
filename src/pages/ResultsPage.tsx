import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bot, ArrowLeft, Clock, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROBOTS, type MatchedRobot } from "@/data/robots";
import BookingModal from "@/components/BookingModal";
import { addDays, format } from "date-fns";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRobot, setSelectedRobot] = useState<MatchedRobot | null>(null);

  const aiResult = location.state?.aiResult;

  if (!aiResult) {
    navigate("/");
    return null;
  }

  const detectedTasks: string[] = aiResult.detectedTasks || [];
  const aiMatches: { id: string; matchScore: number; matchReason: string }[] = aiResult.matchedRobots || [];

  // Build matched robots list
  const matchedRobots: MatchedRobot[] = (() => {
    if (aiMatches.length > 0) {
      return aiMatches
        .map((match) => {
          const robot = ROBOTS.find((r) => r.id === match.id);
          if (!robot) return null;
          return { ...robot, matchScore: match.matchScore, matchReason: match.matchReason };
        })
        .filter(Boolean) as MatchedRobot[];
    }
    // Fallback: show all robots
    return ROBOTS.map((r) => ({
      ...r,
      matchScore: 70,
      matchReason: "General match based on your job description.",
    }));
  })();

  const today = new Date();

  return (
    <div className="min-h-screen gradient-navy">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-7 h-7 text-primary" />
            <span className="font-heading font-bold text-lg text-foreground">RoboHire</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {detectedTasks.length > 0 && (
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-5 shadow-card">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-heading font-semibold text-foreground mb-2">AI Analysis Complete</p>
                <p className="text-muted-foreground text-sm">
                  We detected:{" "}
                  {detectedTasks.map((task, i) => (
                    <Badge key={i} variant="secondary" className="mr-1.5 mb-1">
                      {task}
                    </Badge>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="container mx-auto px-4 pb-20">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
          {matchedRobots.length} Robots Matched
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedRobots.map((robot, index) => {
            const availDate = addDays(today, robot.availableInDays);
            const endDate = addDays(availDate, 30);

            return (
              <div
                key={robot.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Robot Image */}
                <div className="relative h-48 bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={robot.image}
                    alt={robot.name}
                    className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="gradient-orange text-primary-foreground font-heading font-bold border-0">
                      {robot.matchScore}% match
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground">{robot.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {robot.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">"{robot.matchReason}"</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="font-heading font-bold text-xl text-primary">${robot.hourlyRate}</span>
                      <span className="text-muted-foreground">/hr</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Available in {robot.availableInDays} day{robot.availableInDays !== 1 && "s"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(availDate, "MMM d")} – {format(endDate, "MMM d")}
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => setSelectedRobot(robot)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRobot && (
        <BookingModal
          robot={selectedRobot}
          detectedTasks={detectedTasks}
          onClose={() => setSelectedRobot(null)}
        />
      )}
    </div>
  );
};

export default ResultsPage;
