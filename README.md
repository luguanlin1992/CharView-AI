# CharView AI - 角色三视图生成工具

CharView AI 是一款面向游戏角色设计师的在线工具。利用 Gemini 2.5 Flash Image 模型的强大能力，它可以将单张角色立绘自动转化为专业的角色三视图（正面、侧面、背面），大幅提升建模与设计效率。

## ✨ 功能特性

*   **AI 智能生成**：基于 Gemini 2.5 Flash Image，精准理解角色特征。
*   **多视角合成**：自动生成并在同一画布上排列正、侧、背三个视角。
*   **姿势控制**：支持 原动作保持、A-pose、T-pose。
*   **背景自定义**：支持纯色背景或自定义颜色。
*   **灵活配置**：使用 OpenAI 兼容格式的 API 接口（默认使用 apis.kuai.host）。

## 🛠️ 技术栈

*   **前端框架**：React 19 + Vite 6
*   **样式库**：Tailwind CSS
*   **AI 模型**：Gemini 2.5 Flash Image（通过 OpenAI 兼容 API）

---

## 🚀 快速开始 (本地部署)

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
在项目根目录下，将 `.env.example` 复制并重命名为 `.env`，然后填入配置：

**默认配置（使用 apis.kuai.host）**
```ini
GOOGLE_API_KEY=sk-xxxx... (您的 API Key)
GOOGLE_BASE_URL=https://apis.kuai.host
GOOGLE_MODEL_ID=gemini-2.5-flash-image
```

**自定义 API 端点**
```ini
GOOGLE_API_KEY=sk-xxxx... (您的 API Key)
GOOGLE_BASE_URL=https://your-custom-api-host.com
GOOGLE_MODEL_ID=gemini-2.5-flash-image
```

> **注意**：`GOOGLE_BASE_URL` 会自动添加 `/v1/chat/completions` 路径，您只需提供基础域名即可。

### 3. 启动
```bash
npm run dev
```

---

## ☁️ Vercel 部署避坑指南 (必读)

如果您部署在 Vercel 遇到问题，**90% 是因为以下两点**：

### 1. 环境变量修改后必须 Redeploy ⚠️
在 Vercel 后台 (Settings -> Environment Variables) 添加或修改 `GOOGLE_API_KEY` / `GOOGLE_BASE_URL` 后，**变量不会立即生效！**

**解决方法：**
1.  进入 Vercel 项目的 **Deployments** 页面。
2.  找到当前最新的 Deployment，点击右侧三个点 **...**。
3.  选择 **Redeploy**。
4.  等待构建完成后，新的变量才会注入到代码中。

### 2. API 端点配置规则
本项目使用 OpenAI 兼容格式的 API 接口。程序会自动在 Base URL 后添加 `/v1/chat/completions` 路径。

*   **✅ 推荐写法**：`https://apis.kuai.host` (程序会自动添加 `/v1/chat/completions`)
*   **✅ 也支持**：`https://apis.kuai.host/v1/chat/completions` (程序会自动去重)
*   **✅ 自定义端点**：`https://your-api-host.com` (程序会自动添加路径)

**调试技巧**：
部署后查看网页底部的 Footer 区域，会显示当前的 **API Source**。
*   如果显示 `Source: Kuai Host API`，说明使用的是默认配置。
*   如果显示 `Source: Custom: ...`，说明使用的是自定义端点。

---

## ⚠️ 常见报错

**Q: API 配额不足 (429 Resource Exhausted)**
A: 您的 Key 触发了频率限制。
*   如果是官方 Key：免费版有每分钟限制，请稍等再试。
*   如果是中转 Key：请检查您在服务商处的余额或配额。

**Q: 生成失败 / 404 Not Found**
A: 通常是 API 端点配置错误。请确保 `GOOGLE_BASE_URL` 是正确的 API 主机地址（如 `https://apis.kuai.host`），程序会自动添加 `/v1/chat/completions` 路径。

**Q: 网页白屏或无反应**
A: 请检查浏览器控制台 (F12)。如果看到 "API Key missing"，请参考上文 "Vercel 部署" 部分配置环境变量。
