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

export const ExportMenu = ({ noteTitle = "Untitled Note", htmlContent = "" }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // --- Export Actions ---

  const exportAsPrintOrPdf = () => {
    handleClose();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${noteTitle}</title>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; margin: 40px; color: #111; line-height: 1.75; }
            .opennotes-content { max-width: 900px; margin: 0 auto; }
            h1 { font-size: 28px; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 8px; font-weight: 800; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            blockquote { border-left: 4px solid #0B57D0; background: #f9f9f9; padding: 10px 16px; margin: 16px 0; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="opennotes-content">
            <h1>${noteTitle}</h1>
            <div>${htmlContent}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const exportAsHtmlFile = () => {
    handleClose();
    const fullHtml = `<!DOCTYPE html>\n<html>\n<head>\n<title>${noteTitle}</title>\n</head>\n<body>\n<h1>${noteTitle}</h1>\n${htmlContent}\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${noteTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
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
    link.download = `${noteTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
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
        <MenuItem onClick={exportAsPrintOrPdf}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Export as PDF / Print" />
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

        <MenuItem onClick={exportAsPrintOrPdf}>
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
