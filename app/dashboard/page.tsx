import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInterviewStats, getQuestionAnalytics, getAllInterviews } from "@/lib/db/queries";
import { formatDistanceToNow } from "date-fns";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  Users,
  TrendingUp,
  Mic,
  Home
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function DashboardStats() {
  const stats = await getInterviewStats();
  
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card className="glass card-hover animate-fade-in-up stagger-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              Total
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalInterviews}</div>
          <p className="text-sm text-muted-foreground">
            {stats.completedInterviews} completed
          </p>
        </CardContent>
      </Card>

      <Card className="glass card-hover animate-fade-in-up stagger-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <Badge variant="outline" className="text-teal-400 border-teal-500/30">
              Avg
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            {Math.floor(stats.averageDuration / 60)}m {stats.averageDuration % 60}s
          </div>
          <p className="text-sm text-muted-foreground">
            Per interview
          </p>
        </CardContent>
      </Card>

      <Card className="glass card-hover animate-fade-in-up stagger-3">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
              Rate
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.completionRate}%</div>
          <p className="text-sm text-muted-foreground">
            Completion rate
          </p>
        </CardContent>
      </Card>

      <Card className="glass card-hover animate-fade-in-up stagger-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-violet-400" />
            </div>
            <Badge variant="outline" className="text-violet-400 border-violet-500/30">
              Done
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.completedInterviews}</div>
          <p className="text-sm text-muted-foreground">
            Successful
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function QuestionAnalytics() {
  const questionAnalytics = await getQuestionAnalytics();

  if (questionAnalytics.length === 0) {
    return (
      <Card className="glass animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle>Question Analytics</CardTitle>
              <CardDescription className="text-muted-foreground">
                No questions found in interviews yet
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Mic className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Questions will appear here after interviews are conducted</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle>Question Analytics</CardTitle>
            <CardDescription className="text-muted-foreground">
              Insights for each question across all interviews
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questionAnalytics.map((qa, index) => (
            <div 
              key={index} 
              className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-base mb-2 leading-relaxed">{qa.question}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Users className="w-3.5 h-3.5" />
                      {qa.totalResponses} responses
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart3 className="w-3.5 h-3.5" />
                      {qa.averageLength} avg chars
                    </span>
                  </div>
                </div>
              </div>

              {qa.responses.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Recent Answers
                  </div>
                  <ScrollArea className="h-28 w-full rounded-lg bg-background/50 border border-border/30 p-3">
                    <div className="space-y-3">
                      {qa.responses.map((response, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono bg-secondary/50">
                              {response.callId.slice(0, 8)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(response.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{response.answer}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentInterviews() {
  const allInterviews = await getAllInterviews();
  const recentInterviews = allInterviews.slice(0, 5);

  if (recentInterviews.length === 0) {
    return (
      <Card className="glass animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription className="text-muted-foreground">No interviews yet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Mic className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Interviews will appear here once recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Mic className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription className="text-muted-foreground">Latest interview sessions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentInterviews.map((interview, index) => (
            <Link
              key={interview.id}
              href={`/interview/${interview.callId}`}
              className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-emerald-500/30 hover:bg-secondary/50 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`status-dot ${interview.completed ? 'status-dot-active' : 'status-dot-inactive'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm">{interview.callId.slice(0, 12)}...</span>
                    <Badge 
                      variant={interview.completed ? "default" : "secondary"}
                      className={interview.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
                    >
                      {interview.completed ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(interview.duration / 60)}m {interview.duration % 60}s
                    <span className="text-border">•</span>
                    {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-grid-pattern relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Analytics Dashboard</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Track and analyze your voice interviews in real-time
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-border hover:border-emerald-500/30 hover:bg-emerald-500/10">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <DashboardStats />
        
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <RecentInterviews />
          <div className="space-y-6">
            <Card className="glass animate-fade-in-up">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Webhook Active</h3>
                    <p className="text-sm text-muted-foreground">
                      Receiving data from Retell AI
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-2">
                      <div className="status-dot status-dot-active" />
                      <span className="text-sm text-emerald-400">Live</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <QuestionAnalytics />
      </div>
    </main>
  );
}
