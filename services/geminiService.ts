
import { ViewMode, AspectRatioType, ModelType, ImageSizeType, PoseType } from "../types";

// 处理 Base URL 拼接，确保符合 /v1beta/models 规范
const formatEndpoint = (baseUrl: string, modelId: string): string => {
  let cleanBase = baseUrl.trim().replace(/\/+$/, "");
  // 如果用户填写的 URL 包含 /v1beta，则先移除，统一由后面拼接
  cleanBase = cleanBase.replace(/\/v1beta$/, "");
  return `${cleanBase}/v1beta/models/${modelId}:generateContent`;
};

const getClosestAspectRatio = (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const ratios = [
        { label: '21:9', value: 21 / 9 },
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '1:1', value: 1 },
        { label: '3:4', value: 3 / 4 },
        { label: '9:16', value: 9 / 16 }
      ];
      let closest = ratios[0];
      let minDiff = Math.abs(ratio - ratios[0].value);
      for (let i = 1; i < ratios.length; i++) {
        const diff = Math.abs(ratio - ratios[i].value);
        if (diff < minDiff) {
          minDiff = diff;
          closest = ratios[i];
        }
      }
      resolve(closest.label);
    };
    img.onerror = () => resolve('16:9'); // fallback
    img.src = base64Image;
  });
};

// 导出生成图像的核心函数
export const generateCharacterSheet = async (
  base64Image: string, 
  config: {
    customInstruction: string;
    poseType: PoseType;
    backgroundColor: string;
    viewMode: ViewMode;
    subjectType: string;
    aspectRatio: AspectRatioType;
    imageSize: ImageSizeType;
    removeProps: boolean;
    modelId: ModelType;
    baseUrl?: string;
    apiKey: string;
  }
): Promise<string> => {
  const isProModel = config.modelId === 'gemini-3-pro-image-preview';
  const isFourView = config.viewMode === '4-VIEW';
  const baseUrl = config.baseUrl || 'https://api.kuai.host';
  const apiKey = config.apiKey;

  if (!apiKey) {
    throw new Error("API Key 缺失，请在设置中进行配置。");
  }
  
  let finalAspectRatio = config.aspectRatio;
  if (finalAspectRatio === 'AUTO') {
    finalAspectRatio = await getClosestAspectRatio(base64Image) as AspectRatioType;
  }
  
  const basePrompt = `
# ROLE
Expert Game Character Concept Artist & Technical Modeler.

# OBJECTIVE
Generate a high-fidelity ${isFourView ? '4-view' : '3-view'} orthographic character reference sheet. This image is for precise 3D modeling.

# PERSPECTIVE & LAYOUT
- Layout: A strictly horizontal sequence of ${isFourView ? '4' : '3'} views.
- View Sequence: ${isFourView ? 'Front, Back, Left Side, Right Side' : 'Front, Side, Back'}.
- Vertical Alignment: Head, torso, and feet MUST be perfectly aligned across all views.
- Style: Industrial-grade clean lines, neutral character design, professional studio shading.

# CHARACTER CONSISTENCY
- Design: Exactly replicate the character design, colors, and silhouette from the provided image. 
- Pose: ${config.poseType === 'ORIGINAL' ? 'Maintain the original pose' : `Standardize the character into a neutral ${config.poseType} for all views`}.
- Background: Solid ${config.backgroundColor} background.

${config.removeProps ? `
# PROPS REMOVAL
- Action: Completely remove any handheld weapons (swords, guns, staves), large shields, or floating accessories that obscure the body design.
- Goal: Show the base costume and character anatomy as clearly as possible without external tools.
` : ''}

${config.customInstruction ? `ADDITIONAL GUIDANCE: ${config.customInstruction}` : ''}
    `;

  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = matches ? matches[1] : 'image/jpeg';
  const data = matches ? matches[2] : base64Image.replace(/^data:.*,/, '');

  // 拼接完整 Endpoint
  const endpoint = formatEndpoint(baseUrl, config.modelId);
  const urlWithKey = `${endpoint}?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data } },
          { text: basePrompt }
        ]
      }
    ],
    generationConfig: {
      // 对于 Pro 模型，必须显式设置 responseModalities
      ...(isProModel ? { responseModalities: ["image"] } : {}),
      imageConfig: {
        aspectRatio: finalAspectRatio,
        ...(isProModel ? { imageSize: config.imageSize } : {})
      }
    }
  };

  try {
    // 增加 Authorization 和 x-goog-api-key 请求头以适配不同的中转服务商鉴权逻辑
    const response = await fetch(urlWithKey, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      // 对 Key 进行脱敏处理后打印调试信息
      const maskedUrl = urlWithKey.replace(/key=([^&]+)/, "key=***");
      console.error(`API 请求失败，节点: ${maskedUrl}`, errText);
      throw new Error(`接口服务错误 (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const parts = json.candidates?.[0]?.content?.parts;
    if (parts) {
      const imagePart = parts.find((p: any) => p.inlineData);
      if (imagePart) {
        return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
      }
    }
    throw new Error("模型响应成功 but 未返回有效图像，请检查 Key 的权限或模型配额。");
  } catch (e: any) {
    if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
      throw new Error("无法连接到接口节点。请检查 Base URL 是否正确以及网络是否通畅。");
    }
    throw e;
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
