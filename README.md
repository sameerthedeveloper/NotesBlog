# OpenNotes 📝

> Modern, privacy-focused, semantic HTML note-taking and educational study workspace powered by React, TipTap, and Firebase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![MUI](https://img.shields.io/badge/Material--UI-v7-007FFF)

---

## 🌟 Overview

**OpenNotes** is a fast, responsive, privacy-focused web application designed for reading, editing, and managing rich HTML notes and university-grade study materials. Built with modern web standards and Material Design 3 aesthetics, OpenNotes prioritizes a **reading-first mobile experience** alongside an expansive desktop study environment.

---

## ✨ Key Features

- 📱 **Reading-First Mobile Experience**: Note reading bundle footprint optimized to **36.6 kB** by lazy-loading heavy editor engines on demand.
- ✍️ **Fullscreen Mobile Editor**: Dedicated single-column rich text editor for touch devices.
- 🎓 **Master Study Notes AI Presets**: Built-in prompt generator producing university-grade semantic HTML study notes with syntax blocks, comparison tables, formulas, exam focus, and interview Q&A pairs.
- 🛡️ **Strict HTML Sanitization**: Client-side XSS prevention via `DOMPurify` while preserving custom styling rules.
- 📊 **Material Design 3 Dashboard**: Refined metric cards with decorative SVGs, sparklines, and 1440px centered layout rhythm.
- 🔄 **Markdown-to-HTML Migration**: Built-in batch migration tool for converting legacy Markdown documents into rich HTML.
- 🌙 **Adaptive Light & Dark Modes**: Native theme toggling with theme-adaptive SVG branding assets.
- 🔍 **Real-Time Instant Search**: Fast content searching across note titles, tags, and HTML body text.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, JavaScript (ESNext), Vite 8
- **UI Framework**: Material UI (MUI v7), Emotion, Material Design 3
- **Rich Text Engine**: TipTap 3 (ProseMirror), DOMPurify
- **Backend & Auth**: Firebase Auth, Cloud Firestore
- **Date Formatting**: `date-fns`
- **Linting & Quality**: ESLint 9

---

## 📂 Folder Structure

```
open-notes/
├── public/                  # Vector branding assets, logos & favicon
│   ├── favicon.svg          # Official squircle notebook favicon
│   ├── logo.svg             # Primary logo badge
│   ├── header-logo.svg      # Horizontal Light Mode wordmark
│   └── header-logo-dark.svg # Horizontal Dark Mode wordmark
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ContentRenderer.jsx  # Sanitized HTML note viewer & lightbox
│   │   ├── NoteCard.jsx         # Card item with reading badges
│   │   ├── NoteCardGrid.jsx     # Responsive 4-column equal-height grid
│   │   ├── PromptBuilderModal.jsx # Master Study Notes prompt preset modal
│   │   └── TipTapEditor.jsx     # Lazy-loaded rich text HTML editor
│   ├── context/             # React Context providers (AuthContext, ThemeContext)
│   ├── features/            # Feature services (Firestore notesService)
│   ├── layouts/             # AppLayout (Appbar, Sidebar, 5-Tab Mobile Nav)
│   ├── pages/               # Route pages (DashboardPage, NoteEditorPage, etc.)
│   ├── utils/               # Sanitizers, metadata extractors, migration tools
│   ├── App.jsx              # Main router & theme provider
│   └── main.jsx             # React DOM entry point
├── .env.example             # Template for Firebase credentials
├── CHANGELOG.md             # Release history
├── CONTRIBUTING.md          # Open-source contribution guide
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/username/open-notes.git
   cd open-notes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and populate your Firebase project configuration:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 📦 Build & Deployment

To create a minified production bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
