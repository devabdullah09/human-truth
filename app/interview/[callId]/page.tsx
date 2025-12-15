import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInterviewByCallId } from "@/lib/db/queries";
import { formatDistanceToNow, format } from "date-fns";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  User, 
  Bot,
  Calendar,
  Hash,
  Mic
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function InterviewDetail({ callId }: { callId: string }) {
  const interview = await getInterviewByCallId(callId);

  if (!interview) {
    notFound();
  }

  const transcript = interview.transcript || [];

  return (
    <main className="min-h-screen bg-grid-pattern relative">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-block mb-6 animate-fade-in">
          <Button variant="ghost" className="group hover:bg-emerald-500/10">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:text-emerald-400 transition-colors" />
            <span className="group-hover:text-emerald-400 transition-colors">Back to Dashboard</span>
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Mic className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Interview Details</span>
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">{interview.callId}</p>
            </div>
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="glass card-hover animate-fade-in-up stagger-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</div>
                  <div className="font-semibold">
                    {Math.floor(interview.duration / 60)}m {interview.duration % 60}s
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass card-hover animate-fade-in-up stagger-2">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  interview.completed ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                }`}>
                  {interview.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                  <div className="font-semibold flex items-center gap-2">
                    <div className={`status-dot ${interview.completed ? 'status-dot-active' : 'status-dot-inactive'}`} />
                    {interview.completed ? "Completed" : "Incomplete"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass card-hover animate-fade-in-up stagger-3">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</div>
                  <div className="font-semibold text-sm">
                    {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass card-hover animate-fade-in-up stagger-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Messages</div>
                  <div className="font-semibold">{transcript.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        {(interview.participantId || true) && (
          <Card className="glass mb-8 animate-fade-in-up stagger-5">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Call ID</div>
                    <div className="font-mono text-sm">{interview.callId}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Exact Time</div>
                    <div className="text-sm">{format(interview.createdAt, "PPpp")}</div>
                  </div>
                </div>

                {interview.participantId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Participant ID</div>
                      <div className="font-mono text-sm">{interview.participantId}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        <Card className="glass animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle>Conversation Transcript</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {transcript.length} messages in this interview
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transcript.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No transcript available</p>
                <p className="text-sm mt-2">The transcript data may not have been received yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] w-full rounded-xl bg-background/50 border border-border/30 p-6">
                <div className="space-y-4">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 animate-fade-in ${
                        message.role === "agent" ? "justify-start" : "justify-end"
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {message.role === "agent" && (
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-emerald-400" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 ${
                          message.role === "agent"
                            ? "bg-secondary/50 border border-border/50"
                            : "bg-emerald-500/10 border border-emerald-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              message.role === "agent" 
                                ? "border-emerald-500/30 text-emerald-400" 
                                : "border-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {message.role === "agent" ? "Agent" : "User"}
                          </Badge>
                          {message.timestamp && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp * 1000).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-400" />
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
