
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full aspect-[16/9] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
        <img 
          src={selectedImage} 
          alt="Original Character" 
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <button 
            onClick={onClear}
            className="p-4 bg-white text-red-600 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold text-sm"
          >
            <X className="w-5 h-5" /> 移除重新上传
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full aspect-[16/9] flex flex-col items-center justify-center 
        rounded-3xl border-2 border-dashed transition-all duration-300
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' 
          : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 bg-slate-50'
        }
      `}
    >
      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImageSelected(e.target.files[0])} accept="image/*" className="hidden" />
      
      <div className="flex flex-col items-center gap-4 text-slate-400 group">
        <div className={`p-6 rounded-3xl bg-white shadow-sm border border-slate-100 transition-transform group-hover:-translate-y-1`}>
          <ImageIcon className="w-10 h-10 text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">点击或将立绘拖入此处</p>
          <p className="text-[11px] font-medium mt-1">建议上传 PNG 透明背景立绘效果最佳</p>
        </div>
      </div>
    </div>
  );
};
