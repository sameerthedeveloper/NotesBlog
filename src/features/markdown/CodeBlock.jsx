import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@mui/material';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code 
        className={clsx(
          "rounded-md px-1.5 py-0.5 font-mono text-[0.875em] font-semibold transition-colors",
          isDark 
            ? "bg-gray-800 text-pink-400" 
            : "bg-gray-100 text-pink-600"
        )} 
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className={clsx(
      "group relative my-6 overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md",
      isDark ? "border-gray-700 bg-[#1e1e1e]" : "border-gray-200 bg-gray-50"
    )}>
      {/* Header */}
      <div className={clsx(
        "flex items-center justify-between border-b px-4 py-2 text-xs font-bold uppercase tracking-wider",
        isDark ? "border-gray-700 bg-gray-800/50 text-gray-400" : "border-gray-200 bg-gray-100 text-gray-500"
      )}>
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className={clsx(
            "flex items-center gap-1 rounded px-2 py-1 transition-all",
            isDark 
              ? "hover:bg-gray-700 hover:text-gray-200" 
              : "hover:bg-gray-200 hover:text-gray-800",
            copied ? "text-green-500" : ""
          )}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="sr-only sm:not-sr-only sm:ml-1">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      
      {/* Code Content */}
      <div className="overflow-x-auto p-4 text-[0.9em]">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

export default CodeBlock;
