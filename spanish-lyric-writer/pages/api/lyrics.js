// pages/api/lyrics.js
// Author: Chibitek Labs
// Date: 2026-03-22
// Description: Serverside API route that calls Anthropic to generate Spanish song lyrics.
// The ANTHROPIC_API_KEY env var is never exposed to the browser.

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STYLES = {
  hiphop_jc: 'Jersey City hip hop — gritty bilingual Spanglish flow. References to Journal Square, PATH train, Bergenline Ave, bodegas, immigrant hustle. Cadence for 90bpm trap or boom bap. Hard-hitting bars, real talk, no fluff.',
  reggaeton: 'Reggaeton — dembow rhythm in the syllables, Caribbean slang, party energy, romance and flex. Hook-driven, catchy, built for the dancefloor.',
  salsa: 'Salsa — Afro-Caribbean storytelling, call and response, city streets meeting tropical heat. Rich imagery, built for a piano montuno.',
  bolero: 'Bolero — slow, emotional, cinematic. Deep Spanish metaphors, heartbreak and longing. Every line breathes.',
  bachata: 'Bachata — Dominican rhythm, raw emotion, love and pain. Simple but devastating language. Built for guitar and voice.',
  corrido: 'Corrido / Norteño — narrative folk tradition, accordion feel, northern Mexican border style. Proud, direct, cinematic.',
  trap_latino: 'Trap Latino — dark energy, loyalty, identity, money. Heavy bass feel in syllables. Auto-tune cadence implied.',
  merengue: 'Merengue — fast, rhythmic, rapid syllables mirroring the beat. Dominican energy, wit and celebration.',
  cumbia: 'Cumbia — Colombian roots, accordion feel, warm earthy Spanish, dance floor meets real life.',
  romance: 'Balada Romántica — lush orchestral feel in the words. Timeless romantic Spanish, sung slow and full of emotion.'
};

const LANG = {
  full_spanish: 'Write entirely in Spanish.',
  spanglish: 'Mix Spanish and English naturally — Spanglish. English anchors the feel, Spanish carries the emotion and rhyme.',
  mostly_spanish: 'Mostly Spanish with occasional English phrases for punch.'
};

const LABELS = {
  verse1: 'Verse 1', verse2: 'Verse 2', verse3: 'Verse 3',
  chorus: 'Chorus', bridge: 'Bridge', intro: 'Intro', outro: 'Outro', hook: 'Hook'
};

const SYS_SINGLE = `You are a professional Spanish-language songwriter. Write song lyrics where rhymes and rhythm work in SPANISH — not translated English rhymes, but original Spanish writing where the Spanish words create the rhythm and rhyme.

Respond ONLY with raw JSON, no markdown, no backticks, no explanation:
{"lyrics":"lines separated by \\n","translation":"natural English summary in 2 sentences","rhyme_note":"one line on rhyme/flow scheme"}`;

const SYS_FULL = `You are a professional Spanish-language songwriter. Write a complete song where rhymes and rhythm work in SPANISH.

Respond ONLY with raw JSON, no markdown, no backticks, no explanation:
{"sections":[{"type":"section_key","lyrics":"lines with \\n","translation":"2 sentence English summary","rhyme_note":"one line on rhyme"}]}
Valid section keys: intro, verse1, verse2, verse3, chorus, bridge, outro`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { idea, style, lang, section, mode, existingSections } = req.body;

  if (!idea || !style || !lang) {
    return res.status(400).json({ error: 'Missing required fields: idea, style, lang' });
  }

  try {
    let userPrompt;
    let systemPrompt;

    if (mode === 'full') {
      systemPrompt = SYS_FULL;
      userPrompt = `Idea: "${idea}"\nStyle: ${STYLES[style]}\nLanguage: ${LANG[lang]}\n\nWrite a complete song with: intro, verse1, chorus, verse2, chorus, bridge, verse3, chorus, outro. Each section 6-8 lines. Rhymes tight in Spanish. Consistent voice and story throughout.`;
    } else if (mode === 'extend' && existingSections?.length) {
      systemPrompt = SYS_SINGLE;
      const existing = existingSections.map(s => `[${LABELS[s.type]}]\n${s.lyrics}`).join('\n\n');
      userPrompt = `Original idea: "${idea}"\nStyle: ${STYLES[style]}\nLanguage: ${LANG[lang]}\n\nExisting song:\n${existing}\n\nNow write the ${LABELS[section]} (8 lines). Same voice, style, rhyme feel. Build on the story.`;
    } else {
      systemPrompt = SYS_SINGLE;
      userPrompt = `Idea: "${idea}"\nStyle: ${STYLES[style]}\nLanguage: ${LANG[lang]}\nSection: ${LABELS[section]}\n\nWrite 8 lines for the ${LABELS[section]}. Rhymes must land in Spanish. Keep the rhythm tight for the genre.`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const raw = message.content.map(b => b.text || '').join('').trim()
      .replace(/^```(?:json)?/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Anthropic error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate lyrics' });
  }
}
