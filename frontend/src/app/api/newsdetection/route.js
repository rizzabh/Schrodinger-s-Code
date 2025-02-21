export const maxDuration = 60;
import { ChatXAI } from "@langchain/xai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize the ChatXAI instance
const llm = new ChatXAI({
  model: "grok-beta",
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 2
});

// Helper function to get system prompt
const getSystemPrompt = () => {
  return `You are a disaster monitoring assistant that analyzes Twitter feeds for natural disaster reports. 
  Provide information about natural disasters in JSON format with the following structure:
  {
    "disasterDetected": boolean,
    "disasterType": string or null,
    "confidence": number (0-1),
    "timeReported": string or null,
    "description": string,
    "sources": array of strings
  }`;
};

// Helper function to format the human prompt
const formatHumanPrompt = (location, time) => {
  return `Please check Twitter feeds and analyze if there has been any natural disaster or calamity reported in ${location} ${time ? `around ${time}` : 'recently'}. 
  Focus on:
  1. Confirmed reports of natural disasters
  2. Official emergency management accounts
  3. Local news sources
  4. Timestamp of the events
  5. Severity and impact`;
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

    // Generate analysis using ChatXAI
    console.log('Generating disaster analysis');
    const response = await llm.invoke([
      ["system", getSystemPrompt()],
      ["human", formatHumanPrompt(location, timestamp)]
    ]);

    // Parse the response
    let disasterInfo;
    try {
      disasterInfo = JSON.parse(response.content);
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

    console.log('Analysis Response:', {
      success: true,
      tokenUsage: response.response_metadata?.tokenUsage,
      modelFingerprint: response.response_metadata?.system_fingerprint
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: disasterInfo,
        metadata: {
          tokenUsage: response.response_metadata?.tokenUsage,
          modelFingerprint: response.response_metadata?.system_fingerprint,
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