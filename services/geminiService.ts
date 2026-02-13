
import { GoogleGenAI, Type } from "@google/genai";
import { AirportData, AirportImages, Flight } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchAirportData = async (icao: string): Promise<AirportData> => {
  const ai = getAIClient();
  const prompt = `Provide detailed information for the airport with ICAO code: ${icao}. 
  Include: Full Name, Location, a brief Summary, Elevation, list of Runways, FBO information (Fixed Base Operators), Fuel services (Gas), Restaurants on field or nearby, Rental car availability, and a summary of recent pilot reviews.
  Format the response clearly as requested.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      web: {
        uri: chunk.web.uri,
        title: chunk.web.title
      }
    }));

  // Simple parsing of markdown response
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const name = lines[0]?.replace(/#/g, '').trim() || `${icao} Airport`;

  return {
    icao,
    name,
    location: "Retrieved via Google Search Grounding",
    summary: text,
    elevation: "Standard",
    runways: ["Main runway info in summary"],
    fboInfo: "Check services tab",
    fuelServices: "Available",
    restaurants: "Available",
    rentals: "Available",
    reviews: "See pilot feedback",
    groundingSources: sources
  };
};

export const fetchFlightData = async (icao: string): Promise<Flight[]> => {
  const ai = getAIClient();
  const prompt = `Search for real-time flight information at airport ${icao}. 
  Provide a list of 10 recent or upcoming arrivals and departures. 
  For each flight, include: Flight Number, Airline, Origin, Destination, Status, Scheduled Time, and Estimated Time.
  Identify if it is an 'arrival' or 'departure' relative to ${icao}.
  Return ONLY a valid JSON array of objects with keys: flightNumber, airline, origin, destination, status, scheduledTime, estimatedTime, type.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            flightNumber: { type: Type.STRING },
            airline: { type: Type.STRING },
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            status: { type: Type.STRING },
            scheduledTime: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["flightNumber", "airline", "origin", "destination", "status", "scheduledTime", "type"]
        }
      }
    },
  });

  try {
    const rawText = response.text || "[]";
    // Strip markdown formatting if the model includes it despite responseMimeType
    const jsonStr = rawText.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse flight data JSON", e);
    return [];
  }
};

export const generateAirportImages = async (icao: string, airportName: string): Promise<AirportImages> => {
  const ai = getAIClient();
  
  const generate = async (prompt: string) => {
    // Switching to gemini-2.5-flash-image for standard generation to ensure it works reliably
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "16:9"
        } 
      }
    });
    
    for (const part of res.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  };

  try {
    const [main, fbo, aerial] = await Promise.all([
      generate(`High-res realistic professional photo of terminal building and gates at ${airportName} (${icao}). Clear blue sky.`),
      generate(`Close up photo of an FBO general aviation hangar with private business jets parked at ${airportName} (${icao}).`),
      generate(`Clean vertical aerial satellite drone view of the runways and taxiways layout of ${airportName} (${icao}).`)
    ]);

    return { main, fbo, aerial };
  } catch (err) {
    console.error("Image generation failed", err);
    // Return empty strings so the UI can handle the absence of images gracefully
    return { main: '', fbo: '', aerial: '' };
  }
};

export const editAirportImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = getAIClient();
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
        { text: editPrompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to edit image");
};
