import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInterviewByCallId } from "@/lib/db/queries";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

async function InterviewDetail({ callId }: { callId: string }) {
  const interview = await getInterviewByCallId(callId);

  if (!interview) {
    notFound();
  }

  const transcript = interview.transcript || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Details</h1>
          <p className="text-lg text-gray-600 font-mono">{interview.callId}</p>
        </div>

        {/* Metadata Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interview Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">
                    {Math.floor(interview.duration / 60)}m {interview.duration % 60}s
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {interview.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold">
                    {interview.completed ? "Completed" : "Incomplete"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-semibold">
                  {format(interview.createdAt, "PPpp")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
                </div>
              </div>

              {interview.participantId && (
                <div>
                  <div className="text-sm text-muted-foreground">Participant ID</div>
                  <div className="font-semibold font-mono text-sm">
                    {interview.participantId}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcript Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Complete conversation transcript ({transcript.length} messages)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transcript.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No transcript available
              </p>
            ) : (
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "agent" ? "justify-start" : "justify-end"
                      }`}
                    >
                      {message.role === "agent" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                            AI
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "agent"
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={message.role === "agent" ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {message.role === "agent" ? "Agent" : "User"}
                          </Badge>
                          {message.timestamp && (
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp * 1000).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
                            U
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default async function InterviewPage({
  params,
}: {
  params: { callId: string };
}) {
  return <InterviewDetail callId={params.callId} />;
}
