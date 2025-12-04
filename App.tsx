import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { generateCharacterSheet, fileToBase64, PoseType, getMaskedApiKey, getApiConfigInfo } from './services/geminiService';
import { AppState } from './types';
import { Download, Sparkles, Wand2, ArrowRight, PaintBucket, Users, AlertTriangle, Clock, Settings, RefreshCw, Terminal, FileCode, MousePointerClick, Server } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // New state for pose and background
  const [poseType, setPoseType] = useState<PoseType>('A-POSE');
  const [backgroundColor, setBackgroundColor] = useState<string>('#F0F0F0');

  const handleImageSelected = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      setGeneratedImage(null);
      setError(null);
      setAppState(AppState.IDLE);
    } catch (e) {
      console.error(e);
      setError("图片处理失败。");
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const resultImage = await generateCharacterSheet(
        selectedImage, 
        customPrompt,
        poseType,
        backgroundColor
      );
      setGeneratedImage(resultImage);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "生成三视图失败，请重试。";
      if (typeof err === 'object' && err.toString().includes('[object Object]')) {
         try { errorMessage = JSON.stringify(err); } catch(e) {}
      }
      setError(errorMessage);
      setAppState(AppState.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'character-sheet.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const bgColors = [
    { name: '浅灰', value: '#F0F0F0' },
    { name: '纯白', value: '#FFFFFF' },
    { name: '深灰', value: '#333333' },
    { name: '绿幕', value: '#00FF00' },
  ];

  const isApiKeyError = /api[ _]key|google_api_key/i.test(error || '');
  const isQuotaError = /429|quota|resource_exhausted|exceeded|limit/i.test(error || '');
  
  // Get debug info
  const apiInfo = getApiConfigInfo();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Intro Section */}
        <section className="text-center py-8 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            将创意转化为 <span className="text-indigo-600">专业三视图</span>
          </h1>
          <p className="text-lg text-slate-600">
            上传角色立绘，通过AI即刻生成包含正、侧、背视角的专业参考图，支持A-pose和T-pose，助力游戏角色建模与设计。
          </p>
        </section>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">1</span>
                上传角色
              </h2>
              <div className="aspect-[4/3] w-full">
                <UploadArea 
                  onImageSelected={handleImageSelected} 
                  selectedImage={selectedImage}
                  onClear={handleClear}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">2</span>
                配置参数
              </h2>

              <div className="space-y-6">
                {/* Pose Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    姿势选择
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPoseType('ORIGINAL')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        poseType === 'ORIGINAL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      原动作保持
                    </button>
                    <button
                      onClick={() => setPoseType('A-POSE')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        poseType === 'A-POSE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      A-pose 姿势
                    </button>
                    <button
                      onClick={() => setPoseType('T-POSE')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        poseType === 'T-POSE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      T-pose 姿势
                    </button>
                  </div>
                </div>

                {/* Background Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <PaintBucket className="w-5 h-5 text-slate-600" />
                    背景颜色
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {bgColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          backgroundColor === color.value ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name}`}
                      />
                    ))}
                    <div className="relative group">
                       <input 
                        type="color" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 p-0.5 rounded-full border-2 border-slate-200 overflow-hidden cursor-pointer"
                       />
                       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                         自定义
                       </div>
                    </div>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    额外指令 (可选)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="例如：赛博朋克风格，添加红色围巾..."
                    className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none text-sm"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  isLoading={appState === AppState.GENERATING}
                  disabled={!selectedImage}
                  className="w-full"
                >
                  {appState === AppState.GENERATING ? '正在生成三视图...' : '生成三视图'}
                  {!appState.startsWith('GEN') && <Wand2 className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs">3</span>
                  生成结果
                </h2>
                {generatedImage && (
                  <Button variant="secondary" onClick={handleDownload} className="py-2 px-4 text-sm">
                    <Download className="w-5 h-5 mr-2" />
                    下载图片
                  </Button>
                )}
              </div>
              
              <div 
                className="flex-grow flex items-center justify-center rounded-xl border border-slate-100 overflow-hidden relative"
                style={{ backgroundColor: generatedImage ? 'transparent' : '#f8fafc' }}
              >
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated Character Sheet" 
                    className="w-full h-auto max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    {appState === AppState.GENERATING ? (
                      <div className="flex flex-col items-center animate-pulse">
                        <Sparkles className="w-16 h-16 text-indigo-400 mb-6" />
                        <p className="text-xl font-medium text-slate-600">AI 正在绘制三视图...</p>
                        <p className="text-base mt-2">这可能需要几秒钟</p>
                      </div>
                    ) : appState === AppState.ERROR ? (
                      <div className="flex flex-col items-center max-w-md mx-auto p-6 bg-red-50 rounded-xl border border-red-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isQuotaError ? 'bg-amber-100' : 'bg-red-100'}`}>
                          {isQuotaError ? <Clock className="w-8 h-8 text-amber-600" /> : <AlertTriangle className="w-8 h-8 text-red-600" />}
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 ${isQuotaError ? 'text-amber-900' : 'text-red-900'}`}>
                          {isQuotaError ? 'API 配额不足 (429)' : '生成失败'}
                        </h3>
                        
                        <div className="max-h-32 overflow-y-auto w-full mb-4 text-center">
                          <p className={`text-sm break-words ${isQuotaError ? 'text-amber-800' : 'text-red-700'}`}>
                             {error?.replace(/\{"error":.*message":"/, '').replace(/"\}/, '').substring(0, 150) + (error && error.length > 150 ? '...' : '')}
                          </p>
                        </div>
                        
                        {/* LOCAL DEV ERROR */}
                        {isApiKeyError && (
                          <div className="w-full text-xs text-slate-700 bg-white p-4 rounded-lg border border-red-200 text-left shadow-sm">
                            <div className="flex items-center gap-2 mb-2 border-b border-red-100 pb-2">
                                <FileCode className="w-5 h-5 text-red-600" />
                                <strong className="text-red-800 text-sm">本地配置指南</strong>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                              <li>找到 <code className="bg-slate-100 px-1 rounded">.env.example</code>，重命名为 <code className="bg-red-50 px-1 py-0.5 rounded text-red-900 font-bold">.env</code></li>
                              <li>在文件中填入 <code className="bg-slate-100 p-1 rounded">GOOGLE_API_KEY</code></li>
                              <li>重启开发服务器。</li>
                            </ol>
                          </div>
                        )}

                        {/* QUOTA ERROR */}
                        {isQuotaError && (
                          <div className="w-full text-xs text-slate-700 bg-white p-4 rounded-lg border border-amber-200 text-left shadow-sm">
                            <div className="flex items-center gap-2 mb-2 border-b border-amber-100 pb-2">
                                <RefreshCw className="w-5 h-5 text-amber-600" />
                                <strong className="text-amber-800 text-sm">解决方案</strong>
                            </div>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-sm">
                              <li><strong>推荐：</strong> 稍等 1-2 分钟重试。</li>
                              <li><strong>检查：</strong> 您的 API 余额或配额。</li>
                            </ul>
                            <div className="mt-4 text-center">
                                <Button variant="outline" onClick={handleGenerate} className="py-1.5 px-4 h-auto text-xs border-amber-300 text-amber-800 hover:bg-amber-50">重试生成</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center max-w-sm mx-auto text-center px-4">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-slate-100 shadow-inner">
                           <ArrowRight className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">准备生成</h3>
                        <p className="text-slate-500 mb-8">三视图生成结果将显示在这里</p>
                        
                        <div className="w-full bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-left">
                          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                            <MousePointerClick className="w-5 h-5 text-indigo-500" />
                            <h4 className="font-semibold text-slate-800">操作指南</h4>
                          </div>
                          <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-slate-600">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-medium text-slate-700 text-xs">1</span>
                              <span><strong className="font-medium text-slate-900">上传立绘</strong>：左侧上传角色单人立绘。</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-medium text-slate-700 text-xs">2</span>
                              <span><strong className="font-medium text-slate-900">AI 生成</strong>：配置参数后点击生成。</span>
                            </li>
                             <li className="flex items-start gap-3 text-sm text-slate-600">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-medium text-slate-700 text-xs">3</span>
                              <span><strong className="font-medium text-slate-900">下载</strong>：点击右上角按钮保存。</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {generatedImage && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-900">AI 完成绘制</h4>
                      <p className="text-sm text-indigo-700 mt-1">三视图已生成。可尝试修改指令或背景重新生成。</p>
                    </div>
                  </div>
                </div>
              )}

             </div>
          </div>

        </div>
      </main>

      {/* FOOTER & DEBUG PANEL */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm space-y-2">
          <p>© {new Date().getFullYear()} CharView AI. Powered by Gemini 2.5 Flash Image.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-300 pt-4 border-t border-slate-100 w-fit mx-auto mt-4 px-6">
             <div className="flex items-center gap-1" title="Build Time">
                <Terminal className="w-3 h-3" />
                <span>Build: {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'Local'}</span>
             </div>
             <div className="flex items-center gap-1" title="API Key Mask">
                <span>Key: {getMaskedApiKey()}</span>
             </div>
             <div className="flex items-center gap-1" title="API Source">
                <Server className="w-3 h-3" />
                <span>Source: <span className={apiInfo.isCustom ? "text-indigo-400 font-medium" : ""}>{apiInfo.source}</span></span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;