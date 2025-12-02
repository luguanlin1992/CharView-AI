# CharView AI - 角色三视图生成工具

CharView AI 是一款面向游戏角色设计师的在线工具。利用 Google Gemini 2.5 Flash Image 模型的强大能力，它可以将单张角色立绘自动转化为专业的角色三视图（正面、侧面、背面），大幅提升建模与设计效率。

## ✨ 功能特性

*   **AI 智能生成**：基于 Gemini 2.5 Flash Image，精准理解角色特征。
*   **多视角合成**：自动生成并在同一画布上排列正、侧、背三个视角。
*   **姿势控制**：
    *   **原动作保持**：保留原画姿态。
    *   **A-pose**：适合建模的标准 A 字姿势。
    *   **T-pose**：适合骨骼绑定的 T 字姿势。
*   **背景自定义**：支持纯色背景（白、灰、绿幕等）或自定义颜色。
*   **隐私安全**：基于 Google GenAI SDK 开发，直接与 Google API 通讯。

## 🛠️ 技术栈

*   **前端框架**：React 19
*   **构建工具**：Vite 6
*   **样式库**：Tailwind CSS
*   **AI 模型**：Google Gemini API (`gemini-2.5-flash-image`)

## 🚀 快速开始 (本地部署)

请按照以下步骤在本地运行项目。

### 1. 安装依赖

确保本地已安装 Node.js (推荐 v18+)。

```bash
npm install
```

### 2. 配置环境变量 (关键步骤)

本项目需要 Google Gemini API Key 才能运行。

1.  在项目根目录下，找到配置文件模板 `.env.example`。
2.  将其复制并重命名为 `.env`。
3.  打开 `.env` 文件，填入您的 API Key：

```ini
# .env 文件内容示例

# 请在此处填入您的 Google Gemini API Key
# 申请地址: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **注意**：请务必使用变量名 `GOOGLE_API_KEY`，不要更改变量名称，否则程序将无法识别。

### 3. 启动开发服务器

```bash
npm run dev
```

启动后，访问终端中显示的地址（通常是 `http://localhost:5173`）即可使用。

## ⚠️ 常见问题

**Q: 提示 "API Key 未配置"？**
A: 请检查项目根目录下是否存在 `.env` 文件，且文件中包含 `GOOGLE_API_KEY=您的密钥`。修改 `.env` 后通常需要重启开发服务器。

**Q: 提示 "API 配额不足 (429)"？**
A: 这是由于 Google Gemini 免费版 API Key 有调用频率限制（通常为每分钟限制）。请稍等 1-2 分钟后重试，或检查您的 Google Cloud 账单状态。

**Q: 为什么生成结果是空白或失败？**
A: 请确保上传的图片清晰，且网络能够连接到 Google API 服务。可以在页面底部的 Debug 面板查看当前使用的 Key 掩码和构建时间。
