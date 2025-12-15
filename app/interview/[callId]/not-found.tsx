import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic } from "lucide-react";

export default function InterviewNotFound() {
  return (
    <main className="min-h-screen bg-grid-pattern flex items-center justify-center relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
          <Mic className="w-10 h-10 text-emerald-400" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Interview Not Found</span>
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          This interview doesn&apos;t exist or the call ID is incorrect.
        </p>
        
        <Link href="/dashboard">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
}
