const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

async function callClaude(system, user, apiKey) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  const raw = (data.content || [])
    .map((i) => i.text || '')
    .join('')
    .trim()
    .replace(/^```(?:json)?/, '')
    .replace(/```$/, '')
    .trim()

  return JSON.parse(raw)
}

const SYS_SINGLE = `You are a professional Spanish-language songwriter. Write song lyrics where rhymes and rhythm work in SPANISH — not translated English rhymes, but original lyrics where Spanish phonetics create the flow.
Respond ONLY with raw JSON, no markdown, no backticks, no explanation:
{"lyrics":"lines separated by \\n","translation":"natural 2-sentence English summary","rhyme_note":"one line describing the rhyme/flow scheme"}`

const SYS_FULL = `You are a professional Spanish-language songwriter. Write a complete song.
Respond ONLY with raw JSON, no markdown, no backticks:
{"sections":[{"type":"section_key","lyrics":"lines with \\n","translation":"2-sentence English summary","rhyme_note":"one line on rhyme"}]}
Valid section keys: intro, verse1, verse2, verse3, chorus, bridge, outro`

export async function generateSection({ idea, styleGuide, langGuide, sectionLabel, apiKey }) {
  const user = `Idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}
Section: ${sectionLabel}

Write 8 lines for the ${sectionLabel}. Rhymes must land in Spanish. Keep the rhythm tight for the genre.`

  return callClaude(SYS_SINGLE, user, apiKey)
}

export async function continueSection({ idea, styleGuide, langGuide, sectionLabel, existingSections, apiKey }) {
  const existing = existingSections
    .map((s) => `[${s.type.toUpperCase()}]\n${s.lyrics}`)
    .join('\n\n')

  const user = `Original idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}

Existing song:
${existing}

Now write the ${sectionLabel} (8 lines). Same voice, style, rhyme feel. Build on the story already set.`

  return callClaude(SYS_SINGLE, user, apiKey)
}

export async function generateFullSong({ idea, styleGuide, langGuide, apiKey }) {
  const user = `Idea: "${idea}"
Style: ${styleGuide}
Language: ${langGuide}

Write a complete song: intro, verse1, chorus, verse2, chorus, bridge, verse3, chorus, outro.
Each section 6-8 lines. Rhymes tight in Spanish. Consistent voice and story throughout.`

  return callClaude(SYS_FULL, user, apiKey)
}
