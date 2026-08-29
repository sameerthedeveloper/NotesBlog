"use client";

import { useEffect, useState } from "react";
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
  Sparkles,
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon,
  Highlighter,
  Baseline,
  Eraser,
  ListChecks,
  Upload,
  Save,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { sanitizeHTML } from "@/utils/sanitizer";
import { convertMarkdownToSanitizedHtml } from "@/utils/markdownToHtml";
import { extractNoteMetadata, normalizeChatGPTClipboardHtml } from "@/utils/metadataExtractor";
import { uploadFileAttachment } from "@/features/notes/services/notesService";
import { useAuth } from "@/context/AuthContext";

import PromptBuilderModal from "@/components/PromptBuilderModal";

const COLORS = ["#000000", "#434343", "#666666", "#d9d9d9", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe"];

function ToolbarButton({ label, active, disabled, onClick, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onClick}
          className={cn("size-8", active && "bg-primary/10 text-primary")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ColorSwatchMenu({ label, icon, onPick }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-8">
              {icon}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="grid grid-cols-5 gap-1.5 p-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            className="size-6 rounded-full border border-border transition-transform hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const TipTapEditor = ({
  initialContent = "",
  onChange,
  onSave,
  onMetadataExtracted,
  autoSave = true,
  placeholder = "Start writing your note here...",
}) => {
  const { currentUser } = useAuth();
  const [saveStatus, setSaveStatus] = useState("saved");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [promptModalOpen, setPromptModalOpen] = useState(false);

  const sanitizedInitialContent = convertMarkdownToSanitizedHtml(initialContent);
  const [docMetadata, setDocMetadata] = useState(() => extractNoteMetadata(sanitizedInitialContent));

  const editor = useEditor({
    immediatelyRender: false,
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
          if (process.env.NODE_ENV !== "production") {
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
      <div className="flex justify-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor.isActive("heading", { level: 2 })
    ? "Heading 2"
    : editor.isActive("heading", { level: 3 })
    ? "Heading 3"
    : "Paragraph";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-2">
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="gap-1 px-2 font-semibold">
              {headingLabel}
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <span className="text-xl font-bold">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <span className="text-lg font-bold">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <span className="text-base font-bold">Heading 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <ColorSwatchMenu
          label="Text Color"
          icon={<Baseline className="size-4" />}
          onPick={(c) => editor.chain().focus().setColor(c).run()}
        />
        <ColorSwatchMenu
          label="Highlight Color"
          icon={<Highlighter className="size-4" />}
          onPick={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
        />

        <ToolbarButton label="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton label="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton label="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Task List" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton label="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert Image" onClick={() => setImageDialogOpen(true)}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Embed Video / YouTube" onClick={() => setVideoDialogOpen(true)}>
          <VideoIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert Link"
          active={editor.isActive("link")}
          onClick={() => {
            setLinkUrl(editor.getAttributes("link").href || "");
            setLinkDialogOpen(true);
          }}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <CodeIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="AI Prompt Builder" onClick={() => setPromptModalOpen(true)}>
          <Sparkles className="size-4 text-primary" />
        </ToolbarButton>

        <div className="flex-1" />

        {autoSave && (
          <Badge variant="outline" className="gap-1.5 font-semibold">
            {saveStatus === "saving" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : saveStatus === "saved" ? (
              <CheckCircle2 className="size-3 text-emerald-500" />
            ) : (
              <Save className="size-3" />
            )}
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Unsaved changes"}
          </Badge>
        )}
      </div>

      {/* Editor Body */}
      <div className="opennotes-content p-6">
        <EditorContent editor={editor} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 font-semibold text-primary">
              <Zap className="size-3" />
              {docMetadata.readingTimeMinutes} min read
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {docMetadata.wordCount.toLocaleString()} words · {docMetadata.characterCount.toLocaleString()} chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">
              Level: {docMetadata.estimatedDifficulty}
            </Badge>
            {docMetadata.headings.length > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                {docMetadata.headings.length} headings
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert / Edit Link</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            type="url"
            placeholder="URL Address"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSetLink}>Save Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="flex min-w-[320px] flex-col gap-3 pt-1">
            <Button variant="outline" disabled={uploadingImage} asChild>
              <label className="cursor-pointer">
                {uploadingImage ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploadingImage ? "Uploading..." : "Upload Local Image"}
                <input type="file" hidden accept="image/*" onChange={handleImageFileUpload} />
              </label>
            </Button>

            <div className="relative flex items-center">
              <div className="h-px flex-1 bg-border" />
              <span className="px-2 text-xs font-semibold text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddImage} disabled={!imageUrl}>Insert URL Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Video (YouTube)</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddVideo} disabled={!videoUrl}>Embed Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromptBuilderModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onInsertIntoEditor={(html) => {
          if (editor) {
            editor.chain().focus().insertContent(html).run();
          }
        }}
      />
    </div>
  );
};

export default TipTapEditor;
