import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviews } from "@/lib/db/schema";
import { retellWebhookSchema } from "@/lib/validations/webhook";
import { eq } from "drizzle-orm";

function validateWebhookSignature(request: NextRequest): boolean {
  const signature = request.headers.get("x-retell-signature");
  
  if (process.env.NODE_ENV === "production") {
  }
  
  return true;
}

function extractTranscript(body: any): Array<{ role: "agent" | "user"; content: string; timestamp?: number }> {
  let transcript: Array<{ role: "agent" | "user"; content: string; timestamp?: number }> = [];

  const normalizeRole = (role: string): "agent" | "user" => {
    return (role === "assistant" || role === "agent") ? "agent" : "user";
  };

  const extractContent = (item: any): string => {
    return item.content || item.text || item.message || item.transcript || item.words || String(item) || "";
  };

  const extractTimestamp = (item: any): number | undefined => {
    return item.timestamp || item.time || item.created_at || item.start_time;
  };

  const processTranscriptArray = (items: any[]): Array<{ role: "agent" | "user"; content: string; timestamp?: number }> => {
    return items
      .map((item) => ({
        role: normalizeRole(item.role || item.speaker || "user"),
        content: extractContent(item),
        timestamp: extractTimestamp(item),
      }))
      .filter((item) => item.content && item.content.trim().length > 0);
  };

  if (body.transcript_object && Array.isArray(body.transcript_object)) {
    transcript = processTranscriptArray(body.transcript_object);
  } else if (body.call?.transcript_object && Array.isArray(body.call.transcript_object)) {
    transcript = processTranscriptArray(body.call.transcript_object);
  } else if (body.call?.transcript && Array.isArray(body.call.transcript)) {
    transcript = processTranscriptArray(body.call.transcript);
  } else if (body.transcript && Array.isArray(body.transcript)) {
    transcript = processTranscriptArray(body.transcript);
  } else if (body.transcript_events && Array.isArray(body.transcript_events)) {
    transcript = processTranscriptArray(body.transcript_events);
  } else if (body.analysis?.transcript && Array.isArray(body.analysis.transcript)) {
    transcript = processTranscriptArray(body.analysis.transcript);
  } else if (body.transcript_items && Array.isArray(body.transcript_items)) {
    transcript = processTranscriptArray(body.transcript_items);
  } else if (body.transcript_segments && Array.isArray(body.transcript_segments)) {
    transcript = processTranscriptArray(body.transcript_segments);
  } else if (body.utterances && Array.isArray(body.utterances)) {
    transcript = processTranscriptArray(body.utterances);
  }

  return transcript;
}

function extractDuration(body: any, payload: any): number {
  let duration = payload.call_duration || body.call_duration || 0;
  
  if (!duration && body.call) {
    duration = body.call.duration || body.call.call_duration || 0;
  }
  
  if (!duration && body.duration) {
    duration = body.duration;
  }
  
  if (!duration && body.call?.start_timestamp && body.call?.end_timestamp) {
    duration = Math.floor((body.call.end_timestamp - body.call.start_timestamp) / 1000);
  }
  
  return duration;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateWebhookSignature(request)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = retellWebhookSchema.safeParse(body);
    
    let payload: any;
    if (!validationResult.success) {
      if (body.event === "call_analyzed" && body.call?.call_id) {
        payload = body;
      } else {
        console.error("Invalid webhook payload:", validationResult.error);
        return NextResponse.json(
          { error: "Invalid webhook payload", details: validationResult.error },
          { status: 400 }
        );
      }
    } else {
      payload = validationResult.data;
      if (body.transcript_object && !payload.transcript_object) {
        payload.transcript_object = body.transcript_object;
      }
    }

    const eventType = payload.event || body.event;
    
    if (eventType !== "call_ended" && eventType !== "call_analysis" && eventType !== "call_analyzed") {
      return NextResponse.json(
        { message: "Event not processed", event: eventType },
        { status: 200 }
      );
    }

    const callId = payload.call.call_id;
    const transcript = extractTranscript(body);
    const duration = extractDuration(body, payload);
    const completed = payload.end_reason !== "error" && payload.end_reason !== "failed";

    const existingInterview = await db
      .select()
      .from(interviews)
      .where(eq(interviews.callId, callId))
      .limit(1);

    if (existingInterview.length > 0) {
      const updateData: any = {
        duration,
        completed,
        updatedAt: new Date(),
      };
      
      if (transcript.length > 0) {
        updateData.transcript = transcript;
      }
      
      await db
        .update(interviews)
        .set(updateData)
        .where(eq(interviews.callId, callId));

      return NextResponse.json(
        { message: "Interview updated successfully", transcriptLength: transcript.length },
        { status: 200 }
      );
    }

    await db.insert(interviews).values({
      callId,
      participantId: payload.call.metadata?.participant_id || null,
      transcript: transcript.length > 0 ? transcript : [],
      duration,
      completed,
    });

    return NextResponse.json(
      { message: "Interview stored successfully", transcriptLength: transcript.length },
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

export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint is active" });
}
