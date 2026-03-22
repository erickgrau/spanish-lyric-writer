// pages/index.js
// Author: Chibitek Labs
// Date: 2026-03-22
// Description: Spanish Song Lyric Writer — type in English, get Spanish lyrics built for the genre.

import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const STYLE_OPTIONS = [
  { value: 'hiphop_jc', label: 'Hip Hop — Jersey City' },
  { value: 'reggaeton', label: 'Reggaeton' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'bolero', label: 'Bolero' },
  { value: 'bachata', label: 'Bachata' },
  { value: 'corrido', label: 'Corrido / Norteño' },
  { value: 'trap_latino', label: 'Trap Latino' },
  { value: 'merengue', label: 'Merengue' },
  { value: 'cumbia', label: 'Cumbia' },
  { value: 'romance', label: 'Balada Romántica' },
];

const LANG_OPTIONS = [
  { value: 'spanglish', label: 'Spanglish' },
  { value: 'full_spanish', label: 'Full Spanish' },
  { value: 'mostly_spanish', label: 'Mostly Spanish' },
];

const SECTION_OPTIONS = [
  { value: 'verse1', label: 'Verse 1' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'intro', label: 'Intro' },
  { value: 'bridge', label: 'Bridge' },
];

const ADD_SECTIONS = [
  { value: 'verse1', label: '+ Verse 1' },
  { value: 'verse2', label: '+ Verse 2' },
  { value: 'verse3', label: '+ Verse 3' },
  { value: 'chorus', label: '+ Chorus' },
  { value: 'bridge', label: '+ Bridge' },
  { value: 'intro', label: '+ Intro' },
  { value: 'outro', label: '+ Outro' },
  { value: 'hook', label: '+ Hook' },
];

const LABELS = {
  verse1: 'Verse 1', verse2: 'Verse 2', verse3: 'Verse 3',
  chorus: 'Chorus', bridge: 'Bridge', intro: 'Intro', outro: 'Outro', hook: 'Hook'
};

export default function Home() {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('hiphop_jc');
  const [lang, setLang] = useState('spanglish');
  const [startSection, setStartSection] = useState('verse1');
  const [sections, setSections] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  async function callAPI(body) {
    const res = await fetch('/api/lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  async function generate() {
    if (!idea.trim()) { setError('Enter your idea first.'); return; }
    setBusy(true); setError(''); setSections([]);
    setLoadingMsg('Writing lyrics...');
    try {
      const result = await callAPI({ idea, style, lang, section: startSection, mode: 'single' });
      setSections([{ type: startSection, ...result }]);
    } catch (e) { setError(e.message); }
    setBusy(false); setLoadingMsg('');
  }

  async function addSection(type) {
    if (busy) return;
    setBusy(true); setError('');
    setLoadingMsg(`Adding ${LABELS[type]}...`);
    try {
      const result = await callAPI({ idea, style, lang, section: type, mode: 'extend', existingSections: sections });
      setSections(prev => [...prev, { type, ...result }]);
    } catch (e) { setError(e.message); }
    setBusy(false); setLoadingMsg('');
  }

  async function generateFull() {
    if (!idea.trim()) { setError('Enter your idea first.'); return; }
    setBusy(true); setError(''); setSections([]);
    setLoadingMsg('Writing the full song — verse to outro...');
    try {
      const result = await callAPI({ idea, style, lang, mode: 'full' });
      setSections(result.sections || []);
    } catch (e) { setError(e.message); }
    setBusy(false); setLoadingMsg('');
  }

  const styleLabel = STYLE_OPTIONS.find(s => s.value === style)?.label;

  return (
    <>
      <Head>
        <title>Spanish Lyric Writer</title>
        <meta name="description" content="Write your idea in English, get Spanish lyrics built for the genre." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Spanish Lyric Writer</h1>
            <p className={styles.subtitle}>Type your idea in English — get real Spanish lyrics built for the genre.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your idea or theme (English)</label>
              <textarea
                className={styles.textarea}
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="e.g. Growing up in Jersey City, streets raised me, now chasing something bigger..."
                rows={3}
              />
            </div>

            <div className={styles.optionsRow}>
              <div className={styles.opt}>
                <label className={styles.label}>Music style</label>
                <select className={styles.select} value={style} onChange={e => setStyle(e.target.value)}>
                  {STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className={styles.opt}>
                <label className={styles.label}>Start with</label>
                <select className={styles.select} value={startSection} onChange={e => setStartSection(e.target.value)}>
                  {SECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className={styles.opt}>
                <label className={styles.label}>Language mix</label>
                <select className={styles.select} value={lang} onChange={e => setLang(e.target.value)}>
                  {LANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.btnRow}>
              <button className={styles.primaryBtn} onClick={generate} disabled={busy}>
                Write lyrics →
              </button>
              <button className={`${styles.primaryBtn} ${styles.outlineBtn}`} onClick={generateFull} disabled={busy}>
                Write full song →
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {busy && (
            <div className={styles.loadingBar}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
              <span className={styles.loadingText}>{loadingMsg}</span>
            </div>
          )}

          {sections.length > 0 && (
            <div className={styles.results}>
              <div className={styles.badge}>{styleLabel}</div>

              {sections.map((s, i) => (
                <div key={i} className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTag}>{LABELS[s.type] || s.type}</span>
                  </div>
                  <div className={styles.lyrics}>
                    {s.lyrics.split('\n').map((line, j) => (
                      <div key={j} className={styles.lyricsLine}>{line}</div>
                    ))}
                  </div>
                  <div className={styles.translation}>{s.translation}</div>
                  {s.rhyme_note && <div className={styles.rhymeNote}>{s.rhyme_note}</div>}
                </div>
              ))}

              <div className={styles.addSection}>
                <div className={styles.addLabel}>Add a section</div>
                <div className={styles.addBtns}>
                  {ADD_SECTIONS.map(sec => (
                    <button
                      key={sec.value}
                      className={`${styles.primaryBtn} ${styles.smBtn}`}
                      onClick={() => addSection(sec.value)}
                      disabled={busy}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
