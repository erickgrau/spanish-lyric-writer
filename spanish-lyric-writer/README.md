# Spanish Lyric Writer

Write your idea in English — get real Spanish song lyrics built for the genre.

Supports: Hip Hop (Jersey City), Reggaeton, Salsa, Bolero, Bachata, Corrido, Trap Latino, Merengue, Cumbia, Balada Romántica.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com and import the repo
3. Add this environment variable in Vercel project settings:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open http://localhost:3000
