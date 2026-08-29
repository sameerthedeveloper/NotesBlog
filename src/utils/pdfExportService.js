import { toast } from "sonner";

/**
 * Dynamically loads html2pdf.js from CDN if not already loaded.
 */
const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      return resolve(window.html2pdf);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.integrity = "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==";
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.onload = () => resolve(window.html2pdf);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

/**
 * Escapes special HTML characters to prevent XSS in document metadata.
 */
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Exports HTML content to a beautifully formatted PDF document.
 * 
 * @param {string} title Note title
 * @param {string} htmlContent Note HTML content
 */
export const generatePdfFromNote = async (title = "Untitled Note", htmlContent = "") => {
  const toastId = toast.loading("Preparing PDF document...");

  try {
    const html2pdf = await loadHtml2Pdf();

    // Create wrapper container
    const container = document.createElement("div");
    container.className = "opennotes-pdf-document";
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px"; // Standard A4 width at 96 DPI
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#1e293b";
    container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    container.style.padding = "36px 40px";
    container.style.boxSizing = "border-box";

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    container.innerHTML = `
      <style>
        .opennotes-pdf-document * {
          box-sizing: border-box;
        }
        .pdf-header {
          border-bottom: 2.5px solid #2563eb;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .pdf-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px 0;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .pdf-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }
        .pdf-body {
          font-size: 14px;
          line-height: 1.7;
          color: #334155;
        }
        .pdf-body h1, .pdf-body h2, .pdf-body h3, .pdf-body h4 {
          color: #0f172a;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 12px;
          page-break-after: avoid;
        }
        .pdf-body p {
          margin: 0 0 14px 0;
        }
        .pdf-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          page-break-inside: avoid;
        }
        .pdf-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        .pdf-body th, .pdf-body td {
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          text-align: left;
          font-size: 13px;
        }
        .pdf-body th {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #0f172a;
        }
        .pdf-body blockquote {
          border-left: 4px solid #2563eb;
          background: #f8fafc;
          padding: 12px 18px;
          margin: 18px 0;
          border-radius: 0 8px 8px 0;
          color: #475569;
          font-style: italic;
          page-break-inside: avoid;
        }
        .pdf-body pre {
          background: #0f172a;
          color: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          overflow-x: auto;
          page-break-inside: avoid;
          margin: 16px 0;
        }
        .pdf-body code {
          background: #f1f5f9;
          color: #0f172a;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .pdf-body ul, .pdf-body ol {
          margin: 0 0 16px 0;
          padding-left: 24px;
        }
        .pdf-body li {
          margin-bottom: 6px;
        }
        .pdf-footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }
      </style>
      <div class="pdf-header">
        <div class="pdf-title">${escapeHtml(title)}</div>
        <div class="pdf-meta">
          <span>OpenNotes Document</span>
          <span>Date: ${dateStr}</span>
        </div>
      </div>
      <div class="pdf-body">
        ${htmlContent || "<p><em>No content</em></p>"}
      </div>
      <div class="pdf-footer">
        Generated with OpenNotes • Secure HTML Note Editor
      </div>
    `;

    document.body.appendChild(container);

    const safeFilename = (title || "note").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    const options = {
      margin: [10, 10, 12, 10],
      filename: `${safeFilename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true 
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    await html2pdf().set(options).from(container).save();

    document.body.removeChild(container);
    toast.success("PDF generated & downloaded!", { id: toastId });
  } catch (error) {
    console.error("PDF Generation error:", error);
    toast.error("Opening print preview for PDF generation...", { id: toastId });
    printNoteHtml(title, htmlContent);
  }
};

/**
 * Direct Print using an invisible iframe to prevent popup blocking.
 */
export const printNoteHtml = (title = "Untitled Note", htmlContent = "") => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; margin: 30px; color: #1e293b; line-height: 1.65; }
          h1 { font-size: 26px; border-bottom: 2.5px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; font-weight: 800; color: #0f172a; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 700; }
          blockquote { border-left: 4px solid #2563eb; background: #f8fafc; padding: 10px 16px; margin: 16px 0; font-style: italic; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div>${htmlContent || "<p><em>No content</em></p>"}</div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 250);
};

export default generatePdfFromNote;
