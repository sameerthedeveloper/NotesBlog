import DOMPurify from "dompurify";

/**
 * DOMPurify configuration for strict XSS prevention and safe HTML rendering
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "blockquote", "pre", "code",
    "a", "img", "iframe", "figure", "figcaption", "label", "input"
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel",
    "src", "alt", "title", "width", "height",
    "class", "id",
    "type", "checked", "disabled",
    "colspan", "rowspan",
    "allow", "allowfullscreen", "frameborder", "referrerpolicy"
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  ADD_ATTR: ["target"],
  FORBID_TAGS: ["script", "style", "object", "embed", "link", "form", "button"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
};

/**
 * Converts TipTap JSON or raw JSON block document into clean HTML tags.
 * Ensures raw JSON strings are NEVER displayed to the user.
 * 
 * @param {object|array} jsonDoc - Parsed JSON object/array
 * @returns {string} HTML string
 */
export const convertJsonToHtml = (jsonDoc) => {
  if (!jsonDoc) return "";

  // Handle simple array format, e.g. [{"value": "text"}] or ["line1", "line2"]
  if (Array.isArray(jsonDoc)) {
    return jsonDoc
      .map((item) => {
        if (typeof item === "string") return `<p>${item}</p>`;
        if (item && item.value) return `<p>${item.value}</p>`;
        if (item && item.text) return `<p>${item.text}</p>`;
        return "";
      })
      .join("");
  }

  // Handle TipTap JSON document: { type: "doc", content: [...] }
  if (typeof jsonDoc === "object" && jsonDoc.type === "doc" && Array.isArray(jsonDoc.content)) {
    const renderNode = (node) => {
      if (!node) return "";
      
      if (node.type === "text") {
        let text = node.text || "";
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type === "bold") text = `<strong>${text}</strong>`;
            if (mark.type === "italic") text = `<em>${text}</em>`;
            if (mark.type === "underline") text = `<u>${text}</u>`;
            if (mark.type === "strike") text = `<s>${text}</s>`;
            if (mark.type === "link" && mark.attrs?.href) text = `<a href="${mark.attrs.href}" target="_blank">${text}</a>`;
          });
        }
        return text;
      }

      const inner = node.content ? node.content.map(renderNode).join("") : "";

      switch (node.type) {
        case "heading": {
          const level = node.attrs?.level || 1;
          return `<h${level}>${inner}</h${level}>`;
        }
        case "paragraph":
          return `<p>${inner}</p>`;
        case "bulletList":
          return `<ul>${inner}</ul>`;
        case "orderedList":
          return `<ol>${inner}</ol>`;
        case "listItem":
          return `<li>${inner}</li>`;
        case "blockquote":
          return `<blockquote>${inner}</blockquote>`;
        case "codeBlock":
          return `<pre><code>${inner}</code></pre>`;
        case "horizontalRule":
          return `<hr />`;
        case "image":
          return `<img src="${node.attrs?.src || ''}" alt="${node.attrs?.alt || ''}" />`;
        default:
          return inner ? `<p>${inner}</p>` : "";
      }
    };

    return jsonDoc.content.map(renderNode).join("");
  }

  return "";
};

/**
 * Sanitizes HTML string using DOMPurify with strict whitelist settings.
 * Automatically parses JSON string into HTML if input is raw JSON format.
 * 
 * @param {string} htmlContent - Raw HTML or JSON string to sanitize
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHTML = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== "string") return "";
  const trimmed = htmlContent.trim();

  // Detect if content is raw JSON string
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const convertedHtml = convertJsonToHtml(parsed);
      if (convertedHtml) {
        return DOMPurify.sanitize(convertedHtml, PURIFY_CONFIG);
      }
    } catch {
      // Not valid JSON, proceed as standard string
    }
  }

  // Hook for setting target="_blank" on external links
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if ("target" in node && node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  return DOMPurify.sanitize(trimmed, PURIFY_CONFIG);
};

/**
 * Extracts plain text excerpt from HTML/JSON string for cards and previews
 * 
 * @param {string} htmlContent - HTML or JSON string
 * @returns {string} Plain text content stripped of HTML tags and JSON syntax
 */
export const stripHtmlTags = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== "string") return "";
  
  const sanitized = sanitizeHTML(htmlContent);
  if (!sanitized) return "";

  const tmp = document.createElement("DIV");
  tmp.innerHTML = sanitized;
  const rawText = tmp.textContent || tmp.innerText || "";
  
  // Collapse whitespace
  return rawText.replace(/\s+/g, " ").trim();
};
