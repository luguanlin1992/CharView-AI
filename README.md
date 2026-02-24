# CharView AI - 工业级角色三视图生成器

CharView AI 是一款面向游戏角色设计师、3D 建模师的在线工具。利用 Google Gemini 2.5 Flash Image 和 Gemini 3 Pro Image 模型的强大能力，它可以将单张角色立绘自动转化为专业的角色三视图或四视图，大幅提升建模与设计效率。

## ✨ 功能特性

*   **AI 智能生成**：支持 Gemini 2.5 Flash Image (标准解析度) 和 Gemini 3 Pro Image (高精度 1K/2K/4K) 模型。
*   **多视角合成**：支持生成三视图 (正、侧、背) 或四视图 (正、背、左侧、右侧)。
*   **姿势控制**：支持 原画动作保持、A-pose、T-pose 规范化。
*   **道具控制**：支持一键移除武器与手持道具，清晰展示角色本体设计。
*   **灵活配置**：支持多种画幅比例 (16:9, 4:3, 1:1, 3:4, 9:16)。
*   **纯前端直连**：无需配置后端环境变量，直接在 UI 设置中配置 API Key 和 Base URL，数据本地存储，安全便捷。完美兼容官方直连和第三方中转服务 (如 api.kuai.host)。

## 🛠️ 技术栈

*   **前端框架**：React 19 + Vite 7
*   **样式库**：Tailwind CSS
*   **图标库**：Lucide React
*   **AI 模型**：Google Gemini API (通过 Fetch API 直连)

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 在浏览器中配置 API
无需修改 `.env` 文件！启动项目后，在网页界面中：
1. 点击页面右侧“生成参数”面板右上角的 **设置 (齿轮图标)**。
2. 在弹出的设置面板中填入：
   *   **接口地址 (Base URL)**：默认为 `https://api.kuai.host`。如果您使用官方直连，可留空或填入官方地址。
   *   **API Key**：填入您的 Gemini API Key 或中转服务商提供的 Key。
3. 配置会自动保存在浏览器的 LocalStorage 中，刷新不丢失。

---

## ☁️ 部署指南 (Vercel / Netlify 等)

由于本项目是纯前端单页应用 (SPA)，且 API 请求完全在客户端发起，因此部署非常简单，**不需要配置任何服务端环境变量**。

1. 将代码推送到 GitHub。
2. 在 Vercel 或 Netlify 中导入项目。
3. 构建命令 (Build Command) 保持默认的 `npm run build`。
4. 输出目录 (Output Directory) 保持默认的 `dist`。
5. 部署完成后，用户访问网页时，自行在界面设置中填入 API Key 即可使用。

### 第三方 Base URL 配置规则
程序会自动在 Base URL 后拼接 `/v1beta/models/...`。

*   **❌ 错误写法**：`https://api.kuai.host/v1/chat/completions` (这是 OpenAI 格式，会导致 404)
*   **✅ 正确写法**：`https://api.kuai.host` (程序会自动处理后缀)
*   **✅ 也支持**：`https://api.kuai.host/v1beta` (程序会自动清洗重复后缀)

---

## ⚠️ 常见报错

**Q: API 配额不足 (429 Resource Exhausted)**
A: 您的 Key 触发了频率限制。
*   如果是官方 Key：免费版有每分钟限制，请稍等再试。
*   如果是中转 Key：请检查您在服务商处的余额或配额。

**Q: 生成失败 / 404 Not Found**
A: 通常是 Base URL 配置错误。请确保接口地址是主机根地址（如 `https://api.kuai.host`），而不是 OpenAI 的 chat 接口地址。

**Q: 无法连接到接口节点 (Failed to fetch)**
A: 可能是网络问题或跨域 (CORS) 限制。如果您使用的是官方直连，国内网络可能无法直接访问；建议使用支持跨域的中转服务商。
