import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";

import {
  Box,
  Paper,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress
} from "@mui/material";

import {
  AutoAwesome as SparklesIcon,
  Undo,
  Redo,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  HorizontalRule,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  InsertLink,
  LinkOff,
  Image as ImageIcon,
  YouTube as YoutubeIcon,
  TableChart,
  FormatColorFill,
  FormatColorText,
  FormatClear,
  CheckBoxOutlined,
  CloudUpload,
  Save,
  CheckCircleOutline
} from "@mui/icons-material";

import { sanitizeHTML } from "../utils/sanitizer";
import { convertMarkdownToSanitizedHtml } from "../utils/markdownToHtml";
import { extractNoteMetadata, normalizeChatGPTClipboardHtml } from "../utils/metadataExtractor";
import { uploadFileAttachment } from "../features/notes/services/notesService";
import { useAuth } from "../context/AuthContext";

import PromptBuilderModal from "./PromptBuilderModal";

export const TipTapEditor = ({
  initialContent = "",
  onChange,
  onSave,
  onMetadataExtracted,
  autoSave = true,
  placeholder = "Start writing your note here..."
}) => {
  const { currentUser } = useAuth();
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'saving', 'unsaved'
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [promptModalOpen, setPromptModalOpen] = useState(false);

  // Heading Menu state
  const [headingAnchorEl, setHeadingAnchorEl] = useState(null);
  // Color Menu state
  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  // Highlight Menu state
  const [highlightAnchorEl, setHighlightAnchorEl] = useState(null);

  // Convert initial content if legacy markdown
  const sanitizedInitialContent = convertMarkdownToSanitizedHtml(initialContent);
  const [docMetadata, setDocMetadata] = useState(() => extractNoteMetadata(sanitizedInitialContent));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: true,
        link: false,
        underline: false,
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: sanitizedInitialContent,
    editorProps: {
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        try {
          // 1. Rich HTML paste from clipboard (ChatGPT, Word, Google Docs, Notion, Web)
          if (html && html.trim()) {
            const normalized = normalizeChatGPTClipboardHtml(html);
            const sanitized = sanitizeHTML(normalized);
            if (sanitized && editor) {
              editor.commands.insertContent(sanitized);
              const extracted = extractNoteMetadata(editor.getHTML());
              setDocMetadata(extracted);
              if (onMetadataExtracted) onMetadataExtracted(extracted);
              return true;
            }
          }

          // 2. Raw HTML code string paste (e.g., pasting "<h1>Title</h1><p>Text</p>")
          if (text && typeof text === "string") {
            const trimmed = text.trim();
            const isRawHtmlString = /<\/?(p|h[1-6]|ul|ol|li|table|tr|td|th|div|span|strong|em|u|s|blockquote|pre|code|a|img|hr|br)[^>]*>/i.test(trimmed);
            if (isRawHtmlString) {
              const sanitized = sanitizeHTML(trimmed);
              if (sanitized && editor) {
                editor.commands.insertContent(sanitized);
                const extracted = extractNoteMetadata(editor.getHTML());
                setDocMetadata(extracted);
                if (onMetadataExtracted) onMetadataExtracted(extracted);
                return true;
              }
            }
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("Smart HTML paste handler error:", err);
          }
          return false;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = sanitizeHTML(editor.getHTML());
      const extracted = extractNoteMetadata(html);
      setDocMetadata(extracted);
      if (onMetadataExtracted) onMetadataExtracted(extracted);
      if (onChange) onChange(html);
      setSaveStatus("unsaved");
    },
  });

  // Handle Auto-Save Debounce
  useEffect(() => {
    if (!autoSave || !onSave || saveStatus !== "unsaved") return;

    const timer = setTimeout(async () => {
      if (editor) {
        setSaveStatus("saving");
        try {
          await onSave(sanitizeHTML(editor.getHTML()));
          setSaveStatus("saved");
        } catch (error) {
          console.error("Auto-save error:", error);
          setSaveStatus("unsaved");
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [saveStatus, editor, autoSave, onSave]);

  if (!editor) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // --- Handlers ---
  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  };

  const handleImageFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    
    setUploadingImage(true);
    try {
      const result = await uploadFileAttachment(currentUser.uid, file);
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      setImageDialogOpen(false);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddVideo = () => {
    if (videoUrl) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
      setVideoUrl("");
      setVideoDialogOpen(false);
    }
  };

  const colors = ["#000000", "#434343", "#666666", "#d9d9d9", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe"];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        borderColor: "divider",
      }}
    >
      {/* Editor Top Control Bar */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
        }}
      >
        {/* Undo / Redo */}
        <Tooltip title="Undo">
          <span>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Heading Dropdown */}
        <Button
          size="small"
          onClick={(e) => setHeadingAnchorEl(e.currentTarget)}
          sx={{ textTransform: "none", fontWeight: 600, px: 1.5 }}
        >
          {editor.isActive("heading", { level: 1 })
            ? "Heading 1"
            : editor.isActive("heading", { level: 2 })
            ? "Heading 2"
            : editor.isActive("heading", { level: 3 })
            ? "Heading 3"
            : "Paragraph"}
        </Button>
        <Menu
          anchorEl={headingAnchorEl}
          open={Boolean(headingAnchorEl)}
          onClose={() => setHeadingAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              setHeadingAnchorEl(null);
            }}
          >
            Paragraph
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              setHeadingAnchorEl(null);
            }}
          >
            <Typography variant="h5">Heading 1</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              setHeadingAnchorEl(null);
            }}
          >
            <Typography variant="h6">Heading 2</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              setHeadingAnchorEl(null);
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Heading 3
            </Typography>
          </MenuItem>
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Text Styling */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            color={editor.isActive("bold") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBold fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            size="small"
            color={editor.isActive("italic") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton
            size="small"
            color={editor.isActive("underline") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <FormatUnderlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            color={editor.isActive("strike") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughS fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Text Color Picker */}
        <Tooltip title="Text Color">
          <IconButton size="small" onClick={(e) => setColorAnchorEl(e.currentTarget)}>
            <FormatColorText fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={colorAnchorEl}
          open={Boolean(colorAnchorEl)}
          onClose={() => setColorAnchorEl(null)}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, p: 1 }}>
            {colors.map((c) => (
              <Box
                key={c}
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setColorAnchorEl(null);
                }}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: c,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.2)",
                  "&:hover": { transform: "scale(1.15)" },
                }}
              />
            ))}
          </Box>
        </Menu>

        {/* Highlight Color Picker */}
        <Tooltip title="Highlight Color">
          <IconButton size="small" onClick={(e) => setHighlightAnchorEl(e.currentTarget)}>
            <FormatColorFill fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={highlightAnchorEl}
          open={Boolean(highlightAnchorEl)}
          onClose={() => setHighlightAnchorEl(null)}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, p: 1 }}>
            {colors.map((c) => (
              <Box
                key={c}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: c }).run();
                  setHighlightAnchorEl(null);
                }}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: c,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.2)",
                  "&:hover": { transform: "scale(1.15)" },
                }}
              />
            ))}
          </Box>
        </Menu>

        <Tooltip title="Clear Formatting">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <FormatClear fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Alignment */}
        <Tooltip title="Align Left">
          <IconButton
            size="small"
            color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <FormatAlignLeft fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton
            size="small"
            color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <FormatAlignCenter fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton
            size="small"
            color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <FormatAlignRight fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists & Task list */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            color={editor.isActive("bulletList") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            color={editor.isActive("orderedList") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Task List">
          <IconButton
            size="small"
            color={editor.isActive("taskList") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckBoxOutlined fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Table, Image, Video, Link, Code */}
        <Tooltip title="Insert Table">
          <IconButton
            size="small"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <TableChart fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Image">
          <IconButton size="small" onClick={() => setImageDialogOpen(true)}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Embed Video / YouTube">
          <IconButton size="small" onClick={() => setVideoDialogOpen(true)}>
            <YoutubeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Link">
          <IconButton
            size="small"
            color={editor.isActive("link") ? "primary" : "default"}
            onClick={() => {
              setLinkUrl(editor.getAttributes("link").href || "");
              setLinkDialogOpen(true);
            }}
          >
            <InsertLink fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Blockquote">
          <IconButton
            size="small"
            color={editor.isActive("blockquote") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <FormatQuote fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Code Block">
          <IconButton
            size="small"
            color={editor.isActive("codeBlock") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="AI Prompt Builder">
          <IconButton size="small" color="primary" onClick={() => setPromptModalOpen(true)}>
            <SparklesIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box sx={{ flexGrow: 1 }} />

        {/* Auto Save Status Badge */}
        {autoSave && (
          <Chip
            size="small"
            variant="outlined"
            icon={
              saveStatus === "saving" ? (
                <CircularProgress size={12} />
              ) : saveStatus === "saved" ? (
                <CheckCircleOutline fontSize="small" />
              ) : (
                <Save fontSize="small" />
              )
            }
            label={
              saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                ? "Saved"
                : "Unsaved changes"
            }
            color={saveStatus === "saved" ? "success" : saveStatus === "saving" ? "info" : "warning"}
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        )}
      </Box>

      {/* Editor Body */}
      <Box
        className="opennotes-content"
        sx={{
          p: 3,
          minHeight: 350,
          "& .tiptap": {
            outline: "none",
            minHeight: 300,
            fontSize: "1.05rem",
            lineHeight: 1.7,
            "& p.is-editor-empty:first-child::before": {
              color: "text.disabled",
              content: "attr(data-placeholder)",
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& table": {
              borderCollapse: "collapse",
              width: "100%",
              my: 2,
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                p: 1.5,
              },
              "& th": {
                bgcolor: "action.hover",
                fontWeight: 700,
              },
            },
            "& ul[data-type='taskList']": {
              listStyle: "none",
              p: 0,
              "& li": {
                display: "flex",
                alignItems: "center",
                gap: 1,
                my: 0.5,
                "& > label": {
                  cursor: "pointer",
                },
              },
            },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: "primary.main",
              pl: 2,
              my: 2,
              fontStyle: "italic",
              color: "text.secondary",
            },
            "& pre": {
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5"),
              color: (theme) => (theme.palette.mode === "dark" ? "#d4d4d4" : "#333"),
              p: 2,
              borderRadius: 2,
              fontFamily: "monospace",
              overflowX: "auto",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
              my: 2,
            },
            "& iframe": {
              maxWidth: "100%",
              borderRadius: 2,
              my: 2,
            },
          },
        }}
      >
        <EditorContent editor={editor} />

        {/* Live Metadata & Reading Stats Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            px: 3,
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              label={`⚡ ${docMetadata.readingTimeMinutes} min read`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {docMetadata.wordCount.toLocaleString()} words · {docMetadata.characterCount.toLocaleString()} chars
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={`Level: ${docMetadata.estimatedDifficulty}`}
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
            {docMetadata.headings.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {docMetadata.headings.length} headings
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle>Insert / Edit Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL Address"
            type="url"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSetLink} variant="contained">
            Save Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 320 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
            disabled={uploadingImage}
          >
            {uploadingImage ? "Uploading..." : "Upload Local Image"}
            <input type="file" hidden accept="image/*" onChange={handleImageFileUpload} />
          </Button>

          <Divider>OR</Divider>

          <TextField
            label="Image URL"
            type="url"
            fullWidth
            variant="outlined"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddImage} variant="contained" disabled={!imageUrl}>
            Insert URL Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onClose={() => setVideoDialogOpen(false)}>
        <DialogTitle>Embed Video (YouTube)</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="YouTube Video Link"
            type="url"
            fullWidth
            variant="outlined"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddVideo} variant="contained" disabled={!videoUrl}>
            Embed Video
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Prompt Builder Modal */}
      <PromptBuilderModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onInsertIntoEditor={(html) => {
          if (editor) {
            editor.chain().focus().insertContent(html).run();
          }
        }}
      />
    </Paper>
  );
};

export default TipTapEditor;
