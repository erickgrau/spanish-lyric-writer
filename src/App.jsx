import React, { useState, useCallback } from 'react'
import ModeToggle from './components/ModeToggle'
import SectionCard from './components/SectionCard'
import { MUSIC_STYLES, LANG_OPTIONS, SECTION_LABELS, ADD_SECTIONS } from './lib/constants'
import { generateSection, continueSection, generateFullSong, polishLyrics, translateLyrics } from './lib/api'
import styles from './App.module.css'

export default function App() {
  const [mode, setMode] = useState('ai')
  const [idea, setIdea] = useState('')
  const [musicStyle, setMusicStyle] = useState('hiphop_jc')
  const [startSection, setStartSection] = useState('verse1')
  const [lang, setLang] = useState('spanglish')
  const [sections, setSections] = useState([])
  const [busy, setBusy] = useState(false)
  const [busySection, setBusySection] = useState(null)
  const [polishingIdx, setPolishingIdx] = useState(null)
  const [translatingIdx, setTranslatingIdx] = useState(null)
  const [error, setError] = useState('')

  const styleGuide = MUSIC_STYLES[musicStyle]?.guide
  const langGuide = LANG_OPTIONS[lang]?.guide

  // --- AI MODE handlers ---
  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) { setError('Enter your idea first.'); return }
    setError('')
    setBusy(true)
    setSections([])
    try {
      const result = await generateSection({
        idea, styleGuide, langGuide,
        sectionLabel: SECTION_LABELS[startSection],
      })
      setSections([{ type: startSection, ...result }])
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }, [idea, styleGuide, langGuide, startSection])

  const handleAddSectionAI = useCallback(async (type) => {
    setError('')
    setBusySection(type)
    try {
      const result = await continueSection({
        idea, styleGuide, langGuide,
        sectionLabel: SECTION_LABELS[type],
        existingSections: sections,
      })
      setSections((prev) => [...prev, { type, ...result }])
    } catch (e) {
      setError(e.message)
    }
    setBusySection(null)
  }, [idea, styleGuide, langGuide, sections])

  const handleFullSong = useCallback(async () => {
    if (!idea.trim()) { setError('Enter your idea first.'); return }
    setError('')
    setBusy(true)
    setSections([])
    try {
      const result = await generateFullSong({ idea, styleGuide, langGuide })
      setSections(result.sections)
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }, [idea, styleGuide, langGuide])

  // --- STUDIO MODE handlers ---
  const handleAddSectionStudio = useCallback((type) => {
    setSections((prev) => [...prev, { type, lyrics: '', translation: '', rhyme_note: '' }])
  }, [])

  const handleLyricsChange = useCallback((idx, lyrics) => {
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, lyrics } : s))
  }, [])

  const handleRemoveSection = useCallback((idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const handlePolish = useCallback(async (idx) => {
    const section = sections[idx]
    if (!section?.lyrics.trim()) return
    setError('')
    setPolishingIdx(idx)
    try {
      const result = await polishLyrics({
        lyrics: section.lyrics,
        styleGuide,
        langGuide,
        sectionLabel: SECTION_LABELS[section.type],
      })
      setSections((prev) => prev.map((s, i) =>
        i === idx ? { ...s, lyrics: result.lyrics, rhyme_note: result.rhyme_note, translation: result.translation, changes: result.changes } : s
      ))
    } catch (e) {
      setError(e.message)
    }
    setPolishingIdx(null)
  }, [sections, styleGuide, langGuide])

  const handleTranslate = useCallback(async (idx) => {
    const section = sections[idx]
    if (!section?.lyrics.trim()) return
    setError('')
    setTranslatingIdx(idx)
    try {
      const result = await translateLyrics({ lyrics: section.lyrics })
      setSections((prev) => prev.map((s, i) =>
        i === idx ? { ...s, translation: result.translation } : s
      ))
    } catch (e) {
      setError(e.message)
    }
    setTranslatingIdx(null)
  }, [sections])

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode)
    setSections([])
    setError('')
  }, [])

  const isBusy = busy || busySection !== null

  return (
    <div className={styles.layout}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Spanish Lyric Writer</h1>
          <p className={styles.subtitle}>
            {mode === 'ai'
              ? 'Type your idea in English — get real Spanish lyrics built for the genre.'
              : 'Write your own Spanish lyrics — use AI to polish and translate.'}
          </p>
        </header>

        <ModeToggle mode={mode} onModeChange={handleModeChange} />

        <div className={styles.form}>

          {/* Shared: Idea field (AI mode) or Style config (both) */}
          {mode === 'ai' && (
            <div className={styles.field}>
              <label className={styles.label}>Your idea or theme (English)</label>
              <textarea
                className={styles.textarea}
                placeholder="e.g. Growing up in Jersey City, the streets raised me, now I'm chasing something bigger..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Options row */}
          <div className={styles.optionsRow}>
            <div className={styles.field}>
              <label className={styles.label}>Music style</label>
              <select className={styles.select} value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)}>
                {Object.entries(MUSIC_STYLES).map(([key, val]) => (
                  <option key={key} value={key}>{val.emoji} {val.label}</option>
                ))}
              </select>
            </div>
            {mode === 'ai' && (
              <div className={styles.field}>
                <label className={styles.label}>Start with</label>
                <select className={styles.select} value={startSection} onChange={(e) => setStartSection(e.target.value)}>
                  {['verse1','chorus','intro','bridge'].map((s) => (
                    <option key={s} value={s}>{SECTION_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Language mix</label>
              <select className={styles.select} value={lang} onChange={(e) => setLang(e.target.value)}>
                {Object.entries(LANG_OPTIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI mode actions */}
          {mode === 'ai' && (
            <div className={styles.actionRow}>
              <button className={styles.primaryBtn} onClick={handleGenerate} disabled={isBusy}>
                {busy && !busySection ? 'Writing...' : 'Write lyrics ↗'}
              </button>
              <button className={styles.secondaryBtn} onClick={handleFullSong} disabled={isBusy}>
                {busy && !busySection ? '...' : 'Full song ↗'}
              </button>
            </div>
          )}

          {/* Studio mode: add section buttons at top */}
          {mode === 'studio' && (
            <div className={styles.studioAddRow}>
              <p className={styles.studioAddLabel}>Add a section to start writing</p>
              <div className={styles.addBtns}>
                {ADD_SECTIONS.map(({ type, label }) => (
                  <button
                    key={type}
                    className={styles.addBtn}
                    onClick={() => handleAddSectionStudio(type)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Results / Workspace */}
        {sections.length > 0 && (
          <div className={styles.results}>
            <div className={styles.badge}>
              {MUSIC_STYLES[musicStyle]?.emoji} {MUSIC_STYLES[musicStyle]?.label} &middot; {LANG_OPTIONS[lang]?.label}
            </div>

            {sections.map((s, i) => (
              <SectionCard
                key={`${s.type}-${i}`}
                section={s}
                editable={mode === 'studio'}
                onLyricsChange={(lyrics) => handleLyricsChange(i, lyrics)}
                onPolish={() => handlePolish(i)}
                onTranslate={() => handleTranslate(i)}
                onRemove={() => handleRemoveSection(i)}
                polishing={polishingIdx === i}
                translating={translatingIdx === i}
              />
            ))}

            {/* AI mode: add more sections */}
            {mode === 'ai' && (
              <div className={styles.addSection}>
                <p className={styles.addLabel}>Add a section</p>
                <div className={styles.addBtns}>
                  {ADD_SECTIONS.map(({ type, label }) => (
                    <button
                      key={type}
                      className={styles.addBtn}
                      onClick={() => handleAddSectionAI(type)}
                      disabled={isBusy}
                    >
                      {busySection === type ? '...' : label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Studio mode: add more sections at bottom too */}
            {mode === 'studio' && (
              <div className={styles.addSection}>
                <p className={styles.addLabel}>Add another section</p>
                <div className={styles.addBtns}>
                  {ADD_SECTIONS.map(({ type, label }) => (
                    <button
                      key={type}
                      className={styles.addBtn}
                      onClick={() => handleAddSectionStudio(type)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
