import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Tooltip
} from "@mui/material";
import {
  AutoAwesome as SparklesIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Input as InsertIcon,
  Check as CheckIcon
} from "@mui/icons-material";
import toast from "react-hot-toast";

const PRESET_TEMPLATES = [
  {
    id: "edu_html_master",
    title: "Master Study Notes (Semantic HTML)",
    category: "Education",
    promptText: `Convert the topic or content into university-grade, professionally structured study notes returning ONLY semantic HTML. Include Introduction, Core Concepts, Architecture, Algorithms, Syntax, Comparison Tables, Real-world Applications, Formulas, Exam Focus (2/5/10 marks), Interview Q&A, and Quick Revision Summary. Use clean semantic tags (<article>, <header>, <h1>-<h4>, <strong>, <mark>, <div class="note">, <div class="important">, <div class="definition">).`
  },
  {
    id: "summarize",
    title: "Executive Summary",
    category: "Productivity",
    promptText: "Summarize the key takeaways of the following note into a concise executive summary with bullet points for action items."
  },
  {
    id: "outline",
    title: "Detailed Study Outline",
    category: "Learning",
    promptText: "Structure the provided topic into a comprehensive study outline with clear heading hierarchies (H1, H2, H3), key concepts, and real-world examples."
  },
  {
    id: "polish",
    title: "Grammar & Professional Tone",
    category: "Writing",
    promptText: "Rewrite and polish the following text to enhance readability, correct grammar, and adopt a professional, engaging tone while preserving the original meaning."
  },
  {
    id: "code_explain",
    title: "Code Explanation & Refactoring",
    category: "Coding",
    promptText: "Explain the provided code step-by-step, highlight potential edge cases, suggest performance optimizations, and provide clean refactored HTML code blocks."
  },
  {
    id: "flashcards",
    title: "Q&A Flashcard Generator",
    category: "Study",
    promptText: "Convert the key facts and definitions from this content into a list of 5-10 Question & Answer flashcard pairs formatted cleanly for study revision."
  }
];

export const PromptBuilderModal = ({ open, onClose, onInsertIntoEditor }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("edu_html_master");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [outputFormat, setOutputFormat] = useState("HTML");
  const [customInstructions, setCustomInstructions] = useState("");
  const [copied, setCopied] = useState(false);

  const activePreset = PRESET_TEMPLATES.find((t) => t.id === selectedTemplate) || PRESET_TEMPLATES[0];

  const generatedPrompt = `[ROLE & GOAL]
Act as an expert content editor and subject specialist.

[TASK INSTRUCTION]
${activePreset.promptText}

[TOPIC / CONTEXT]
${topic.trim() ? topic.trim() : "Insert document text or topic context here..."}

[FORMATTING REQUIREMENTS]
- Tone: ${tone}
- Preferred Output Structure: ${outputFormat}
${customInstructions.trim() ? `- Additional Constraints: ${customInstructions.trim()}` : ""}

Please generate clean, structured content ready for note taking.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertIntoEditor) {
      const htmlToInsert = `
        <div class="callout callout-info">
          <strong>🤖 AI Prompt Context:</strong> ${activePreset.title} (${tone} tone)
        </div>
        <p>${generatedPrompt.replace(/\n/g, "<br/>")}</p>
      `;
      onInsertIntoEditor(htmlToInsert);
      toast.success("Prompt inserted into editor!");
    } else {
      handleCopy();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SparklesIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            AI Prompt Builder
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, py: 3 }}>
        {/* Left Column: Controls & Presets */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
            1. Select Prompt Preset
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {PRESET_TEMPLATES.map((tmpl) => (
              <Chip
                key={tmpl.id}
                label={tmpl.title}
                onClick={() => setSelectedTemplate(tmpl.id)}
                color={selectedTemplate === tmpl.id ? "primary" : "default"}
                variant={selectedTemplate === tmpl.id ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          <TextField
            label="Topic / Subject Context (Optional)"
            placeholder="e.g. React 19 State Management, Quarterly Financial Analysis..."
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tone</InputLabel>
              <Select value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Casual & Conversational">Casual</MenuItem>
                <MenuItem value="Academic & Technical">Academic</MenuItem>
                <MenuItem value="Concise & Direct">Concise</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Format Output</InputLabel>
              <Select value={outputFormat} label="Format Output" onChange={(e) => setOutputFormat(e.target.value)}>
                <MenuItem value="HTML Rich Text">HTML Rich Text</MenuItem>
                <MenuItem value="Markdown">Markdown</MenuItem>
                <MenuItem value="Bullet Points List">Bullet Points List</MenuItem>
                <MenuItem value="Q&A Pairs">Q&A Pairs</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Custom Instructions (Optional)"
            placeholder="e.g., Use bullet points for key facts, keep under 300 words..."
            multiline
            rows={2}
            fullWidth
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
          />
        </Box>

        {/* Right Column: Live Generated Prompt Preview */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1 }}>
            2. Generated Prompt Preview
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              flexGrow: 1,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1e1e1e" : "#f9f9f9"),
              fontFamily: "monospace",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              borderRadius: 2,
              maxHeight: 320,
              overflowY: "auto"
            }}
          >
            {generatedPrompt}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button variant="outlined" startIcon={copied ? <CheckIcon /> : <CopyIcon />} onClick={handleCopy}>
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={onInsertIntoEditor ? <InsertIcon /> : <SparklesIcon />}
            onClick={handleInsert}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {onInsertIntoEditor ? "Insert into Editor" : "Use Prompt"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default PromptBuilderModal;
