# SoleTasker

Voice-first job management for sole-trader tradies.
"Say it once. Done. Not forgotten."

## Quick Start

```bash
npm install
npm start
```

Opens at http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import repo
3. Framework: Create React App (auto-detected)
4. Add environment variable: REACT_APP_ANTHROPIC_API_KEY = your key
5. Deploy

## Voice Capture

Works in Chrome and Safari on a real hosted URL.
Does not work inside Claude's artifact preview (browser sandbox restriction).

## Environment Variables

Add to Vercel → Settings → Environment Variables:

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

Then in App.jsx find the Anthropic fetch call and add:
```
"x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
"anthropic-version": "2023-06-01",
```

## Stack

- React 18 (Create React App)
- Web Speech API — voice transcription (browser-native, free)
- Anthropic Claude API — AI parsing of voice transcripts
- All styles inline (no external CSS framework)
- No backend (prototype — Supabase integration pending)

## Project Structure

```
src/
  App.jsx     — entire application
  index.js    — React entry point
public/
  index.html  — HTML shell with PWA meta tags
```
