/**
 * Intelligent HTML Note Import & Metadata Extraction Utility for OpenNotes
 */

import { stripHtmlTags } from "./sanitizer";

/**
 * Extracts structured metadata from an HTML string or TipTap content document
 * @param {string} htmlContent - Raw or sanitized HTML string
 * @returns {Object} Extracted metadata (title, subtitle, excerpt, wordCount, readingTime, characterCount, headings, difficulty)
 */
export const extractNoteMetadata = (htmlContent = "") => {
  if (!htmlContent || typeof htmlContent !== "string") {
    return {
      title: "Untitled Note",
      subtitle: "",
      excerpt: "",
      wordCount: 0,
      characterCount: 0,
      readingTimeMinutes: 1,
      headings: [],
      estimatedDifficulty: "Beginner"
    };
  }

  // Parse HTML string into DOM document
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // 1. Extract Title
  let title = "";
  const h1 = doc.querySelector("h1");
  const titleTag = doc.querySelector("title");
  const firstHeading = doc.querySelector("h2, h3, h4");

  if (h1 && h1.textContent.trim()) {
    title = h1.textContent.trim();
  } else if (titleTag && titleTag.textContent.trim()) {
    title = titleTag.textContent.trim();
  } else if (firstHeading && firstHeading.textContent.trim()) {
    title = firstHeading.textContent.trim();
  } else {
    // Fallback: use first non-empty line of text
    const textContent = stripHtmlTags(htmlContent).trim();
    const firstLine = textContent.split("\n")[0] || "";
    title = firstLine.slice(0, 60).trim() || "Untitled Note";
  }

  // 2. Extract Subtitle
  let subtitle = "";
  const h2 = doc.querySelector("h2");
  const firstP = doc.querySelector("p");

  if (h2 && h2.textContent.trim() && h2.textContent.trim() !== title) {
    subtitle = h2.textContent.trim();
  } else if (firstP && firstP.textContent.trim()) {
    subtitle = firstP.textContent.trim().slice(0, 140);
  } else {
    const plainText = stripHtmlTags(htmlContent).trim();
    subtitle = plainText.slice(0, 150);
  }

  // 3. Extract Clean Excerpt (180 chars)
  const plainText = stripHtmlTags(htmlContent).trim().replace(/\s+/g, " ");
  const excerpt = plainText.length > 180 ? `${plainText.slice(0, 180)}...` : plainText;

  // 4. Calculate Word & Character Count
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = plainText.length;

  // 5. Calculate Reading Time (average 200 words per minute)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 6. Extract Headings Hierarchy for Table of Contents
  const headingElements = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const headings = headingElements.map((el, index) => {
    const level = parseInt(el.tagName.replace("H", ""), 10);
    const text = el.textContent.trim();
    const id = text.toLowerCase().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-") || `heading-${index}`;
    return { level, text, id };
  });

  // 7. Calculate Estimated Difficulty based on average word length
  const avgWordLength = wordCount > 0 ? characterCount / wordCount : 0;
  let estimatedDifficulty = "Beginner";
  if (wordCount > 1000 || avgWordLength > 6.5) {
    estimatedDifficulty = "Advanced";
  } else if (wordCount > 400 || avgWordLength > 5.5) {
    estimatedDifficulty = "Intermediate";
  }

  return {
    title,
    subtitle,
    excerpt,
    wordCount,
    characterCount,
    readingTimeMinutes,
    headings,
    estimatedDifficulty
  };
};

/**
 * Normalizes HTML copied from ChatGPT, Notion, or StackOverflow
 * @param {string} rawHtml - Raw HTML from clipboard
 * @returns {string} Normalized HTML ready for TipTap editor
 */
export const normalizeChatGPTClipboardHtml = (rawHtml = "") => {
  if (!rawHtml) return "";
  
  // Clean up extra wrapper divs from ChatGPT clipboard outputs
  let cleaned = rawHtml
    .replace(/<div class="[^"]*markdown[^"]*">/gi, "<div>")
    .replace(/<span class="[^"]*copy-code[^"]*">.*?<\/span>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "");

  return cleaned;
};
