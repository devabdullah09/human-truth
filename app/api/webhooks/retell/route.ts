import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviews } from "@/lib/db/schema";
import { retellWebhookSchema } from "@/lib/validations/webhook";
import { eq } from "drizzle-orm";

// Mock webhook signature validation
function validateWebhookSignature(request: NextRequest): boolean {
  // In production, you would validate the signature from Retell AI
  // For now, we'll use a mock validation
  const signature = request.headers.get("x-retell-signature");
  
  // Mock validation - always return true for development
  // In production, verify against Retell's webhook secret
  if (process.env.NODE_ENV === "production") {
    // TODO: Implement actual signature validation
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RETELL_WEBHOOK_SECRET!)
    //   .update(JSON.stringify(body))
    //   .digest("hex");
    // return signature === expectedSignature;
  }
  
  return true; // Mock validation passes
}

export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature
    if (!validateWebhookSignature(request)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Log the incoming payload for debugging
    console.log("Received webhook payload:", JSON.stringify(body, null, 2));
    
    // Validate payload with Zod (but be lenient for call_analyzed events)
    const validationResult = retellWebhookSchema.safeParse(body);
    
    let payload: any;
    if (!validationResult.success) {
      // For call_analyzed events, be more lenient with validation
      if (body.event === "call_analyzed" && body.call?.call_id) {
        console.warn("Validation failed but accepting call_analyzed event:", validationResult.error);
        payload = body; // Use raw body for call_analyzed events
      } else {
        console.error("Invalid webhook payload:", validationResult.error);
        // Log the actual body structure for debugging
        console.error("Actual payload structure:", JSON.stringify(body, null, 2));
        return NextResponse.json(
          { error: "Invalid webhook payload", details: validationResult.error },
          { status: 400 }
        );
      }
    } else {
      payload = validationResult.data;
    }

    // Process call_ended, call_analysis, and call_analyzed events
    // call_analyzed typically contains the transcript
    if (payload.event !== "call_ended" && payload.event !== "call_analysis" && payload.event !== "call_analyzed") {
      return NextResponse.json(
        { message: "Event not processed", event: payload.event },
        { status: 200 }
      );
    }

    const callId = payload.call.call_id;
    
    // Extract transcript - try multiple possible locations and formats
    let transcript: Array<{ role: "agent" | "user"; content: string; timestamp?: number }> = [];
    
    // Log all possible transcript locations for debugging
    console.log("Checking transcript locations:", {
      hasBodyTranscript: !!body.transcript,
      hasBodyTranscriptEvents: !!body.transcript_events,
      hasPayloadTranscript: !!payload.transcript,
      hasBodyCallTranscript: !!body.call?.transcript,
      bodyKeys: Object.keys(body),
    });
    
    // Try body.transcript first (most common)
    if (body.transcript && Array.isArray(body.transcript)) {
      console.log("Found transcript in body.transcript:", body.transcript.length, "items");
      transcript = body.transcript.map((item: any) => ({
        role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
        content: item.content || item.text || item.message || String(item),
        timestamp: item.timestamp || item.time || item.created_at,
      })).filter((item: any) => item.content && item.content.trim());
    }
    // Try body.transcript_events
    else if (body.transcript_events && Array.isArray(body.transcript_events)) {
      console.log("Found transcript in body.transcript_events:", body.transcript_events.length, "items");
      transcript = body.transcript_events.map((event: any) => ({
        role: (event.role === "assistant" || event.role === "agent" ? "agent" : (event.role || event.sender || "user")) as "agent" | "user",
        content: event.text || event.content || event.message || event.transcript || String(event),
        timestamp: event.timestamp || event.time || event.created_at,
      })).filter((event: any) => event.content && event.content.trim());
    }
    // Try body.call.transcript
    else if (body.call?.transcript && Array.isArray(body.call.transcript)) {
      console.log("Found transcript in body.call.transcript:", body.call.transcript.length, "items");
      transcript = body.call.transcript.map((item: any) => ({
        role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
        content: item.content || item.text || item.message || String(item),
        timestamp: item.timestamp || item.time,
      })).filter((item: any) => item.content && item.content.trim());
    }
    // Try payload.transcript
    else if (payload.transcript && Array.isArray(payload.transcript)) {
      console.log("Found transcript in payload.transcript:", payload.transcript.length, "items");
      transcript = payload.transcript.map((item: any) => ({
        role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
        content: item.content || item.text || item.message || String(item),
        timestamp: item.timestamp || item.time,
      })).filter((item: any) => item.content && item.content.trim());
    }
    // Try body.analysis.transcript or body.analysis.transcript_events
    else if (body.analysis?.transcript && Array.isArray(body.analysis.transcript)) {
      console.log("Found transcript in body.analysis.transcript:", body.analysis.transcript.length, "items");
      transcript = body.analysis.transcript.map((item: any) => ({
        role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
        content: item.content || item.text || item.message || String(item),
        timestamp: item.timestamp || item.time,
      })).filter((item: any) => item.content && item.content.trim());
    }
    
    // For call_analyzed events, transcript might be in different locations
    if (transcript.length === 0 && (payload.event === "call_analyzed" || body.event === "call_analyzed")) {
      // Try body.transcript_items or body.transcript_segments
      if (body.transcript_items && Array.isArray(body.transcript_items)) {
        console.log("Found transcript in body.transcript_items:", body.transcript_items.length, "items");
        transcript = body.transcript_items.map((item: any) => ({
          role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
          content: item.content || item.text || item.message || String(item),
          timestamp: item.timestamp || item.time || item.start_time,
        })).filter((item: any) => item.content && item.content.trim());
      }
      // Try body.transcript_segments
      else if (body.transcript_segments && Array.isArray(body.transcript_segments)) {
        console.log("Found transcript in body.transcript_segments:", body.transcript_segments.length, "items");
        transcript = body.transcript_segments.map((item: any) => ({
          role: (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
          content: item.content || item.text || item.message || String(item),
          timestamp: item.timestamp || item.time || item.start_time,
        })).filter((item: any) => item.content && item.content.trim());
      }
      // Try body.utterances (common in speech-to-text APIs)
      else if (body.utterances && Array.isArray(body.utterances)) {
        console.log("Found transcript in body.utterances:", body.utterances.length, "items");
        transcript = body.utterances.map((item: any) => ({
          role: (item.speaker === "assistant" || item.speaker === "agent" || item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user",
          content: item.text || item.content || item.message || String(item),
          timestamp: item.timestamp || item.start_time || item.time,
        })).filter((item: any) => item.content && item.content.trim());
      }
    }
    
    // If still no transcript, log the entire body structure for debugging
    if (transcript.length === 0) {
      console.log("No transcript found. Full body structure:", JSON.stringify(body, null, 2));
    }
    
    // Extract duration - try multiple possible fields
    let duration = payload.call_duration || 0;
    if (!duration && body.call) {
      duration = body.call.duration || body.call.call_duration || 0;
    }
    if (!duration && body.duration) {
      duration = body.duration;
    }
    // Calculate from timestamps if available
    if (!duration && body.call?.start_timestamp && body.call?.end_timestamp) {
      duration = Math.floor((body.call.end_timestamp - body.call.start_timestamp) / 1000);
    }
    
    const completed = payload.end_reason !== "error" && payload.end_reason !== "failed";
    
    console.log("Extracted data:", { 
      callId, 
      transcriptLength: transcript.length, 
      duration, 
      completed,
      event: payload.event || body.event,
      transcriptPreview: transcript.slice(0, 2).map(t => ({ role: t.role, content: t.content.substring(0, 50) }))
    });

    // Check if interview already exists
    const existingInterview = await db
      .select()
      .from(interviews)
      .where(eq(interviews.callId, callId))
      .limit(1);

    if (existingInterview.length > 0) {
      // Update existing interview
      await db
        .update(interviews)
        .set({
          transcript,
          duration,
          completed,
          updatedAt: new Date(),
        })
        .where(eq(interviews.callId, callId));

      return NextResponse.json(
        { message: "Interview updated successfully" },
        { status: 200 }
      );
    }

    // Create new interview
    await db.insert(interviews).values({
      callId,
      participantId: payload.call.metadata?.participant_id || null,
      transcript,
      duration,
      completed,
    });

    return NextResponse.json(
      { message: "Interview stored successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification (if needed)
export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint is active" });
}
