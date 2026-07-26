import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@mui/material';
import clsx from 'clsx';
import { List } from 'lucide-react';

const TableOfContents = ({ content }) => {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  const [activeId, setActiveId] = useState('');

  const headings = useMemo(() => {
    if (!content || typeof content !== 'string') return [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extracted = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-');
      extracted.push({ level, text, id });
    }
    return extracted;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0% -80% 0%' }
    );

    headings.forEach((h) => {
      const element = document.getElementById(h.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className={clsx(
      "sticky top-24 hidden max-h-[calc(100vh-8rem)] w-64 overflow-y-auto rounded-xl border p-4 xl:block",
      isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-100 bg-white"
    )}>
      <div className="mb-4 flex items-center gap-2 font-bold tracking-wide text-xs uppercase text-gray-500">
        <List className="h-4 w-4" />
        <span>On this page</span>
      </div>
      <ul className="space-y-2.5 text-sm">
        {headings.map((h, i) => (
          <li 
            key={`${h.id}-${i}`}
            style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
          >
            <a 
              href={`#${h.id}`}
              className={clsx(
                "block truncate transition-colors duration-200 hover:text-primary-500",
                activeId === h.id 
                  ? "font-bold text-primary-600 dark:text-primary-400" 
                  : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
