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
    
    // Validate payload with Zod
    const validationResult = retellWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Invalid webhook payload:", validationResult.error);
      // Log the actual body structure for debugging
      console.error("Actual payload structure:", JSON.stringify(body, null, 2));
      return NextResponse.json(
        { error: "Invalid webhook payload", details: validationResult.error },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // Process both call_ended and call_analysis events
    if (payload.event !== "call_ended" && payload.event !== "call_analysis") {
      return NextResponse.json(
        { message: "Event not processed", event: payload.event },
        { status: 200 }
      );
    }

    const callId = payload.call.call_id;
    
    // Extract transcript - try multiple possible locations
    let transcript: Array<{ role: "agent" | "user"; content: string; timestamp?: number }> = [];
    
    if (body.transcript && Array.isArray(body.transcript)) {
      transcript = body.transcript.map((item: any) => ({
        role: (item.role === "assistant" ? "agent" : item.role) as "agent" | "user",
        content: item.content || item.text || "",
        timestamp: item.timestamp,
      })).filter((item: any) => item.content);
    } else if (body.transcript_events && Array.isArray(body.transcript_events)) {
      // Retell might send transcript_events instead
      transcript = body.transcript_events.map((event: any) => ({
        role: (event.role === "assistant" ? "agent" : (event.role || event.sender || "user")) as "agent" | "user",
        content: event.text || event.content || event.message || "",
        timestamp: event.timestamp || event.created_at,
      })).filter((event: any) => event.content);
    } else if (payload.transcript && Array.isArray(payload.transcript)) {
      transcript = payload.transcript.map((item: any) => ({
        role: (item.role === "assistant" ? "agent" : item.role) as "agent" | "user",
        content: item.content || item.text || "",
        timestamp: item.timestamp,
      })).filter((item: any) => item.content);
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
    
    console.log("Extracted data:", { callId, transcriptLength: transcript.length, duration, completed });

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
