# NyayaPath — VS Code setup

1. Install Node.js 22 LTS from https://nodejs.org.
2. Extract this ZIP and open the extracted folder in VS Code.
3. Open **Terminal → New Terminal** and run:

```powershell
corepack enable
pnpm install
pnpm dev
```

Open the local address shown in the terminal (usually `http://localhost:3000`). If `pnpm` is not recognised, run `npm install -g pnpm`, then repeat the commands.

The first version works without an API key: sample review, TXT/Markdown import, source-linked topic flags, original text, comparison, keyword search, evidence checklist, consultation-pack export, read-aloud, larger text, and official legal-help links.

PDF/image OCR is not connected yet. Live GenAI is optional. Copy `.env.example` to `.env`, add `OPENAI_API_KEY` and `OPENAI_MODEL`, then restart the dev server. Never expose or commit `.env`.

NyayaPath gives legal information, not professional legal advice. Important decisions must be checked with a qualified professional.
