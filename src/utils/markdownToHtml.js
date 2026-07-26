import { marked } from "marked";
import { sanitizeHTML } from "./sanitizer";

/**
 * Heuristic check to detect if a note's content is legacy Markdown rather than HTML.
 * HTML notes created with TipTap typically start with HTML tags like <p>, <h1>, <div>, etc.
 */
export const isMarkdownContent = (content) => {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  
  // If it starts with common HTML tags, it's HTML
  if (/^<[a-z1-6][\s\S]*>/i.test(trimmed)) {
    return false;
  }
  
  // If it contains Markdown signatures like # Heading, **bold**, [link](), ``` code
  const markdownSignatures = [
    /^#{1,6}\s+/m,           // Headings
    /\*\*.+?\*\*/,           // Bold
    /\*.+?\*/,               // Italic
    /\[.+?\]\(.+?\)/,        // Links
    /```[\s\S]*?```/,        // Code blocks
    /^\s*[-*+]\s+/m,         // Lists
    /^\s*\d+\.\s+/m,         // Numbered lists
    /^\s*>\s+/m,             // Blockquotes
  ];
  
  return markdownSignatures.some((regex) => regex.test(trimmed));
};

/**
 * Converts Markdown content to sanitized HTML safely.
 * If the content is already HTML, returns the sanitized HTML directly.
 * @param {string} content - Markdown or HTML string
 * @returns {string} Clean, sanitized HTML string
 */
export const convertMarkdownToSanitizedHtml = (content) => {
  if (!content || typeof content !== "string") return "";
  
  const trimmed = content.trim();
  
  // Check if content is already HTML
  if (!isMarkdownContent(trimmed) && /^<[a-z1-6][\s\S]*>/i.test(trimmed)) {
    return sanitizeHTML(trimmed);
  }
  
  try {
    // Parse markdown to HTML synchronously
    const rawHtml = marked.parse(trimmed, { gfm: true, breaks: true });
    return sanitizeHTML(rawHtml);
  } catch (error) {
    console.error("Failed to parse markdown:", error);
    return sanitizeHTML(trimmed);
  }
};
