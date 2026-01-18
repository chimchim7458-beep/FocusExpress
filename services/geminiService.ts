import { GoogleGenAI, Type } from "@google/genai";
import { GeminiDestinationData, Station } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDestinationRealtimeData = async (destinationName: string, task?: string): Promise<GeminiDestinationData | null> => {
  try {
    const prompt = `
      Act as a travel conductor and real-time data fetcher.
      
      1. Search for the current local time in "${destinationName}" (format HH:MM).
      2. Search for the current weather in "${destinationName}" (temperature in Celsius as a number, and a short condition description like "Cloudy", "Sunny", "Raining").
      3. Create a fictional train station name and a 1-sentence description for a traveler arriving at "${destinationName}".
         ${task ? `The traveler is focusing on: "${task}". Incorporate this theme subtly.` : `Capture the vibe of ${destinationName}.`}
      4. Select the most appropriate environment for the visualizer from this list: [city, nature, cyberpunk, desert, snow, clear].

      Return ONLY a JSON object with this exact structure:
      {
        "weather": { "temp": 20, "condition": "Clear" },
        "station": { "name": "Station Name", "description": "Description", "environment": "city" },
        "localTime": "14:30"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weather: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING }
              },
              required: ["temp", "condition"]
            },
            station: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                environment: { 
                  type: Type.STRING,
                  enum: ['city', 'nature', 'cyberpunk', 'desert', 'snow', 'clear']
                }
              },
              required: ["name", "description", "environment"]
            },
            localTime: { type: Type.STRING }
          },
          required: ["weather", "station", "localTime"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return null;
    }

    // Extract grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      weather: data.weather,
      station: data.station as Station,
      localTime: data.localTime,
      groundingChunks: groundingChunks
    };

  } catch (error) {
    console.error("Error fetching destination data:", error);
    // Return mock data fallback if API fails
    return {
      weather: { temp: 20, condition: "Clear" },
      station: {
        name: `${destinationName} Terminal`,
        description: "Welcome to your destination.",
        environment: "city"
      },
      localTime: "--:--",
      groundingChunks: []
    };
  }
};