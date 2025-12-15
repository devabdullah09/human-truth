import { z } from "zod";

export const retellWebhookSchema = z.object({
  event: z.enum(["call_ended", "call_analysis", "call_analyzed", "call_started"]).optional(),
  call: z.object({
    call_id: z.string(),
    agent_id: z.string().optional(),
    direction: z.enum(["inbound", "outbound"]).optional(),
    from_number: z.string().optional(),
    to_number: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    start_timestamp: z.number().optional(),
    end_timestamp: z.number().optional(),
    duration: z.number().optional(),
    call_duration: z.number().optional(),
  }).passthrough(),
  transcript: z.array(z.object({
    role: z.enum(["agent", "user", "assistant"]).optional(),
    content: z.string().optional(),
    text: z.string().optional(),
    timestamp: z.number().optional(),
  }).passthrough()).optional(),
  transcript_events: z.array(z.any()).optional(),
  analysis: z.object({
    summary: z.string().optional(),
    sentiment: z.string().optional(),
  }).optional(),
  call_duration: z.number().optional(),
  duration: z.number().optional(),
  end_reason: z.string().optional(),
}).passthrough();

export type RetellWebhookPayload = z.infer<typeof retellWebhookSchema>;
