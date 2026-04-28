<div align="center">

# 💬 WhatsApp Chat Viewer

**Relive your WhatsApp conversations in a stunning, pixel-perfect interface — entirely in your browser.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00a884?style=for-the-badge)](LICENSE)

<br/>

A powerful, **100% private**, client-side WhatsApp chat parser and viewer.  
Upload your exported `.zip` or `.txt` file and instantly explore your messages, media, and statistics in a beautiful WhatsApp-style interface.

**🔒 Zero server uploads. Your data never leaves your device.**

<br/>

[Features](#-features) · [Quick Start](#-quick-start) · [How to Export](#-how-to-export-your-whatsapp-chat) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎨 Faithful WhatsApp UI
Pixel-perfect recreation of the WhatsApp Web experience — message bubbles with tails, double-tick read receipts, sender colors for group chats, timestamps, date separators, and system message pills.

### 🛡️ 100% Private & Secure
All parsing, rendering, and media extraction happens **locally in your browser**. There is no backend. No API calls. No tracking. Your chat data is never transmitted anywhere.

### 🌗 Light & Dark Themes
Full support for both WhatsApp's dark and light color schemes with a one-click toggle and persistent preference via `localStorage`.

### 📦 ZIP & TXT Support
- **`.zip` (with media)** — Automatically extracts and renders images, videos, voice notes, and documents inline.
- **`.txt` (text only)** — Parses the raw chat log with graceful "omitted" placeholders for missing media.

### 📽️ Rich Media Rendering
| Type | Behavior |
|------|----------|
| 📸 Images | Inline thumbnails with shimmer loading + full-screen lightbox on click |
| 🎬 Videos | Thumbnail preview with play overlay + lightbox playback |
| 🎙️ Voice Notes | Custom waveform audio player with play/pause and seek |
| 📄 Documents | File card with extension badge, filename, and download button |
| 📞 Calls | Voice/Video call notifications with phone icon |
| 🗑️ Deleted | Italic "This message was deleted" with icon |
| ↪️ Forwarded | "Forwarded" label badge |
| ⚙️ System | Centered system message pills (group events, encryption notices, etc.) |

### 🔍 Full-Text Search
Real-time search across all messages with:
- Yellow highlight on matching text
- Match counter (`3/47`)
- **↑ / ↓ navigation** between results (keyboard: `Enter` / `Shift+Enter`)
- `Escape` to dismiss

### 📊 Sidebar Analytics
A rich sidebar panel that shows:
- **Overview** — Total messages, media count, emoji count, participant count
- **Most Active Day** — The date with the highest message volume
- **Participants** — Ranked list with message counts, percentages, and color-coded progress bars
- **"You" badge** — Highlights your identity after selection

### 📅 Calendar Navigation
Interactive month calendar in the sidebar:
- Active days marked with green dots
- Click any date to **scroll directly to that day's messages**
- Month-by-month navigation with `‹ ›` buttons

### 🚀 High Performance
- **Virtualized rendering** via React Virtuoso — handles **10,000+ messages** without breaking a sweat
- In-browser ZIP extraction with streaming progress via `@zip.js/zip.js`
- Memoized components prevent unnecessary re-renders

### 🌍 Universal Format Support
Parses virtually every WhatsApp export format:
- Android (`DD/MM/YYYY, HH:MM - Sender: Message`)
- iOS (`[DD/MM/YYYY, HH:MM:SS] Sender: Message`)
- 12-hour and 24-hour time formats, with `AM/PM` and `a.m./p.m.` variants
- Date separators: `/`, `.`, `-`
- Automatic `DD/MM` vs `MM/DD` detection via global scan
- Unicode BOM / LTR / RTL mark stripping

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) **18+**
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/whatsapp-chat-viewer.git
cd whatsapp-chat-viewer/app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) and you're ready to go.

### Production Build

```bash
npm run build
npm start
```

---

## 📱 How to Export Your WhatsApp Chat

<table>
<tr>
<td width="50">

**1.**

</td>
<td>Open any chat in <strong>WhatsApp</strong> on your phone</td>
</tr>
<tr>
<td>

**2.**

</td>
<td>Tap <strong>⋮ Menu → More → Export chat</strong></td>
</tr>
<tr>
<td>

**3.**

</td>
<td>Select <strong>"Include media"</strong> for the full experience (images, videos, audio)</td>
</tr>
<tr>
<td>

**4.**

</td>
<td>Save the generated <code>.zip</code> file to your computer</td>
</tr>
<tr>
<td>

**5.**

</td>
<td><strong>Drag & drop</strong> (or click to browse) the file into the upload area</td>
</tr>
</table>

> **Tip:** Exporting *with* media gives you the richest experience — inline images, playable videos, and audio waveforms. Without media, you'll still get the full text conversation with placeholder indicators.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server-less SPA with React 19 |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Vanilla CSS | Utility-first + custom WhatsApp design tokens |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state management |
| **Virtualization** | [React Virtuoso](https://virtuoso.dev/) | Performant rendering of large message lists |
| **Storage** | [Dexie.js](https://dexie.org/) (IndexedDB) | Client-side session persistence |
| **ZIP Extraction** | [@zip.js/zip.js](https://gildas-lormeau.github.io/zip.js/) | In-browser ZIP decompression with streaming |
| **Typography** | [Inter](https://rsms.me/inter/) (Google Fonts) | Clean, modern typeface |

---

## 📁 Architecture

```
app/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with metadata & global CSS
│   │   ├── page.tsx                # Main page — upload or chat view
│   │   └── globals.css             # WhatsApp design tokens (dark + light)
│   │
│   ├── components/
│   │   ├── ThemeProvider.tsx        # Theme initialization from localStorage
│   │   ├── chat/
│   │   │   ├── ChatLayout.tsx      # Two-column layout (sidebar + messages)
│   │   │   ├── ChatHeader.tsx      # Title bar, search, theme toggle
│   │   │   ├── MessageList.tsx     # Virtualized message list with date separators
│   │   │   ├── MessageBubble.tsx   # Individual message rendering (all types)
│   │   │   ├── DateSeparator.tsx   # Date pill between message groups
│   │   │   ├── Sidebar.tsx         # Stats, participants, analytics
│   │   │   ├── SidebarCalendar.tsx # Interactive calendar for date navigation
│   │   │   └── OwnerModal.tsx      # "Who are you?" participant picker
│   │   ├── media/
│   │   │   ├── AudioBubble.tsx     # Custom audio player with waveform
│   │   │   └── MediaLightbox.tsx   # Full-screen image/video lightbox
│   │   └── upload/
│   │       ├── FileDropzone.tsx    # Drag-and-drop upload with guides
│   │       └── LoadingOverlay.tsx  # Parsing progress indicator
│   │
│   ├── lib/
│   │   ├── parse/
│   │   │   └── chatParser.ts       # WhatsApp format parser (multi-format)
│   │   ├── db/
│   │   │   └── dexie.ts            # IndexedDB persistence layer
│   │   └── extractZip.ts           # ZIP extraction with progress
│   │
│   ├── store/
│   │   └── chatStore.ts            # Zustand global state
│   │
│   └── types/
│       └── index.ts                # TypeScript interfaces
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind + postcss config
└── next.config.ts
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  .zip/.txt  │────▶│ extractZip() │────▶│ chatParser() │────▶│  Zustand     │
│  (user file)│     │ (media blobs)│     │ (messages)   │     │  Store       │
└─────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                     │
                                                    ┌────────────────┼────────────────┐
                                                    ▼                ▼                ▼
                                              ┌──────────┐   ┌──────────┐   ┌──────────┐
                                              │ ChatView │   │ Sidebar  │   │ Search   │
                                              │ (Virtuoso)│   │ (Stats)  │   │ (Filter) │
                                              └──────────┘   └──────────┘   └──────────┘
```

---

## 🎨 Design System

The app uses a comprehensive set of CSS custom properties (design tokens) that power both dark and light themes:

| Token Category | Examples |
|---------------|----------|
| **Backgrounds** | `--wa-bg-app`, `--wa-bg-sent`, `--wa-bg-received`, `--wa-bg-system` |
| **Text** | `--wa-text-primary`, `--wa-text-secondary`, `--wa-text-muted` |
| **Accents** | `--wa-accent` (#00a884), `--wa-green-light` (#25d366) |
| **Borders** | `--wa-border`, `--wa-border-light` |
| **Shadows** | `--wa-shadow`, `--wa-shadow-bubble` |
| **Radii** | `--wa-radius-bubble` (7.5px), `--wa-radius-lg`, `--wa-radius-xl` |
| **Typography** | Inter font family, 14.2px base size |

---

## 🔒 Privacy Guarantee

This application is architected for **complete data privacy**:

- ✅ **No server** — There is no backend whatsoever. It's a fully static client-side app.
- ✅ **No network requests** — Your chat data is never transmitted over the network.
- ✅ **No analytics** — No tracking scripts, no telemetry, no cookies.
- ✅ **No cloud storage** — Media is extracted into ephemeral browser Object URLs.
- ✅ **IndexedDB only** — Session persistence is local to your browser and can be cleared at any time.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ and ☕**

If you found this useful, consider giving it a ⭐

</div>