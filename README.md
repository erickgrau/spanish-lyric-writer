# Spanish Lyric Writer

Write your idea in English — get real Spanish song lyrics built for the genre. Rhymes and rhythm are crafted natively in Spanish, not translated from English.

## Features

- 10 music styles: Hip Hop (Jersey City), Reggaeton, Salsa, Bolero, Bachata, Corrido, Trap Latino, Merengue, Cumbia, Balada Romántica
- Build songs section by section (Verse, Chorus, Bridge, Hook, Intro, Outro) or generate the full song at once
- Language mix options: Spanglish, Full Spanish, Mostly Spanish
- Powered by Claude (Anthropic API)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

## API Key

You'll need an [Anthropic API key](https://console.anthropic.com/). Enter it directly in the app — it stays in your browser and is only sent to Anthropic's API. It is never stored or logged.

## Tech Stack

- React 18
- Vite 5
- Claude Sonnet (claude-sonnet-4-5)
- CSS Modules

## License

MIT
