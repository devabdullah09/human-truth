import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Voice Interview Platform
          </h1>
          <p className="text-lg text-gray-600">
            Powered by Retell AI - Track and analyze your voice interviews
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Get started by viewing your interview analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button size="lg" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View interview metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Total interviews completed</li>
                <li>Average interview duration</li>
                <li>Completion rate</li>
                <li>Question-by-question analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>
                View complete transcripts and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Full conversation transcripts</li>
                <li>Interview metadata</li>
                <li>Formatted agent vs user messages</li>
                <li>Call duration and status</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
