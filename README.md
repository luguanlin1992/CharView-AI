# CharView AI - 角色三视图生成工具

CharView AI 是一款面向游戏角色设计师的在线工具。利用 Google Gemini 2.5 Flash Image 模型的强大能力，它可以将单张角色立绘自动转化为专业的角色三视图（正面、侧面、背面），大幅提升建模与设计效率。

## ✨ 功能特性

*   **AI 智能生成**：基于 Gemini 2.5 Flash Image，精准理解角色特征。
*   **多视角合成**：自动生成并在同一画布上排列正、侧、背三个视角。
*   **姿势控制**：支持 原动作保持、A-pose、T-pose。
*   **背景自定义**：支持纯色背景或自定义颜色。
*   **灵活配置**：完美兼容官方直连和第三方中转服务 (如 api.kuai.host)。

## 🛠️ 技术栈

*   **前端框架**：React 19 + Vite 6
*   **样式库**：Tailwind CSS
*   **AI 模型**：Google Gemini API (@google/genai)

---

## 🚀 快速开始 (本地部署)

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
在项目根目录下，将 `.env.example` 复制并重命名为 `.env`，然后填入配置：

**方案 A：官方直连 (推荐)**
```ini
GOOGLE_API_KEY=AIzaSy... (您的 Google API Key)
GOOGLE_BASE_URL= (保持为空)
```

**方案 B：第三方中转 (如 api.kuai.host)**
```ini
GOOGLE_API_KEY=sk-xxxx... (您的中转 Key)
# 填写中转地址，例如：
GOOGLE_BASE_URL=https://api.kuai.host
```

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

### 2. 第三方 Base URL 配置规则
本目使用 Google 官方 SDK (`@google/genai`)。该 SDK 会自动在 Base URL 后拼接 `/v1beta/models/...`。

*   **❌ 错误写法**：`https://api.kuai.host/v1/chat/completions` (这是 OpenAI 格式，会导致 404)
*   **✅ 正确写法**：`https://api.kuai.host` (程序会自动处理后缀)
*   **✅ 也支持**：`https://api.kuai.host/v1beta` (程序会自动清洗重复后缀)

**调试技巧**：
部署后查看网页底部的 Footer 区域，会显示当前的 **API Source**。
*   如果显示 `Source: Official` 但您使用了中转，说明环境变量未生效（请 Redeploy）。
*   如果显示 `Source: Proxy: ...`，说明配置已生效。

---

## ⚠️ 常见报错

**Q: API 配额不足 (429 Resource Exhausted)**
A: 您的 Key 触发了频率限制。
*   如果是官方 Key：免费版有每分钟限制，请稍等再试。
*   如果是中转 Key：请检查您在服务商处的余额或配额。

**Q: 生成失败 / 404 Not Found**
A: 通常是 Base URL 配置错误。请确保 `GOOGLE_BASE_URL` 是主机根地址（如 `https://api.kuai.host`），而不是 OpenAI 的 chat 接口地址。

**Q: 网页白屏或无反应**
A: 请检查浏览器控制台 (F12)。如果看到 "API Key missing"，请参考上文 "Vercel 部署" 部分配置环境变量。
