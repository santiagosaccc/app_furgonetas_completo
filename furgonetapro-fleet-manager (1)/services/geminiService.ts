
import { GoogleGenAI, Type } from "@google/genai";
import { Van } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFleetHealth = async (vans: Van[]) => {
  const prompt = `Based on the following fleet data, provide a summary of which vans need urgent maintenance and suggest optimization strategies for higher availability.
  
  Fleet Data:
  ${JSON.stringify(vans, null, 2)}
  
  Provide response in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgentMaintenance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of vans needing urgent attention"
            },
            summary: {
              type: Type.STRING,
              description: "Brief analysis of current fleet state"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable business recommendations"
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const chatWithFleetAI = async (query: string, vans: Van[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the FurgonetaPro Virtual Assistant. You help managers track their fleet of vans. 
      You have access to current fleet state: ${JSON.stringify(vans)}. 
      Be concise, professional, and data-driven. Always suggest specific vans by their Brand/Model when relevant.`
    }
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};
