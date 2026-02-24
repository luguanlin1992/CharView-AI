
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { generateCharacterSheet, fileToBase64 } from './services/geminiService';
import { AppState, ViewMode, AspectRatioType, ModelType, ImageSizeType, PoseType } from './types';
import { 
  Download, Sparkles, Wand2, AlertTriangle, 
  Layers, MessageSquare, Scan, Zap, Maximize, ExternalLink,
  Smartphone, Monitor, Square, Layout, Settings, Key, X, CheckCircle2, Globe, User,
  Columns3, Columns4, Lock, Trash2, Sword, ShieldOff
} from 'lucide-react';

const aspectRatios: { label: string; value: AspectRatioType; icon: any }[] = [
  { label: '16:9', value: '16:9', icon: Monitor },
  { label: '4:3', value: '4:3', icon: Layout },
  { label: '1:1', value: '1:1', icon: Square },
  { label: '3:4', value: '3:4', icon: Smartphone },
  { label: '9:16', value: '9:16', icon: Smartphone },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Settings & Connection
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState(() => localStorage.getItem('charview_base_url') || 'https://api.kuai.host');
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('charview_api_key') || '');

  // Generation Parameters
  const [viewMode, setViewMode] = useState<ViewMode>('3-VIEW');
  const [poseType, setPoseType] = useState<PoseType>('T-POSE'); 
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [modelId, setModelId] = useState<ModelType>('gemini-2.5-flash-image');
  const [imageSize, setImageSize] = useState<ImageSizeType>('1K');
  const [removeProps, setRemoveProps] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('charview_base_url', customBaseUrl);
    localStorage.setItem('charview_api_key', customApiKey);
  }, [customBaseUrl, customApiKey]);

  const handleGenerate = async () => {
    if (!selectedImage) return;
    if (!customApiKey) {
      setError("请先在设置中配置 API Key");
      setIsSettingsOpen(true);
      return;
    }

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const resultImage = await generateCharacterSheet(selectedImage, {
        customInstruction: customPrompt,
        poseType,
        backgroundColor: 'Neutral Gray',
        viewMode,
        subjectType: 'HUMANOID',
        aspectRatio,
        imageSize,
        removeProps,
        modelId,
        baseUrl: customBaseUrl || 'https://api.kuai.host',
        apiKey: customApiKey
      });
      setGeneratedImage(resultImage);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "生成过程发生未知错误。");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
          
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Input Asset Section */}
            <div className="bg-white p-6 rounded-4xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <Scan className="w-4 h-4 text-indigo-500" /> 原画素材
                </h2>
              </div>
              <UploadArea 
                onImageSelected={async (f) => { setSelectedImage(await fileToBase64(f)); setGeneratedImage(null); }} 
                selectedImage={selectedImage} 
                onClear={() => setSelectedImage(null)} 
              />
            </div>

            {/* Config Section */}
            <div className="bg-white p-6 rounded-4xl border border-slate-200/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <Layers className="w-4 h-4 text-indigo-500" /> 生成参数
                </h2>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600"
                  title="连接设置"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* View Mode Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Layout className="w-3 h-3" /> 视图布局
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setViewMode('3-VIEW')} 
                      className={`flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold rounded-xl border-2 transition-all ${viewMode === '3-VIEW' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-50 text-slate-400 bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <Columns3 className="w-3.5 h-3.5" /> 三视图
                    </button>
                    <button 
                      onClick={() => setViewMode('4-VIEW')} 
                      className={`flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold rounded-xl border-2 transition-all ${viewMode === '4-VIEW' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-50 text-slate-400 bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <Columns4 className="w-3.5 h-3.5" /> 四视图
                    </button>
                  </div>
                </div>

                {/* Pose Type Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User className="w-3 h-3" /> 姿势类型
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['T-POSE', 'A-POSE', 'ORIGINAL'] as PoseType[]).map((type) => (
                      <button 
                        key={type}
                        onClick={() => setPoseType(type)} 
                        className={`flex items-center justify-center py-2.5 text-[10px] font-bold rounded-xl border-2 transition-all ${poseType === type ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-50 text-slate-400 bg-slate-50/50 hover:border-slate-200'}`}
                      >
                        {type === 'ORIGINAL' ? '原画动作' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Props Removal Toggle */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Sword className="w-3 h-3" /> 道具控制
                  </label>
                  <button 
                    onClick={() => setRemoveProps(!removeProps)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all duration-300 active:scale-[0.97] ${
                      removeProps 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100' 
                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldOff className={`w-3.5 h-3.5 transition-colors ${removeProps ? 'text-indigo-600' : 'text-slate-300'}`} />
                      <span className="text-[10px] font-bold">移除武器与手持道具</span>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${removeProps ? 'bg-indigo-600' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${removeProps ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </button>
                </div>

                {/* AI Model Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">渲染模型</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setModelId('gemini-2.5-flash-image')} 
                      className={`flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${modelId === 'gemini-2.5-flash-image' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div className="text-left">
                        <span className={`block text-[11px] font-bold ${modelId === 'gemini-2.5-flash-image' ? 'text-indigo-700' : 'text-slate-700'}`}>Gemini 2.5 Flash</span>
                        <span className="text-[9px] text-slate-400 font-medium italic">标准解析度</span>
                      </div>
                      <Zap className={`w-4 h-4 ${modelId === 'gemini-2.5-flash-image' ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                    </button>
                    <button 
                      onClick={() => setModelId('gemini-3-pro-image-preview')} 
                      className={`flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${modelId === 'gemini-3-pro-image-preview' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div className="text-left">
                        <span className={`block text-[11px] font-bold ${modelId === 'gemini-3-pro-image-preview' ? 'text-indigo-700' : 'text-slate-700'}`}>Gemini 3 Pro</span>
                        <span className="text-[9px] text-slate-400 font-medium italic">超高解析度 (1K-4K)</span>
                      </div>
                      <Sparkles className={`w-4 h-4 ${modelId === 'gemini-3-pro-image-preview' ? 'text-indigo-500 fill-indigo-500' : 'text-slate-300'}`} />
                    </button>
                  </div>
                </div>

                {/* Image Size Selection (Only for Pro) */}
                {modelId === 'gemini-3-pro-image-preview' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">输出品质</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['1K', '2K', '4K'] as ImageSizeType[]).map((size) => (
                        <button 
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${imageSize === size ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aspect Ratio Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">出图比例</label>
                  <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map((ratio) => {
                      const Icon = ratio.icon;
                      return (
                        <button 
                          key={ratio.value} 
                          onClick={() => setAspectRatio(ratio.value)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${aspectRatio === ratio.value ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] font-bold">{ratio.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> 细节修正
                  </label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="可选细节补充..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs min-h-[80px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={appState === AppState.GENERATING} 
                  disabled={!selectedImage} 
                  className="w-full py-6 rounded-3xl text-sm font-bold shadow-xl shadow-indigo-200/50 bg-indigo-600 hover:bg-indigo-700"
                >
                  {appState === AppState.GENERATING ? '正在渲染...' : '生成视图'}
                  <Wand2 className="w-4 h-4 ml-2" />
                </Button>
                {!customApiKey && (
                  <p className="text-[9px] text-amber-600 text-center mt-3 font-bold">
                    请先点击右上角设置图标配置接口 API Key
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Canvas Section */}
          <section className="space-y-6">
            <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm p-3 flex flex-col h-full overflow-hidden min-h-[700px]">
              <div className="flex items-center justify-between p-4 px-8 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">渲染工作区</h2>
                </div>
                {generatedImage && (
                  <button 
                    onClick={() => { const l = document.createElement('a'); l.href = generatedImage; l.download = `turnaround_${Date.now()}.png`; l.click(); }} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-bold shadow-lg"
                  >
                    <Download className="w-4 h-4" /> 导出渲染图
                  </button>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center bg-[#fafbfc] relative overflow-hidden rounded-[2.5rem] mt-3 border border-slate-50">
                {generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    <img src={generatedImage} alt="Result" className="max-w-full max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-700" />
                  </div>
                ) : (
                  <div className="text-center p-12">
                    {appState === AppState.GENERATING ? (
                      <div className="flex flex-col items-center">
                        <div className="w-72 h-96 border-2 border-dashed border-indigo-200 rounded-[3rem] relative overflow-hidden bg-white flex items-center justify-center shadow-inner">
                           <div className="scan-line animate-scan" />
                           {selectedImage && <img src={selectedImage} className="w-full h-full object-contain opacity-10 grayscale blur-sm" alt="processing" />}
                        </div>
                        <div className="mt-10 space-y-2">
                          <p className="text-indigo-600 font-black text-xl tracking-tight">AI 模型运算中</p>
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Processing Sheets</p>
                        </div>
                      </div>
                    ) : appState === AppState.ERROR ? (
                      <div className="max-w-md mx-auto p-12 bg-red-50/50 rounded-[3rem] border border-red-100 text-center animate-in fade-in">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 mb-2">生成任务失败</h3>
                        <p className="text-xs text-red-700/80 leading-relaxed mb-8">{error}</p>
                        <Button variant="outline" onClick={() => setAppState(AppState.IDLE)} className="w-full border-red-200 text-red-600 hover:bg-red-50">重置任务</Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 opacity-30 select-none grayscale">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center">
                          <Maximize className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-400 uppercase tracking-widest text-sm">等待素材输入</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">接口连接配置</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Endpoint Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> 自定义端点 (Base URL)
                </label>
                <input 
                  type="text" 
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.kuai.host"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <p className="text-[9px] text-slate-400 italic">默认使用中转服务 https://api.kuai.host。</p>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Key className="w-3 h-3" /> API Key
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="请输入您的 API Key"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[9px] text-slate-400">该 Key 仅保存在浏览器本地，将用于鉴权请求。</p>
              </div>

              <div className="pt-2">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-slate-700">Gemini 3 Pro 配额说明</p>
                    <p className="text-[9px] text-slate-400">若使用 Pro 模型，请确保 Key 具备相应模型权限</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </a>
              </div>
            </div>

            <div className="p-8 bg-slate-50">
              <Button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 rounded-2xl shadow-none">保存连接配置</Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-100 py-12 text-center mt-auto">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.4em]">CharView AI • Professional Interface</p>
      </footer>
    </div>
  );
};

export default App;
