import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-lg shadow-slate-900/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
    outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-500"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};