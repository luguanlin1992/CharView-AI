export type PoseType = 'ORIGINAL' | 'A-POSE' | 'T-POSE';

/**
 * Gets the API base URL and constructs the Gemini native endpoint.
 * Defaults to https://apis.kuai.host if not provided.
 */
const getApiBaseUrl = (): string => {
  const rawBaseUrl = process.env.GOOGLE_BASE_URL || 'https://apis.kuai.host';
  let cleaned = rawBaseUrl.trim();
  
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Remove any existing paths
  cleaned = cleaned.replace(/\/v1\/models\/.*$/, '');
  cleaned = cleaned.replace(/\/v1\/chat\/completions\/?$/, '');
  cleaned = cleaned.replace(/\/chat\/completions\/?$/, '');
  cleaned = cleaned.replace(/\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  
  return cleaned;
};

/**
 * Gets the full API endpoint URL for Gemini generateContent.
 */
const getApiEndpoint = (modelId: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/v1/models/${modelId}:generateContent`;
};

/**
 * Helper to get current config info for UI debugging
 */
export const getApiConfigInfo = () => {
  const baseUrl = getApiBaseUrl();
  const isDefault = baseUrl.includes('apis.kuai.host');
  return {
    isCustom: !isDefault,
    source: isDefault ? 'Kuai Host API' : `Custom: ${baseUrl}`
  };
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
 * Uses the OpenAI-compatible API endpoint (e.g., apis.kuai.host).
 */
export const generateCharacterSheet = async (
  base64Image: string, 
  customInstruction: string = "",
  poseType: PoseType = 'A-POSE',
  backgroundColor: string = '#F0F0F0'
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key 未配置。请在 .env (本地) 或 Vercel Settings 中配置 GOOGLE_API_KEY。");
    }

    // Use configured model ID or default to gemini-2.5-flash-image
    const modelId = process.env.GOOGLE_MODEL_ID || 'gemini-2.5-flash-image';
    // Use Gemini native format endpoint: /v1/models/{model}:generateContent
    const apiEndpoint = getApiEndpoint(modelId);
    
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

    const fullPrompt = customInstruction 
      ? `${basePrompt}\nAdditional Instruction: ${customInstruction}`
      : basePrompt;

    // Parse base64 image data
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const imageData = matches ? matches[2] : base64Image.replace(/^data:.*,/, '');

    console.log(`[CharView AI] Requesting Model: ${modelId} at ${apiEndpoint}`);

    // Prepare request body in Gemini native format (using contents)
    // Reference: https://docs.kuai.host/353591150e0 and google-pic-ai project
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API 请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    
    // Handle Google Gemini response format
    // Response format: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    if (responseData.candidates && responseData.candidates[0]?.content?.parts) {
      const parts = responseData.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    // Fallback: Handle OpenAI-compatible response format
    if (responseData.choices && responseData.choices[0]?.message?.content) {
      const content = responseData.choices[0].message.content;
      
      // Check if content is an array (multimodal response)
      if (Array.isArray(content)) {
        for (const item of content) {
          if (item.type === 'image_url' && item.image_url?.url) {
            return item.image_url.url;
          }
        }
      }
      
      // Check if content is a string (base64 image data)
      if (typeof content === 'string') {
        // If it's already a data URL, return it
        if (content.startsWith('data:')) {
          return content;
        }
        // Otherwise, assume it's base64 and wrap it
        return `data:image/png;base64,${content}`;
      }
    }

    // Fallback: check for image data in other possible locations
    if (responseData.data && responseData.data[0]?.url) {
      return responseData.data[0].url;
    }

    // If response contains base64 data directly
    if (responseData.image || responseData.image_data) {
      const imageData = responseData.image || responseData.image_data;
      if (imageData.startsWith('data:')) {
        return imageData;
      }
      return `data:image/png;base64,${imageData}`;
    }

    console.error('Unexpected response format:', responseData);
    throw new Error("生成失败：模型未返回图像，请检查响应格式。");
  } catch (error: any) {
    console.error("API Generation Error:", error);
    if (error.message) {
      throw error;
    }
    throw new Error(`生成失败: ${error.toString()}`);
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
