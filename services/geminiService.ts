import { GoogleGenAI } from "@google/genai";

export type PoseType = 'ORIGINAL' | 'A-POSE' | 'T-POSE';

// Lazy initialization to prevent app crash if API key is missing at startup
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  
  // Debug log (safe)
  if (process.env.NODE_ENV !== 'production' || !apiKey) {
    console.log(`[CharView AI] Initializing AI Service. Key configured: ${!!apiKey}, Length: ${apiKey?.length || 0}`);
  }

  if (!apiKey) {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    throw new Error("API Key 未配置 (Is Empty)。请在 Vercel 环境变量中添加 API_KEY。");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a 3-view character sheet from an uploaded image.
 * Uses gemini-2.5-flash-image (Nano Banana).
 */
export const generateCharacterSheet = async (
  base64Image: string, 
  customInstruction: string = "",
  poseType: PoseType = 'A-POSE',
  backgroundColor: string = '#F0F0F0'
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    let poseInstruction = '';
    switch (poseType) {
      case 'T-POSE':
        poseInstruction = 'The character must be in a static "T-Pose" (arms straight out horizontally, legs straight).';
        break;
      case 'ORIGINAL':
        poseInstruction = 'Keep the character in a similar pose to the input image for the main view, but ensure side and back views are aligned.';
        break;
      case 'A-POSE':
      default:
        poseInstruction = 'The character must be in a static "A-Pose" (arms angled slightly down, legs straight).';
        break;
    }

    // Construct a specialized prompt for 3-view generation
    const basePrompt = `
      You are an expert game character designer. 
      Generate a professional character design sheet based on the uploaded character image.
      
      Requirements:
      1. Create a "Three-View" (Tri-view) schematic: Front view, Side view, and Back view.
      2. ${poseInstruction}
      3. Arrange the three views horizontally on the canvas.
      4. The character details (clothing, hair, accessories, colors) must match the input image accurately.
      5. The background must be a solid color: ${backgroundColor}.
      6. High quality, detailed, anime or semi-realistic style suitable for 3D modeling references.
    `;

    // Append user instructions if any
    const fullPrompt = customInstruction 
      ? `${basePrompt}\nAdditional Instruction: ${customInstruction}`
      : basePrompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, standardizing on what we send or generic
              data: base64Image.split(',')[1] // Strip header if present
            }
          },
          {
            text: fullPrompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    // Extract image from response
    // The response might contain text or inlineData (image). We look for inlineData.
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("生成失败：模型未返回图像，请重试。");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

/**
 * Helper to convert File to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};