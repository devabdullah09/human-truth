import { Interview } from "@/lib/db/schema"

export interface QuestionAnalytics {
  question: string
  responseCount: number
  recentAnswers: string[]
  averageLength: number
}

export function extractQuestions(interviews: Interview[]): QuestionAnalytics[] {
  const questionMap = new Map<string, {
    responses: string[]
    totalLength: number
  }>()

  interviews.forEach((interview) => {
    const transcript = interview.transcript
    let currentQuestion = ""
    
    for (let i = 0; i < transcript.length; i++) {
      const message = transcript[i]
      
      if (message.role === "agent") {
        // Store the agent's message as a potential question
        currentQuestion = message.content.trim()
      } else if (message.role === "user" && currentQuestion) {
        // This is a response to the current question
        const response = message.content.trim()
        
        if (!questionMap.has(currentQuestion)) {
          questionMap.set(currentQuestion, {
            responses: [],
            totalLength: 0,
          })
        }
        
        const questionData = questionMap.get(currentQuestion)!
        questionData.responses.push(response)
        questionData.totalLength += response.length
      }
    }
  })

  // Convert to QuestionAnalytics format
  const analytics: QuestionAnalytics[] = []
  
  questionMap.forEach((data, question) => {
    analytics.push({
      question,
      responseCount: data.responses.length,
      recentAnswers: data.responses.slice(-5), // Last 5 answers
      averageLength: Math.round(data.totalLength / data.responses.length),
    })
  })

  return analytics.sort((a, b) => b.responseCount - a.responseCount)
}

export function calculateAverageDuration(interviews: Interview[]): number {
  const completedInterviews = interviews.filter(i => i.duration !== null && i.duration !== undefined)
  
  if (completedInterviews.length === 0) return 0
  
  const totalDuration = completedInterviews.reduce((sum, interview) => {
    return sum + (interview.duration || 0)
  }, 0)
  
  return Math.round(totalDuration / completedInterviews.length)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

