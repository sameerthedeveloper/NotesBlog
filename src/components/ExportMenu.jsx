import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from "@mui/material";
import {
  FileDownload,
  PictureAsPdf,
  Description,
  Code,
  Print
} from "@mui/icons-material";
import { generatePdfFromNote, printNoteHtml } from "../utils/pdfExportService";

export const ExportMenu = ({ noteTitle = "Untitled Note", htmlContent = "" }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // --- Export Actions ---

  const handleExportPdf = async () => {
    handleClose();
    await generatePdfFromNote(noteTitle, htmlContent);
  };

  const handlePrint = () => {
    handleClose();
    printNoteHtml(noteTitle, htmlContent);
  };

  const exportAsHtmlFile = () => {
    handleClose();
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
    handleClose();
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${noteTitle}</title></head>
      <body><h1>${noteTitle}</h1>${htmlContent}</body>
      </html>
    `;
    const blob = new Blob(["\ufeff", docContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(noteTitle || "note").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Tooltip title="Export Note">
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownload />}
          onClick={handleOpen}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Export
        </Button>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleExportPdf}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Export as PDF" secondary="Vector/Canvas PDF file" />
        </MenuItem>

        <MenuItem onClick={exportAsDocx}>
          <ListItemIcon>
            <Description fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Export as DOCX (Word)" />
        </MenuItem>

        <MenuItem onClick={exportAsHtmlFile}>
          <ListItemIcon>
            <Code fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary="Export as HTML File" />
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <Print fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Print Note" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
