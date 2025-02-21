export const maxDuration = 60;
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const getGenerationConfig = () => {
  return {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };
};

const getSafetySettings = () => {
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];
};

const formatPrompt = (location, time) => {
  return `Check Twitter feed for any natural disasters or calamities in ${location} ${time ? `around ${time}` : 'recently'}. Provide response in this JSON format:
  {
    "disasterDetected": boolean,
    "disasterType": string or null,
    "confidence": number (0-1),
    "timeReported": string or null,
    "description": string,
    "sources": array of strings
  }
  
  Focus on:
  1. Confirmed reports from official sources
  2. Emergency management accounts
  3. Local news sources
  4. Exact timing of events
  5. Impact severity`;
};

export async function POST(req) {
  try {
    console.log('API Request Started');
    const { location, timestamp } = await req.json();

    if (!location) {
      console.log('Missing location');
      return new Response(
        JSON.stringify({ success: false, error: "location is required" }),
        { status: 400 }
      );
    }

    // Configure model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // Start chat session
    const chatSession = model.startChat({
      generationConfig: getGenerationConfig(),
      safetySettings: getSafetySettings(),
    });

    // Send message and get response
    console.log('Generating disaster analysis');
    const result = await chatSession.sendMessage([
      { text: formatPrompt(location, timestamp) }
    ]);

    const responseText = await result.response.text();
    console.log("Raw Response:", responseText);

    // Parse the response
    let disasterInfo;
    try {
      disasterInfo = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      disasterInfo = {
        disasterDetected: false,
        disasterType: null,
        confidence: 0,
        timeReported: null,
        description: "Failed to parse disaster information",
        sources: []
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: disasterInfo,
        metadata: {
          model: "gemini-1.5-flash",
          timestamp: new Date().toISOString()
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}