"use client";

import { Download, FileText, Code, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generatePdfFromNote, printNoteHtml } from "@/utils/pdfExportService";

export const ExportMenu = ({ noteTitle = "Untitled Note", htmlContent = "" }) => {
  const handleExportPdf = async () => {
    await generatePdfFromNote(noteTitle, htmlContent);
  };

  const handlePrint = () => {
    printNoteHtml(noteTitle, htmlContent);
  };

  const exportAsHtmlFile = () => {
    const fullHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${noteTitle}</title>\n<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:40px;line-height:1.6;color:#1e293b;}h1{border-bottom:2px solid #2563eb;padding-bottom:10px;color:#0f172a;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #cbd5e1;padding:8px;}th{background:#f1f5f9;}blockquote{border-left:4px solid #2563eb;background:#f8fafc;padding:10px 16px;}</style>\n</head>\n<body>\n<h1>${noteTitle}</h1>\n<div>${htmlContent}</div>\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(noteTitle || "note").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsDocx = () => {
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${noteTitle}</title></head>
      <body><h1>${noteTitle}</h1>${htmlContent}</body>
      </html>
    `;
    const blob = new Blob(["﻿", docContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(noteTitle || "note").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPdf}>
          <FileText className="text-muted-foreground" />
          <div className="flex flex-col">
            <span>Export as PDF</span>
            <span className="text-xs text-muted-foreground">Vector/Canvas PDF file</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsDocx}>
          <FileText className="text-muted-foreground" />
          Export as DOCX (Word)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHtmlFile}>
          <Code className="text-muted-foreground" />
          Export as HTML File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="text-muted-foreground" />
          Print Note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
