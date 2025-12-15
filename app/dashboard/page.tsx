import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInterviewStats, getQuestionAnalytics, getAllInterviews } from "@/lib/db/queries";
import { formatDistanceToNow } from "date-fns";

async function DashboardStats() {
  const stats = await getInterviewStats();
  
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Total Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalInterviews}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.completedInterviews} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Average Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {Math.floor(stats.averageDuration / 60)}m {stats.averageDuration % 60}s
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Per interview
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.completionRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            Successfully completed
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
      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
          <CardDescription>
            No questions found in interviews yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question-by-Question Analytics</CardTitle>
        <CardDescription>
          Insights for each question asked across all interviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questionAnalytics.map((qa, index) => (
            <div key={index} className="border-b pb-6 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{qa.question}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong>{qa.totalResponses}</strong> responses
                    </span>
                    <span>
                      Avg length: <strong>{qa.averageLength}</strong> chars
                    </span>
                  </div>
                </div>
              </div>

              {qa.responses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Answers:</h4>
                  <ScrollArea className="h-32 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {qa.responses.map((response, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {response.callId.slice(0, 8)}...
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(response.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground pl-1">{response.answer}</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>No interviews yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interviews</CardTitle>
        <CardDescription>Latest interview sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentInterviews.map((interview) => (
            <Link
              key={interview.id}
              href={`/interview/${interview.callId}`}
              className="block p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm">{interview.callId.slice(0, 12)}...</span>
                    <Badge variant={interview.completed ? "default" : "secondary"}>
                      {interview.completed ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(interview.duration / 60)}m {interview.duration % 60}s •{" "}
                    {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View →
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">
            Track and analyze your voice interviews
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <RecentInterviews />
        </div>

        <QuestionAnalytics />
      </div>
    </main>
  );
}
