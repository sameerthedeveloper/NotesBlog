import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { 
  Box, 
  IconButton, 
  Tooltip, 
  ToggleButton, 
  ToggleButtonGroup, 
  Divider,
  Paper,
  alpha,
  useTheme,
  Stack
} from "@mui/material";
import { 
  FormatBold as BoldIcon, 
  FormatItalic as ItalicIcon, 
  FormatListBulleted as ListIcon, 
  FormatListNumbered as NumberedListIcon, 
  Code as CodeIcon,
  Image as ImageIcon,
  Title as H1Icon,
  TextFields as H2Icon,
  AttachFile as AttachFileIcon
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { uploadFileAttachment } from "../features/notes/services/notesService";
import { PdfExtension } from "../features/notes/extensions/PdfExtension";
import toast from "react-hot-toast";

const MenuBar = ({ editor, onUploadPdf, isUploading }) => {
  if (!editor) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        display: "flex", 
        flexWrap: "wrap", 
        mb: 1.5, 
        p: 1, 
        borderBottom: "1px solid", 
        borderColor: "divider",
        borderRadius: "16px 16px 0 0",
        backgroundColor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.divider, 0.05) : alpha(theme.palette.divider, 0.1),
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)"
      }}
    >
      {/* ... keeping simplified for better layout but standardizing group radius */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <ToggleButtonGroup size="small" sx={{ borderRadius: 2, "& .MuiToggleButton-root": { borderRadius: 2, mx: 0.1 } }}>
          <Tooltip title="Heading 1">
            <ToggleButton value="h1" selected={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <H1Icon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <ToggleButton value="h2" selected={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <H2Icon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" sx={{ borderRadius: 2 }}>
          <Tooltip title="Bold">
            <ToggleButton value="bold" selected={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <BoldIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Italic">
            <ToggleButton value="italic" selected={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <ItalicIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" sx={{ borderRadius: 2 }}>
          <Tooltip title="List">
            <ToggleButton value="bulletList" selected={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <ListIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Attach PDF">
            <span>
              <IconButton 
                onClick={onUploadPdf} 
                disabled={isUploading} 
                size="small" 
                sx={{ borderRadius: 2, m: 0.1, color: "text.secondary" }}
              >
                {isUploading ? <CircularProgress size={20} color="inherit" /> : <AttachFileIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </Paper>
  );
};

const NoteEditor = ({ content, onUpdate }) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      PdfExtension,
      Placeholder.configure({
        placeholder: "Write something special...",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleUploadPdf = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading("Uploading PDF...");
      try {
        const result = await uploadFileAttachment(currentUser.uid, file);
        editor.chain().focus().insertContent({
          type: 'pdfBlock',
          attrs: {
            url: result.url,
            filename: result.filename,
            size: result.size
          }
        }).run();
        toast.success("PDF attached", { id: toastId });
      } catch (error) {
        toast.error("Failed to attach PDF", { id: toastId });
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  return (
    <Box 
      sx={{ 
        border: "1px solid", 
        borderColor: "divider", 
        borderRadius: 1, // 16px Standardized MD3 Medium
        minHeight: "450px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : alpha(theme.palette.surface.variant, 0.05),
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:focus-within": {
            borderColor: "primary.main",
        },
        "& .ProseMirror": {
          flex: 1,
          p: { xs: 2, sm: 4 },
          outline: "none",
          minHeight: "400px",
          color: theme.palette.text.primary,
          lineHeight: 1.8,
          fontSize: "1rem",
          fontWeight: 500,
          "& p.is-editor-empty:first-of-type::before": {
            color: alpha(theme.palette.text.primary, 0.2),
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
            fontWeight: 600
          },
          "& h1": { fontSize: "2rem", fontWeight: 800, mb: 2, letterSpacing: "-0.5px" },
          "& h2": { fontSize: "1.5rem", fontWeight: 700, mb: 1, letterSpacing: "-0.25px" },
          "& blockquote": {
            borderLeft: "4px solid",
            borderColor: alpha(theme.palette.primary.main, 0.3),
            pl: 3,
            py: 1,
            my: 2,
            fontStyle: "italic",
            color: "text.secondary",
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 2
          },
          "& code": {
            backgroundColor: alpha(theme.palette.divider, 0.1),
            padding: "2px 6px",
            borderRadius: "6px",
            fontFamily: "monospace",
            fontSize: "0.9em",
            fontWeight: 700
          },
          "& img": {
            maxWidth: "100%",
            height: "auto",
            borderRadius: 1,
            my: 2,
          }
        }
      }}
    >
      <MenuBar editor={editor} onUploadPdf={handleUploadPdf} isUploading={isUploading} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default NoteEditor;
