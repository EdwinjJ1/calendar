import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_API_KEY is not defined in environment variables' },
        { status: 500 }
      );
    }

    const { text, currentDate } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-flash-lite-latest" });

    const prompt = `
      You are a smart schedule parser. Your goal is to extract calendar events from the provided text.
      
      Current Date context: ${currentDate || new Date().toISOString()}
      
      User Input:
      """
      ${text}
      """
      
      Instructions:
      1. Analyze the user input to identify distinct events, meetings, or tasks.
      2. For each event, extract the following fields:
         - title: (string) A concise title for the event.
         - start: (string) ISO 8601 format date-time (e.g., "2023-10-27T10:00:00.000Z"). Resolve relative dates (like "tomorrow", "next Monday") based on the "Current Date context".
         - end: (string) ISO 8601 format date-time. If no duration is specified, assume 1 hour.
         - description: (string, optional) Any additional details found.
         - location: (string, optional) Any location information found.
         - allDay: (boolean) true if it's an all-day event, otherwise false.
      
      3. Return ONLY a valid JSON array of objects. Do not wrap in markdown code blocks. Do not add any explanation.
      
      Example Output format:
      [
        {
          "title": "Meeting with Bob",
          "start": "2023-10-28T14:00:00.000Z",
          "end": "2023-10-28T15:00:00.000Z",
          "description": "Discuss project roadmap",
          "location": "Conference Room A",
          "allDay": false
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();

    // Cleanup potential markdown formatting if the model adds it despite instructions
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const events = JSON.parse(jsonString);
      return NextResponse.json({ events });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: jsonString },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
