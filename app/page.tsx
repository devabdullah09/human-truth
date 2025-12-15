import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, BarChart3, MessageSquare, Zap, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-grid-pattern relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Retell AI</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">VoiceInsight</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your voice interviews into actionable insights with 
            AI-powered analytics and real-time transcription.
          </p>
          
          <Link href="/dashboard">
            <Button size="lg" className="group bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8 py-6 text-lg glow animate-pulse-glow">
              Open Dashboard
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          <Card className="glass card-hover animate-fade-in-up stagger-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track interview metrics, completion rates, and performance insights instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass card-hover animate-fade-in-up stagger-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-teal-400" />
              </div>
              <CardTitle className="text-xl">Question Analytics</CardTitle>
              <CardDescription className="text-muted-foreground">
                Analyze responses across all interviews with question-by-question breakdowns.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass card-hover animate-fade-in-up stagger-3">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-xl">Voice Transcripts</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access complete conversation transcripts with clear agent and user distinction.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="glass overflow-hidden animate-fade-in-up stagger-4">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-8 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Automated Processing</div>
              </div>
              <div className="p-8 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">&lt;1s</div>
                <div className="text-sm text-muted-foreground">Webhook Response</div>
              </div>
              <div className="p-8 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">Real-time</div>
                <div className="text-sm text-muted-foreground">Data Updates</div>
              </div>
              <div className="p-8 text-center">
                <div className="text-4xl font-bold gradient-text mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Interviews Supported</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-20 text-center animate-fade-in-up stagger-5">
          <Card className="glass border-emerald-500/20 glow-sm inline-block">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Ready to get started?</div>
                  <div className="text-sm text-muted-foreground">View your interview analytics now</div>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Drizzle ORM, and Retell AI</p>
        </footer>
      </div>
    </main>
  );
}
