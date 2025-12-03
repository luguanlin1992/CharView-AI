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
*   **灵活配置**：完美兼容官方直连和第三方中转服务。

## 🛠️ 技术栈

*   **前端框架**：React 19
*   **构建工具**：Vite 6
*   **样式库**：Tailwind CSS
*   **AI 模型**：Google Gemini API

## 🚀 快速开始 (本地部署)

请按照以下步骤在本地运行项目。

### 1. 安装依赖

确保本地已安装 Node.js (推荐 v18+)。

```bash
npm install
```

### 2. 配置环境变量 (关键步骤)

本项目需要配置 API Key 才能运行。

1.  在项目根目录下，找到配置文件模板 `.env.example`。
2.  将其复制并重命名为 `.env`。
3.  打开 `.env` 文件，填入您的配置信息：

#### 方案 A：官方原生调用 (Official)
如果您直接使用 Google 提供的 API Key：
```ini
GOOGLE_API_KEY=AIzaSy...
# 注意：官方直连时，请保持 GOOGLE_BASE_URL 为空！
GOOGLE_BASE_URL=
```

#### 方案 B：第三方平台调用 (Proxy/Third-Party)
如果您使用如 `api.kuai.host` 等中转服务：

```ini
# 1. 填写第三方提供的 Token
GOOGLE_API_KEY=sk-xxxx...

# 2. 填写接口地址
# 程序会自动清洗地址后缀，您可以使用以下任意一种格式：
# 例如：https://api.kuai.host
GOOGLE_BASE_URL=https://api.kuai.host
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动后，访问终端中显示的地址（通常是 `http://localhost:5173`）即可使用。

---

## ⚠️ 常见问题

**Q: 提示 "API Key 未配置"？**
A: 请检查 `.env` 文件是否存在，且变量名必须为 `GOOGLE_API_KEY`。修改 `.env` 后需要重启服务器。

**Q: 提示 "API 配额不足 (429)"？**
A: 这是由于 API Key 达到调用频率限制。请稍等片刻重试，或检查您的服务商配额。

**Q: 第三方接口报错？**
A: 请确保 `GOOGLE_BASE_URL` 填写正确。程序内置了清洗逻辑，会自动移除 `/v1/chat/completions` 等 OpenAI 格式后缀，因此您可以放心填写服务商提供的完整地址。