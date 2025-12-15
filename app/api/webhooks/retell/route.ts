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
    
    // Log the incoming payload for debugging (truncated for readability)
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Event:", body.event, "Call ID:", body.call?.call_id);
    console.log("Top-level keys:", Object.keys(body));
    console.log("Has transcript_object (top level):", !!body.transcript_object);
    console.log("Has transcript (top level):", !!body.transcript);
    console.log("Has call.transcript:", !!body.call?.transcript);
    console.log("call keys:", body.call ? Object.keys(body.call) : []);
    
    // Log the actual transcript_object if it exists
    if (body.transcript_object) {
      console.log("transcript_object type:", typeof body.transcript_object, "isArray:", Array.isArray(body.transcript_object));
      if (Array.isArray(body.transcript_object) && body.transcript_object.length > 0) {
        console.log("transcript_object length:", body.transcript_object.length);
        console.log("First transcript_object item:", JSON.stringify(body.transcript_object[0], null, 2));
      }
    }
    
    // Also check if transcript_object is nested in call
    if (body.call?.transcript_object) {
      console.log("Found transcript_object in call.transcript_object!");
      console.log("call.transcript_object type:", typeof body.call.transcript_object, "isArray:", Array.isArray(body.call.transcript_object));
    }
    
    // Check for transcript_object BEFORE validation (it might get stripped)
    const hasTranscriptObjectBeforeValidation = !!body.transcript_object;
    console.log("BEFORE VALIDATION - Has transcript_object:", hasTranscriptObjectBeforeValidation);
    if (body.transcript_object) {
      console.log("BEFORE VALIDATION - transcript_object type:", typeof body.transcript_object, "isArray:", Array.isArray(body.transcript_object));
      if (Array.isArray(body.transcript_object)) {
        console.log("BEFORE VALIDATION - transcript_object length:", body.transcript_object.length);
      }
    }
    
    // Validate payload with Zod (but be more lenient - don't strip transcript_object)
    const validationResult = retellWebhookSchema.safeParse(body);
    
    let payload: any;
    if (!validationResult.success) {
      // For call_analyzed events, be more lenient with validation
      if (body.event === "call_analyzed" && body.call?.call_id) {
        console.warn("Validation failed but accepting call_analyzed event:", validationResult.error);
        payload = body; // Use raw body for call_analyzed events - preserves transcript_object
      } else {
        console.error("Invalid webhook payload:", validationResult.error);
        // Still use raw body to preserve transcript_object
        payload = body;
        console.warn("Using raw body despite validation failure to preserve transcript_object");
      }
    } else {
      payload = validationResult.data;
      // Make sure transcript_object is preserved even after validation
      if (body.transcript_object && !payload.transcript_object) {
        payload.transcript_object = body.transcript_object;
        console.log("Restored transcript_object from raw body after validation");
      }
    }
    
    console.log("AFTER VALIDATION - Has transcript_object:", !!payload.transcript_object, "Has body.transcript_object:", !!body.transcript_object);

    // Process call_ended, call_analysis, and call_analyzed events
    // call_analyzed typically contains the transcript
    const eventType = payload.event || body.event;
    console.log("Processing event type:", eventType);
    
    if (eventType !== "call_ended" && eventType !== "call_analysis" && eventType !== "call_analyzed") {
      console.log("Skipping event:", eventType);
      return NextResponse.json(
        { message: "Event not processed", event: eventType },
        { status: 200 }
      );
    }

    const callId = payload.call.call_id;
    
    // Extract transcript - try multiple possible locations and formats
    let transcript: Array<{ role: "agent" | "user"; content: string; timestamp?: number }> = [];
    
    // Log all possible transcript locations for debugging
    console.log("Checking transcript locations:", {
      hasBodyTranscript: !!body.transcript,
      hasBodyTranscriptObject: !!body.transcript_object,
      hasBodyTranscriptEvents: !!body.transcript_events,
      hasPayloadTranscript: !!payload.transcript,
      hasBodyCallTranscript: !!body.call?.transcript,
      callKeys: body.call ? Object.keys(body.call) : [],
      bodyKeys: Object.keys(body),
    });
    
    // PRIORITY 1: Check transcript_object at top level FIRST (use raw body, not validated payload!)
    // Validation might strip transcript_object, so always check the raw body
    if (body.transcript_object && Array.isArray(body.transcript_object)) {
      console.log("✓✓✓ FOUND transcript_object at top level:", body.transcript_object.length, "items");
      console.log("First transcript_object item:", JSON.stringify(body.transcript_object[0], null, 2));
      
      transcript = body.transcript_object.map((item: any, index: number) => {
        if (index === 0) {
          console.log("Raw transcript_object item:", JSON.stringify(item, null, 2));
        }
        
        const role = (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user";
        const content = item.content || item.text || item.message || item.transcript || item.words || String(item);
        const timestamp = item.timestamp || item.time || item.created_at || item.start_time;
        
        return {
          role,
          content: content || "",
          timestamp,
        };
      }).filter((item: any) => {
        const hasContent = item.content && item.content.trim().length > 0;
        if (!hasContent) {
          console.log("✗ Filtered out (no content):", item);
        }
        return hasContent;
      });
      
      console.log("✓✓✓ SUCCESS: After processing transcript_object, transcript has", transcript.length, "items");
    }
    // PRIORITY 2: Try body.call.transcript (might be array or string)
    else if (body.call?.transcript) {
      console.log("Found body.call.transcript, type:", typeof body.call.transcript, "isArray:", Array.isArray(body.call.transcript));
      
      if (Array.isArray(body.call.transcript)) {
        console.log("Found transcript in body.call.transcript (array):", body.call.transcript.length, "items");
        console.log("First call.transcript item:", JSON.stringify(body.call.transcript[0], null, 2));
        
        transcript = body.call.transcript.map((item: any, index: number) => {
          if (index === 0) {
            console.log("Raw call.transcript item:", JSON.stringify(item, null, 2));
          }
          
          const role = (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user";
          const content = item.content || item.text || item.message || item.transcript || String(item);
          const timestamp = item.timestamp || item.time || item.created_at || item.start_time;
          
          return {
            role,
            content: content || "",
            timestamp,
          };
        }).filter((item: any) => {
          const hasContent = item.content && item.content.trim().length > 0;
          if (!hasContent) {
            console.log("Filtered out call.transcript item:", item);
          }
          return hasContent;
        });
        
        console.log("After processing call.transcript (array), transcript has", transcript.length, "items");
      } else if (typeof body.call.transcript === "string") {
        // If transcript is a string, try to parse it or use transcript_object
        console.log("body.call.transcript is a string, length:", body.call.transcript.length);
        // Don't process string transcript - wait for transcript_object
      } else {
        console.log("body.call.transcript is neither array nor string:", typeof body.call.transcript, JSON.stringify(body.call.transcript, null, 2));
      }
    }
    // Try body.transcript_object at top level FIRST (Retell sends it here in call_analyzed events!)
    if (!transcript.length && body.transcript_object && Array.isArray(body.transcript_object)) {
      console.log("Found transcript_object at top level:", body.transcript_object.length, "items");
      console.log("First transcript_object item:", JSON.stringify(body.transcript_object[0], null, 2));
      
      transcript = body.transcript_object.map((item: any, index: number) => {
        if (index === 0) {
          console.log("Raw transcript_object item:", JSON.stringify(item, null, 2));
        }
        
        const role = (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user";
        const content = item.content || item.text || item.message || item.transcript || item.words || String(item);
        const timestamp = item.timestamp || item.time || item.created_at || item.start_time;
        
        return {
          role,
          content: content || "",
          timestamp,
        };
      }).filter((item: any) => {
        const hasContent = item.content && item.content.trim().length > 0;
        if (!hasContent) {
          console.log("Filtered out transcript_object item:", item);
        }
        return hasContent;
      });
      
      console.log("After processing transcript_object, transcript has", transcript.length, "items");
    }
    // Try body.call.transcript_object (nested in call)
    else if (body.call?.transcript_object && Array.isArray(body.call.transcript_object)) {
      console.log("Found transcript_object in call.transcript_object:", body.call.transcript_object.length, "items");
      transcript = body.call.transcript_object.map((item: any) => {
        const role = (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user";
        const content = item.content || item.text || item.message || String(item);
        const timestamp = item.timestamp || item.time || item.created_at;
        
        return {
          role,
          content: content || "",
          timestamp,
        };
      }).filter((item: any) => item.content && item.content.trim());
      
      console.log("After processing call.transcript_object, transcript has", transcript.length, "items");
    }
    // Try body.transcript as array (fallback)
    else if (body.transcript && Array.isArray(body.transcript)) {
      console.log("Found transcript_object with", body.transcript_object.length, "items");
      console.log("First item sample:", JSON.stringify(body.transcript_object[0], null, 2));
      
      transcript = body.transcript_object.map((item: any, index: number) => {
        // Log the raw item to see its structure
        if (index === 0) {
          console.log("Raw transcript_object item:", JSON.stringify(item, null, 2));
        }
        
        const role = (item.role === "assistant" || item.role === "agent" ? "agent" : "user") as "agent" | "user";
        // Try multiple possible content field names
        const content = item.content || item.text || item.message || item.transcript || item.words || String(item);
        const timestamp = item.timestamp || item.time || item.created_at || item.start_time;
        
        console.log(`Item ${index}:`, { 
          role, 
          content: content?.substring(0, 50), 
          contentLength: content?.length, 
          hasContent: !!content,
          itemKeys: Object.keys(item)
        });
        
        return {
          role,
          content: content || "",
          timestamp,
        };
      }).filter((item: any) => {
        const hasContent = item.content && item.content.trim().length > 0;
        if (!hasContent) {
          console.log("Filtered out item with no content:", JSON.stringify(item, null, 2));
        }
        return hasContent;
      });
      
      console.log("After filtering, transcript has", transcript.length, "items");
      if (transcript.length > 0) {
        console.log("Sample transcript items:", transcript.slice(0, 2).map(t => ({ role: t.role, content: t.content.substring(0, 50) })));
      }
    }
    // Try body.transcript as array
    else if (body.transcript && Array.isArray(body.transcript)) {
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
    // body.call.transcript is already checked above as FIRST priority
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
      transcriptPreview: transcript.slice(0, 2).map(t => ({ role: t.role, content: t.content.substring(0, 50) })),
      fullTranscript: transcript // Log full transcript for debugging
    });

    // Check if interview already exists
    const existingInterview = await db
      .select()
      .from(interviews)
      .where(eq(interviews.callId, callId))
      .limit(1);

    if (existingInterview.length > 0) {
      // Update existing interview - always update transcript if we have it
      const updateData: any = {
        duration,
        completed,
        updatedAt: new Date(),
      };
      
      // Only update transcript if we have transcript data
      if (transcript.length > 0) {
        updateData.transcript = transcript;
        console.log("Updating interview with transcript:", transcript.length, "messages");
      } else {
        console.log("No transcript to update, keeping existing transcript");
      }
      
      await db
        .update(interviews)
        .set(updateData)
        .where(eq(interviews.callId, callId));

      console.log("Interview updated successfully. Transcript length:", transcript.length);
      return NextResponse.json(
        { message: "Interview updated successfully", transcriptLength: transcript.length },
        { status: 200 }
      );
    }

    // Create new interview
    console.log("Creating new interview with transcript:", transcript.length, "messages");
    await db.insert(interviews).values({
      callId,
      participantId: payload.call.metadata?.participant_id || null,
      transcript: transcript.length > 0 ? transcript : [],
      duration,
      completed,
    });

    console.log("Interview stored successfully. Transcript length:", transcript.length);
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

// Handle GET requests for webhook verification (if needed)
export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint is active" });
}
