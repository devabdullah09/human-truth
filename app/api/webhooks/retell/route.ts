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
    
    // Validate payload with Zod
    const validationResult = retellWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Invalid webhook payload:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid webhook payload", details: validationResult.error },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // Only process call_ended events
    if (payload.event !== "call_ended") {
      return NextResponse.json(
        { message: "Event not processed" },
        { status: 200 }
      );
    }

    const callId = payload.call.call_id;
    const transcript = payload.transcript || [];
    const duration = payload.call_duration || 0;
    const completed = payload.end_reason !== "error";

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
