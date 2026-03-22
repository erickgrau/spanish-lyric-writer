const EDGE_FN_URL = 'https://ikoxpwdykeqqkfjanuju.supabase.co/functions/v1/generate-lyrics'

async function callEdgeFunction(system, userPrompt) {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, userPrompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

const SYS_SINGLE = `You are a professional Spanish-language songwriter. Write song lyrics where rhymes and rhythm work in SPANISH — not translated English rhymes, but original lyrics where Spanish phonetics create the flow.
Respond ONLY with raw JSON, no markdown, no backticks, no explanation:
{"lyrics":"lines separated by \\n","translation":"natural 2-sentence English summary","rhyme_note":"one line describing the rhyme/flow scheme"}`

const SYS_FULL = `You are a professional Spanish-language songwriter. Write a complete song.
Respond ONLY with raw JSON, no markdown, no backticks:
{"sections":[{"type":"section_key","lyrics":"lines with \\n","translation":"2-sentence English summary","rhyme_note":"one line on rhyme"}]}
Valid section keys: intro, verse1, verse2, verse3, chorus, bridge, outro`

const SYS_POLISH = `You are a professional Spanish-language songwriter and editor. The user has written Spanish lyrics. Your job is to polish them — improve rhythm, fix rhyme schemes, tighten the flow — while keeping their voice and intent.
Respond ONLY with raw JSON, no markdown, no backticks:
{"lyrics":"polished lines separated by \\n","translation":"natural 2-sentence English summary","rhyme_note":"one line describing what you changed and why","changes":"brief description of edits made"}`

const SYS_TRANSLATE = `You are a professional Spanish-English translator specializing in song lyrics. Translate the given Spanish lyrics into natural, poetic English that captures the feeling and meaning.
Respond ONLY with raw JSON, no markdown, no backticks:
{"translation":"full English translation line by line, separated by \\n","summary":"2-sentence summary of the song's meaning"}`

export async function generateSection({ idea, styleGuide, langGuide, sectionLabel }) {
  const userPrompt = `Idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}
Section: ${sectionLabel}

Write 8 lines for the ${sectionLabel}. Rhymes must land in Spanish. Keep the rhythm tight for the genre.`

  return callEdgeFunction(SYS_SINGLE, userPrompt)
}

export async function continueSection({ idea, styleGuide, langGuide, sectionLabel, existingSections }) {
  const existing = existingSections
    .map((s) => `[${s.type.toUpperCase()}]\n${s.lyrics}`)
    .join('\n\n')

  const userPrompt = `Original idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}

Existing song:
${existing}

Now write the ${sectionLabel} (8 lines). Same voice, style, rhyme feel. Build on the story already set.`

  return callEdgeFunction(SYS_SINGLE, userPrompt)
}

export async function generateFullSong({ idea, styleGuide, langGuide }) {
  const userPrompt = `Idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}

Write a complete song: intro, verse1, chorus, verse2, chorus, bridge, verse3, chorus, outro.
Each section 6-8 lines. Rhymes tight in Spanish. Consistent voice and story throughout.`

  return callEdgeFunction(SYS_FULL, userPrompt)
}

export async function polishLyrics({ lyrics, styleGuide, langGuide, sectionLabel }) {
  const userPrompt = `Style: ${styleGuide}
Language: ${langGuide}
Section: ${sectionLabel}

Here are the user's original lyrics:
${lyrics}

Polish these lyrics — improve rhythm, tighten rhyme schemes, keep their voice. Show what you changed.`

  return callEdgeFunction(SYS_POLISH, userPrompt)
}

export async function translateLyrics({ lyrics }) {
  const userPrompt = `Translate these Spanish lyrics to English:

${lyrics}`

  return callEdgeFunction(SYS_TRANSLATE, userPrompt)
}
