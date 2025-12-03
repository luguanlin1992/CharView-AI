import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-full min-h-[300px] bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-200">
        <img 
          src={selectedImage} 
          alt="Original Character" 
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-3 bg-white rounded-full shadow-md hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
          原图
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full min-h-[300px] h-full flex flex-col items-center justify-center 
        rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
        ${isDragging 
          ? 'border-slate-900 bg-slate-50 scale-[0.99]' 
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 bg-white'
        }
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center gap-6 text-slate-500">
        <div className={`p-6 rounded-full bg-slate-100 ${isDragging ? 'bg-slate-200' : ''}`}>
          <Upload className="w-12 h-12 text-slate-700" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">点击或拖拽上传图片</p>
          <p className="text-base mt-2">支持上传 JPG, PNG 格式的角色立绘</p>
        </div>
      </div>
    </div>
  );
};