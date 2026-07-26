import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useTheme } from '@mui/material';
import clsx from 'clsx';
import { getMarkdownComponents } from './markdown-components';
import TableOfContents from './TableOfContents';
import ReadingProgress from './ReadingProgress';

// Highlight.js CSS for syntax highlighting (we'll rely on global imports or Tailwind colors via CodeBlock)
// Usually you'd import 'highlight.js/styles/github-dark.css' here, but we are styling CodeBlock manually.

const MarkdownViewer = ({ content }) => {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  // Collapse double-spaced tables (often caused by copy-pasting from PDFs or WYSIWYG editors)
  const cleanContent = (content || "").replace(/\|\s*\n\s*\n\s*\|/g, '|\n|');
  const components = React.useMemo(() => getMarkdownComponents(isDark), [isDark]);

  return (
    <div className="relative flex w-full max-w-7xl mx-auto flex-col xl:flex-row gap-8">
      <ReadingProgress />
      
      {/* Main Content Area */}
      <div className={clsx(
        "flex-1 min-w-0 max-w-[850px] mx-auto",
        isDark ? "text-gray-200" : "text-gray-800"
      )}>
        <article className="prose-custom max-w-none break-words pb-24">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={components}
          >
            {cleanContent}
          </ReactMarkdown>
        </article>
      </div>

      {/* Table of Contents Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <TableOfContents content={cleanContent} />
      </aside>
    </div>
  );
};

export default MarkdownViewer;
