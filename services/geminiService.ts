import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getFashionAdvice = async (userQuery: string, userMeasurements: string): Promise<string> => {
  if (!ai) {
    return "I'm sorry, my connection to the fashion styling database (API Key) is currently unavailable. Please check the configuration.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `User Query: "${userQuery}". \n\nContext: The user has the following measurements: ${userMeasurements}.`,
      config: {
        systemInstruction: `You are "Tailor AI", a master tailor and high-end fashion consultant for a bespoke menswear application called 'GIMCO KE' based in Nairobi, Kenya. 
        
        Your tone should be sophisticated, professional, yet warm and helpful.
        
        Guidance:
        1. If the user asks about style, recommend items based on classic menswear rules but also consider Kenyan trends (e.g., Kitenge accents, business casual for Nairobi weather).
        2. If the user asks about fit, refer to their measurements provided in the context context.
        3. Keep answers concise (under 100 words) unless asked for a detailed explanation.
        4. If asking about fabric, explain the benefits (e.g., Wool for breathability, Linen for Mombasa heat).
        
        Do not make up fake order numbers. Focus on style, fit, and fabric advice.`,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster chat response
      },
    });

    return response.text || "I was unable to generate a fashion recommendation at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the styling server right now. Please try again later.";
  }
};

export const generateInventoryImage = async (name: string, category: string, type: string): Promise<string | null> => {
  if (!ai) {
    console.error("No API Key configured");
    return null;
  }

  try {
    // Updated prompt to ensure no overcropping (centered, wide shot)
    const prompt = `Professional high-end product photography of ${name}, a ${category} ${type}. 
    Style: Minimalist, clean white or neutral background, studio lighting, highly detailed, realistic, commercial fashion photography suitable for an e-commerce store. 
    Composition: Wide angle shot, entire object centered and fully visible with ample white space around the edges. Do not crop the item.
    Context: Kenyan fashion context if applicable (e.g. if name implies prints).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};