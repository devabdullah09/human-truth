import { db } from "./index";
import { interviews } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function getAllInterviews() {
  try {
    return await db.select().from(interviews).orderBy(desc(interviews.createdAt));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

export async function getInterviewByCallId(callId: string) {
  try {
    const result = await db
      .select()
      .from(interviews)
      .where(eq(interviews.callId, callId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getInterviewStats() {
  try {
    const allInterviews = await getAllInterviews();
  
  const totalInterviews = allInterviews.length;
  const completedInterviews = allInterviews.filter(i => i.completed).length;
  const totalDuration = allInterviews.reduce((sum, i) => sum + i.duration, 0);
  const averageDuration = totalInterviews > 0 ? Math.round(totalDuration / totalInterviews) : 0;
  const completionRate = totalInterviews > 0 
    ? Math.round((completedInterviews / totalInterviews) * 100) 
    : 0;

    return {
      totalInterviews,
      completedInterviews,
      averageDuration,
      completionRate,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalInterviews: 0,
      completedInterviews: 0,
      averageDuration: 0,
      completionRate: 0,
    };
  }
}

export async function getQuestionAnalytics() {
  try {
    const allInterviews = await getAllInterviews();
  
  const questionMap = new Map<string, {
    question: string;
    responses: Array<{ callId: string; answer: string; timestamp: Date }>;
    totalResponses: number;
    averageLength: number;
  }>();

  allInterviews.forEach(interview => {
    const transcript = interview.transcript || [];
    
    for (let i = 0; i < transcript.length; i++) {
      const message = transcript[i];
      
      if (message.role === "agent" && message.content.trim()) {
        const question = message.content.trim();
        let userResponse = "";
        for (let j = i + 1; j < transcript.length; j++) {
          if (transcript[j].role === "user") {
            userResponse = transcript[j].content.trim();
            break;
          }
        }

        if (!questionMap.has(question)) {
          questionMap.set(question, {
            question,
            responses: [],
            totalResponses: 0,
            averageLength: 0,
          });
        }

        const questionData = questionMap.get(question)!;
        
        if (userResponse) {
          questionData.responses.push({
            callId: interview.callId,
            answer: userResponse,
            timestamp: interview.createdAt,
          });
          questionData.totalResponses++;
        }
      }
    }
  });

  const questionAnalytics = Array.from(questionMap.values()).map(q => {
    const totalLength = q.responses.reduce((sum, r) => sum + r.answer.length, 0);
    const averageLength = q.totalResponses > 0 
      ? Math.round(totalLength / q.totalResponses) 
      : 0;
    
    return {
      ...q,
      averageLength,
      responses: q.responses.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      ).slice(0, 5),
    };
  });

    return questionAnalytics.sort((a, b) => b.totalResponses - a.totalResponses);
  } catch (error) {
    console.error("Error fetching question analytics:", error);
    return [];
  }
}

