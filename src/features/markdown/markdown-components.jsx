import React from 'react';
import clsx from 'clsx';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { ExternalLink, CheckSquare, Square } from 'lucide-react';

const generateId = (text) => {
  return String(text).toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-');
};

const getExamStyleForHeading = (text) => {
  const t = String(text).toLowerCase();
  if (t.includes('theory question')) return 'border-examBlueDark bg-examBlue/10 text-examBlueDark dark:text-blue-300 dark:border-blue-500';
  if (t.includes('numerical question')) return 'border-examOrangeDark bg-examOrange/10 text-examOrangeDark dark:text-orange-300 dark:border-orange-500';
  if (t.includes('exam tip')) return 'border-examGreenDark bg-examGreen/10 text-examGreenDark dark:text-green-300 dark:border-green-500';
  if (t.includes('formula sheet')) return 'border-examPurpleDark bg-examPurple/10 text-examPurpleDark dark:text-purple-300 dark:border-purple-500';
  if (t.includes('trick')) return 'border-examYellowDark bg-examYellow/10 text-examYellowDark dark:text-yellow-300 dark:border-yellow-500';
  if (t.includes('study plan') || t.includes('step')) return 'border-primary-500 bg-primary-50 text-primary-700 dark:text-primary-300 dark:border-primary-500 dark:bg-primary-900/20';
  return null;
};

export const getMarkdownComponents = (isDark) => ({
  h1: ({ children }) => (
    <h1 
      id={generateId(children)} 
      className={clsx(
        "mt-10 mb-6 border-b pb-4 text-3xl font-extrabold tracking-tight sm:text-4xl",
        isDark ? "border-gray-800 text-gray-100" : "border-gray-200 text-gray-900"
      )}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 
      id={generateId(children)} 
      className={clsx(
        "mt-12 mb-4 border-l-4 pl-4 text-2xl font-bold tracking-tight",
        isDark ? "border-primary-500 text-gray-100" : "border-primary-500 text-gray-900"
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => {
    const examClass = getExamStyleForHeading(children);
    return (
      <h3 
        id={generateId(children)} 
        className={clsx(
          "mt-8 mb-4 text-xl font-bold",
          examClass ? `rounded-t-lg border-b-2 px-4 py-2 ${examClass}` : (isDark ? "text-gray-200" : "text-gray-800")
        )}
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => {
    // Detect Callouts (e.g. "> NOTE:")
    // react-markdown passes blockquotes as blockquote > p
    // We will handle callouts in blockquote instead.
    return (
      <p className={clsx(
        "mb-5 leading-7",
        isDark ? "text-gray-300" : "text-gray-700"
      )}>
        {children}
      </p>
    );
  },
  blockquote: ({ children }) => {
    // Check if it's a callout
    // react-markdown parses "> NOTE: something" as <blockquote><p>NOTE: something</p></blockquote>
    try {
      const pChild = React.Children.toArray(children).find(c => c.props?.node?.tagName === 'p');
      if (pChild) {
        const textContent = pChild.props.children[0];
        if (typeof textContent === 'string') {
          const match = textContent.match(/^(NOTE|TIP|WARNING|IMPORTANT|SUCCESS):\s*(.*)/i);
          if (match) {
            const type = match[1];
            const rest = [match[2], ...pChild.props.children.slice(1)];
            return <Callout type={type}>{rest}</Callout>;
          }
        }
      }
    } catch {
      // Ignored
    }
    
    return (
      <blockquote className={clsx(
        "my-6 border-l-4 py-2 pl-4 italic rounded-r-lg",
        isDark ? "border-gray-600 bg-gray-800/40 text-gray-400" : "border-gray-300 bg-gray-50 text-gray-600"
      )}>
        {children}
      </blockquote>
    );
  },
  ul: ({ children, className }) => (
    <ul className={clsx(
      "mb-6 ml-6 list-disc space-y-2",
      className === 'contains-task-list' ? 'list-none ml-0' : '',
      isDark ? "text-gray-300 marker:text-gray-500" : "text-gray-700 marker:text-gray-400"
    )}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={clsx(
      "mb-6 ml-6 list-decimal space-y-2",
      isDark ? "text-gray-300 marker:text-gray-500" : "text-gray-700 marker:text-gray-400"
    )}>
      {children}
    </ol>
  ),
  li: ({ children, className, checked }) => {
    if (className === 'task-list-item') {
      return (
        <li className="flex items-start gap-2 mb-2">
          <div className="mt-1 flex-shrink-0 text-primary-500">
            {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-400" />}
          </div>
          <div className={clsx(checked && "line-through opacity-70")}>
            {children}
          </div>
        </li>
      );
    }
    return <li>{children}</li>;
  },
  table: ({ children }) => (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className={clsx(
      "border-b text-left text-xs uppercase tracking-wider",
      isDark ? "border-gray-700 bg-gray-800/80 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"
    )}>
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className={clsx(
      "divide-y",
      isDark ? "divide-gray-700 bg-transparent text-gray-300" : "divide-gray-200 bg-white text-gray-700"
    )}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className={clsx(
      "transition-colors",
      isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50/80"
    )} {...props}>
      {children}
    </tr>
  ),

  th: ({ children, ...props }) => (
    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap" {...props}>
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td className="px-6 py-4 leading-relaxed" {...props}>
      {children}
    </td>
  ),

  pre: ({ children, ...props }) => {
    const codeElement = React.Children.toArray(children)[0];
    const className = codeElement?.props?.className || '';
    const codeString = codeElement?.props?.children || '';
    return <CodeBlock className={className} isBlock={true} {...props}>{codeString}</CodeBlock>;
  },

  code: ({ children, className, ...rest }) => {
    return <CodeBlock inline={true} className={className} {...rest}>{children}</CodeBlock>;
  },

  a: ({ children, href, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a 
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={clsx(
          "font-medium underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm",
          isDark 
            ? "text-blue-400 decoration-blue-400/30 hover:decoration-blue-400" 
            : "text-blue-600 decoration-blue-600/30 hover:decoration-blue-600"
        )}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className="inline-block ml-1 h-3.5 w-3.5" />}
      </a>
    );
  },

  img: ({ src, alt, ...props }) => (
    <figure className="my-8 flex flex-col items-center">
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        className="rounded-xl shadow-md border max-h-[600px] object-contain transition-transform hover:shadow-lg dark:border-gray-800" 
        {...props}
      />
      {alt && (
        <figcaption className={clsx(
          "mt-3 text-sm text-center font-medium",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          {alt}
        </figcaption>
      )}
    </figure>
  )
});
