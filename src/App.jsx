import React, { useState, useCallback } from 'react'
import SectionCard from './components/SectionCard'
import { MUSIC_STYLES, LANG_OPTIONS, SECTION_LABELS, ADD_SECTIONS } from './lib/constants'
import { generateSection, continueSection, generateFullSong } from './lib/api'
import styles from './App.module.css'

export default function App() {
  const [idea, setIdea] = useState('')
  const [musicStyle, setMusicStyle] = useState('hiphop_jc')
  const [startSection, setStartSection] = useState('verse1')
  const [lang, setLang] = useState('spanglish')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [sections, setSections] = useState([])
  const [busy, setBusy] = useState(false)
  const [busySection, setBusySection] = useState(null)
  const [error, setError] = useState('')

  const styleGuide = MUSIC_STYLES[musicStyle]?.guide
  const langGuide = LANG_OPTIONS[lang]?.guide

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) { setError('Enter your idea first.'); return }
    if (!apiKey.trim()) { setError('Enter your Anthropic API key first.'); return }
    setError('')
    setBusy(true)
    setSections([])
    try {
      const result = await generateSection({
        idea, styleGuide, langGuide,
        sectionLabel: SECTION_LABELS[startSection],
        apiKey,
      })
      setSections([{ type: startSection, ...result }])
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }, [idea, styleGuide, langGuide, startSection, apiKey])

  const handleAddSection = useCallback(async (type) => {
    if (!apiKey.trim()) { setError('Enter your Anthropic API key first.'); return }
    setError('')
    setBusySection(type)
    try {
      const result = await continueSection({
        idea, styleGuide, langGuide,
        sectionLabel: SECTION_LABELS[type],
        existingSections: sections,
        apiKey,
      })
      setSections((prev) => [...prev, { type, ...result }])
    } catch (e) {
      setError(e.message)
    }
    setBusySection(null)
  }, [idea, styleGuide, langGuide, sections, apiKey])

  const handleFullSong = useCallback(async () => {
    if (!idea.trim()) { setError('Enter your idea first.'); return }
    if (!apiKey.trim()) { setError('Enter your Anthropic API key first.'); return }
    setError('')
    setBusy(true)
    setSections([])
    try {
      const result = await generateFullSong({ idea, styleGuide, langGuide, apiKey })
      setSections(result.sections)
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }, [idea, styleGuide, langGuide, apiKey])

  const isBusy = busy || busySection !== null

  return (
    <div className={styles.layout}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Spanish Lyric Writer</h1>
          <p className={styles.subtitle}>Type your idea in English — get real Spanish lyrics built for the genre.</p>
        </header>

        <div className={styles.form}>

          {/* API Key */}
          <div className={styles.field}>
            <label className={styles.label}>Anthropic API Key</label>
            <div className={styles.keyRow}>
              <input
                type={showKey ? 'text' : 'password'}
                className={styles.input}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button className={styles.toggleBtn} onClick={() => setShowKey((v) => !v)}>
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className={styles.hint}>Your key stays in your browser. Never sent anywhere except Anthropic's API.</p>
          </div>

          {/* Idea */}
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
            <div className={styles.field}>
              <label className={styles.label}>Start with</label>
              <select className={styles.select} value={startSection} onChange={(e) => setStartSection(e.target.value)}>
                {['verse1','chorus','intro','bridge'].map((s) => (
                  <option key={s} value={s}>{SECTION_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Language mix</label>
              <select className={styles.select} value={lang} onChange={(e) => setLang(e.target.value)}>
                {Object.entries(LANG_OPTIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary actions */}
          <div className={styles.actionRow}>
            <button className={styles.primaryBtn} onClick={handleGenerate} disabled={isBusy}>
              {busy && !busySection ? 'Writing...' : 'Write lyrics ↗'}
            </button>
            <button className={styles.secondaryBtn} onClick={handleFullSong} disabled={isBusy}>
              {busy && !busySection ? '...' : 'Full song ↗'}
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Results */}
        {sections.length > 0 && (
          <div className={styles.results}>
            <div className={styles.badge}>
              {MUSIC_STYLES[musicStyle]?.emoji} {MUSIC_STYLES[musicStyle]?.label} &middot; {LANG_OPTIONS[lang]?.label}
            </div>

            {sections.map((s, i) => (
              <SectionCard key={i} section={s} />
            ))}

            <div className={styles.addSection}>
              <p className={styles.addLabel}>Add a section</p>
              <div className={styles.addBtns}>
                {ADD_SECTIONS.map(({ type, label }) => (
                  <button
                    key={type}
                    className={styles.addBtn}
                    onClick={() => handleAddSection(type)}
                    disabled={isBusy}
                  >
                    {busySection === type ? '...' : label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
