import { GoogleGenAI } from "@google/genai";

export type PoseType = 'ORIGINAL' | 'A-POSE' | 'T-POSE';

/**
 * Cleans the Base URL to ensure compatibility with Google GenAI SDK.
 * Handles cases where users copy OpenAI-style endpoints or include versions.
 * 
 * Target format for SDK: "https://api.provider.com" (SDK appends /v1beta/...)
 * 
 * Input Examples -> Output:
 * - https://api.kuai.host/v1/chat/completions -> https://api.kuai.host
 * - https://api.kuai.host/v1 -> https://api.kuai.host
 * - https://api.kuai.host -> https://api.kuai.host
 */
const cleanBaseUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  let cleaned = url.trim();
  const original = cleaned;
  
  // 1. Remove trailing slashes first
  cleaned = cleaned.replace(/\/+$/, '');
  
  // 2. Remove specific OpenAI or Version suffixes
  // The SDK (@google/genai) expects the ROOT host because it appends /v1beta/models/... internally.
  // We must strip common paths that users might paste from OpenAI docs.
  const suffixesToRemove = [
    '/chat/completions', // OpenAI style
    '/completions',
    '/chat',
    '/v1beta',           // Google SDK adds this automatically
    '/v1'                // Common proxy version prefix
  ];

  // Iteratively remove suffixes to handle cases like /v1/chat/completions
  // We loop to catch nested suffixes (e.g. removing /chat/completions might leave /v1)
  let modified = true;
  while (modified) {
    modified = false;
    for (const suffix of suffixesToRemove) {
      if (cleaned.endsWith(suffix)) {
        cleaned = cleaned.substring(0, cleaned.length - suffix.length);
        cleaned = cleaned.replace(/\/+$/, ''); // Clean trailing slash again
        modified = true; 
      }
    }
  }

  // Debug log to help users verify their proxy config
  // This log ensures you can see exactly what URL is being passed to the SDK
  if (original !== cleaned) {
    console.debug(`[CharView AI] Cleaned Base URL for SDK compatibility:\n  Original: "${original}"\n  Cleaned:  "${cleaned}"`);
  }

  return cleaned;
};

// Lazy initialization to prevent app crash if API key is missing at startup
const getAiClient = () => {
  // Use process.env.API_KEY exclusively as per guidelines.
  // In vite.config.ts, we inject GOOGLE_API_KEY into process.env.API_KEY
  const apiKey = process.env.API_KEY;
  const rawBaseUrl = process.env.GOOGLE_BASE_URL; // Injected by build config
  const baseUrl = cleanBaseUrl(rawBaseUrl || '');
  
  // Debug log
  if (!apiKey) {
    console.warn("[CharView AI] API Key missing.");
    throw new Error("API Key 未配置。请在项目根目录下创建 .env 文件并配置 GOOGLE_API_KEY。");
  } else {
    // Log the active configuration mode
    const mode = baseUrl ? `Custom Proxy (${baseUrl})` : 'Official Google API (Default)';
    console.log(`[CharView AI] Initialized Client: ${mode}`);
  }

  const options: any = { apiKey };
  
  // Only set baseUrl if user provided a valid proxy address.
  // If empty, GoogleGenAI SDK defaults to https://generativelanguage.googleapis.com (Correct for Official)
  if (baseUrl) {
    options.baseUrl = baseUrl;
  }

  return new GoogleGenAI(options);
};

/**
 * Returns a safe masked version of the current API key for debugging purposes.
 * e.g., "AIza...AbCd" or "sk-a...9f3d"
 */
export const getMaskedApiKey = (): string => {
  try {
    const key = process.env.API_KEY;
    if (!key) return "未设置";
    if (key.length < 8) return "****";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  } catch (e) {
    return "读取错误";
  }
};

/**
 * Generates a 3-view character sheet from an uploaded image.
 * Uses gemini-2.5-flash-image (Nano Banana) or configured model.
 */
export const generateCharacterSheet = async (
  base64Image: string, 
  customInstruction: string = "",
  poseType: PoseType = 'A-POSE',
  backgroundColor: string = '#F0F0F0'
): Promise<string> => {
  try {
    const ai = getAiClient();
    // Use configured model ID or default to Gemini 2.5 Flash Image
    const modelId = process.env.GOOGLE_MODEL_ID || 'gemini-2.5-flash-image';
    
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

    // Parse mimeType and data from base64 string to be robust
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const data = matches ? matches[2] : base64Image.replace(/^data:.*,/, '');

    console.log(`[CharView AI] Generating content...\n  Model: ${modelId}\n  Pose: ${poseType}`);

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
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